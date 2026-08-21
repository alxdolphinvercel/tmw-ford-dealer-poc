import ts from "typescript";

/**
 * Applies content edits to a TypeScript source file by replacing individual
 * string literals, located by dotted path.
 *
 * The agent never writes TypeScript. It returns paths and new values; this
 * module finds the exact string-literal node for each path and splices the new
 * text in by character offset. That means a generated edit cannot introduce a
 * syntax error, drop a field, or reformat the file — the three ways an LLM
 * rewriting a config file breaks a build.
 *
 * Paths use dots for properties and numeric segments for array indices:
 *   alert.text
 *   location.departments.1.hours.0.time
 *   FORD_CAMPAIGNS.powerPromise.body.0
 */

export interface Edit {
  path: string;
  value: string;
}

export interface AppliedEdit extends Edit {
  before: string;
}

/** A string literal found in the source, with its exact character range. */
interface Located {
  start: number;
  end: number;
  text: string;
}

function parse(source: string, fileName = "config.ts") {
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
}

/** Walks `path` through the AST and returns the node it names, if any. */
function resolve(source: string, path: string): ts.Node | null {
  const file = parse(source);
  const segments = path.split(".");

  // Map every top-level `const x = ...` so files with several exports work.
  // The dealer configs export one object (`dealer`), while template/lib/ford.ts
  // exports FORD, NAV, FORD_CAMPAIGNS and the footer lists.
  const declarations = new Map<string, ts.Node>();
  file.forEachChild((child) => {
    if (!ts.isVariableStatement(child)) return;
    for (const decl of child.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.initializer) {
        declarations.set(decl.name.text, decl.initializer);
      }
    }
  });
  if (declarations.size === 0) return null;

  // A leading segment naming an export selects it; otherwise, when the file has
  // a single export, paths may start straight at its fields.
  let node: ts.Node | undefined;
  let rest = segments;
  const first = segments[0];
  if (first && declarations.has(first)) {
    node = declarations.get(first);
    rest = segments.slice(1);
  } else if (declarations.size === 1) {
    node = [...declarations.values()][0];
  }
  if (!node) return null;

  for (const segment of rest) {
    node = step(node, segment);
    if (!node) return null;
  }
  return node;
}

/** Resolves a path to a string literal, or null if it is not editable text. */
function locate(source: string, path: string): Located | null {
  const node = resolve(source, path);
  if (
    !node ||
    (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node))
  ) {
    return null;
  }
  return {
    // +1 / -1 to sit inside the quote characters.
    start: node.getStart(node.getSourceFile()) + 1,
    end: node.getEnd() - 1,
    text: node.text,
  };
}

/** Resolves one path segment against the current node. */
function step(node: ts.Node, segment: string): ts.Node | undefined {
  // Unwrap `as const`, parentheses, and satisfies expressions.
  while (
    ts.isAsExpression(node) ||
    ts.isParenthesizedExpression(node) ||
    ts.isSatisfiesExpression(node)
  ) {
    node = node.expression;
  }

  const index = Number(segment);
  if (Number.isInteger(index) && ts.isArrayLiteralExpression(node)) {
    return node.elements[index];
  }

  if (ts.isObjectLiteralExpression(node)) {
    for (const prop of node.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const name = prop.name;
      const key = ts.isIdentifier(name)
        ? name.text
        : ts.isStringLiteral(name)
          ? name.text
          : null;
      if (key === segment) return prop.initializer;
    }
  }
  return undefined;
}

/** Reads the current value at a path, or null if it is not an editable string. */
export function readPath(source: string, path: string): string | null {
  return locate(source, path)?.text ?? null;
}

/**
 * Expands an allowlist pattern into the concrete paths that exist in `source`.
 *
 * Only a whole segment equal to "N" is an index placeholder. Matching on the
 * substring "N" would also match the N inside identifiers such as
 * FORD_CAMPAIGNS, which silently corrupts every national path.
 */
export function expandPath(source: string, pattern: string): string[] {
  const segments = pattern.split(".");
  let prefixes: string[][] = [[]];

  for (const segment of segments) {
    const next: string[][] = [];
    for (const prefix of prefixes) {
      if (segment !== "N") {
        next.push([...prefix, segment]);
        continue;
      }
      // Walk indices upward until one is absent; arrays here are short and dense.
      for (let i = 0; i < 64; i++) {
        const candidate = [...prefix, String(i)];
        if (!exists(source, candidate.join("."))) break;
        next.push(candidate);
      }
    }
    prefixes = next;
  }

  return prefixes
    .map((parts) => parts.join("."))
    .filter((path) => readPath(source, path) !== null);
}

/** True if any node exists at `path`, string literal or not. */
function exists(source: string, path: string): boolean {
  return resolve(source, path) !== null;
}

/**
 * Applies every edit to the source and returns the new text.
 *
 * Edits are applied back-to-front so earlier offsets stay valid, and the result
 * is re-parsed: any syntax diagnostic aborts the whole batch rather than
 * committing a broken file.
 */
export function applyEdits(
  source: string,
  edits: Edit[]
): { source: string; applied: AppliedEdit[] } {
  const located = edits.map((edit) => {
    const found = locate(source, edit.path);
    if (!found) {
      throw new Error(
        `Cannot edit "${edit.path}" — no editable text found at that path.`
      );
    }
    return { edit, found };
  });

  const ordered = [...located].sort((a, b) => b.found.start - a.found.start);

  let next = source;
  for (const { edit, found } of ordered) {
    next =
      next.slice(0, found.start) + escape(edit.value) + next.slice(found.end);
  }

  const reparsed = parse(next);
  const syntactic = (reparsed as unknown as { parseDiagnostics?: unknown[] })
    .parseDiagnostics;
  if (syntactic && syntactic.length > 0) {
    throw new Error(
      "Edit produced invalid TypeScript and was discarded. No change was made."
    );
  }

  return {
    source: next,
    applied: located.map(({ edit, found }) => ({ ...edit, before: found.text })),
  };
}

/** Escapes a value for insertion inside a double-quoted TS string literal. */
function escape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}
