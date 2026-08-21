/**
 * The GitHub side of the agent: read files, commit a branch, open a PR, and
 * find the Vercel preview URLs.
 *
 * Plain fetch against the REST API — no SDK. Commits are built through the git
 * data API (blob → tree → commit) so every mirrored file lands in one commit,
 * which keeps the PR diff readable and the change atomic.
 *
 * Preview URLs come from GitHub's own deployments API: Vercel posts a
 * deployment per project as `vercel[bot]`, so the same token covers both and
 * the agent needs no Vercel credentials.
 */

const OWNER = process.env.GITHUB_OWNER ?? "alxdolphinvercel";
const REPO = process.env.GITHUB_REPO ?? "tmw-ford-dealer-poc";
const BASE = "main";
const API = "https://api.github.com";

function headers() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not configured.");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

async function gh<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, headers: headers() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status} on ${path}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

/** Reads a file's text at the base branch. */
export async function readFile(path: string): Promise<string> {
  const data = await gh<{ content: string; encoding: string }>(
    `/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}?ref=${BASE}`
  );
  return Buffer.from(data.content, "base64").toString("utf8");
}

export interface FileChange {
  path: string;
  content: string;
}

/** Commits all changes on a new branch and opens a pull request. */
export async function openPullRequest(opts: {
  branch: string;
  title: string;
  body: string;
  changes: FileChange[];
}): Promise<{ number: number; url: string; branch: string; sha: string }> {
  const { branch, title, body, changes } = opts;

  const baseRef = await gh<{ object: { sha: string } }>(
    `/repos/${OWNER}/${REPO}/git/ref/heads/${BASE}`
  );
  const baseSha = baseRef.object.sha;

  const baseCommit = await gh<{ tree: { sha: string } }>(
    `/repos/${OWNER}/${REPO}/git/commits/${baseSha}`
  );

  // One blob per changed file, then a single tree and commit.
  const tree = await Promise.all(
    changes.map(async (change) => {
      const blob = await gh<{ sha: string }>(
        `/repos/${OWNER}/${REPO}/git/blobs`,
        {
          method: "POST",
          body: JSON.stringify({ content: change.content, encoding: "utf-8" }),
        }
      );
      return {
        path: change.path,
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      };
    })
  );

  const newTree = await gh<{ sha: string }>(
    `/repos/${OWNER}/${REPO}/git/trees`,
    {
      method: "POST",
      body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree }),
    }
  );

  const commit = await gh<{ sha: string }>(
    `/repos/${OWNER}/${REPO}/git/commits`,
    {
      method: "POST",
      body: JSON.stringify({
        message: title,
        tree: newTree.sha,
        parents: [baseSha],
      }),
    }
  );

  await gh(`/repos/${OWNER}/${REPO}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }),
  });

  const pr = await gh<{ number: number; html_url: string }>(
    `/repos/${OWNER}/${REPO}/pulls`,
    {
      method: "POST",
      body: JSON.stringify({ title, body, head: branch, base: BASE }),
    }
  );

  // The head SHA, not the branch name, is what deployments are keyed on.
  return { number: pr.number, url: pr.html_url, branch, sha: commit.sha };
}

export interface Preview {
  project: string;
  url: string;
  state: string;
}

/**
 * Looks up the Vercel preview deployments for a commit.
 *
 * Keyed on the commit SHA, not the branch: GitHub registers deployments against
 * the SHA, and querying by `ref` returns nothing. Vercel creates one deployment
 * per project named "Preview – <project>" and puts the live preview URL in its
 * latest status's `environment_url`.
 *
 * Because this is a monorepo, every push builds all six projects. `projects`
 * filters to the ones the edit actually affects, so a single-dealer change does
 * not show five irrelevant previews.
 */
export async function getPreviews(
  sha: string,
  projects: string[]
): Promise<Preview[]> {
  const deployments = await gh<{ id: number; environment: string }[]>(
    `/repos/${OWNER}/${REPO}/deployments?sha=${encodeURIComponent(sha)}`
  );

  const relevant = deployments
    .map((deployment) => ({
      id: deployment.id,
      project: deployment.environment.replace(/^Preview\s*[–-]\s*/, "").trim(),
    }))
    .filter((d) => projects.includes(d.project));

  const previews = await Promise.all(
    relevant.map(async (deployment) => {
      const statuses = await gh<
        { state: string; environment_url?: string }[]
      >(`/repos/${OWNER}/${REPO}/deployments/${deployment.id}/statuses`);
      // Statuses are newest-first; prefer one that carries a URL.
      const withUrl = statuses.find((s) => s.environment_url);
      return {
        project: deployment.project,
        url: withUrl?.environment_url ?? "",
        state: withUrl?.state ?? statuses[0]?.state ?? "pending",
      };
    })
  );

  return previews.filter((p) => p.url);
}

export const repoInfo = { owner: OWNER, repo: REPO, base: BASE };
