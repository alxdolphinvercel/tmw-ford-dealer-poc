#!/usr/bin/env bash
#
# Stamps the shared template into five self-contained, separately deployable
# Vercel sites. Each output directory is a complete Next.js app whose ONLY
# difference from its siblings is dealer.config.ts — which is the proof the
# proof-of-concept exists to demonstrate.
#
# Usage:  ./build-sites.sh          # stamp all five
#         ./build-sites.sh hendy    # stamp one (substring match)

set -euo pipefail
cd "$(dirname "$0")"

SITES=(
  "lookers-ford"
  "evanshalshaw-ford"
  "allen-motor-group-ford"
  "group1-ford"
  "hendy-ford"
)

FILTER="${1:-}"

for site in "${SITES[@]}"; do
  if [[ -n "$FILTER" && "$site" != *"$FILTER"* ]]; then continue; fi

  echo "→ $site"

  # A running dev server holds .next open and makes rm -rf fail part-way,
  # which would leave a half-stamped site that still "builds" from stale files.
  if ! rm -rf "$site" 2>/dev/null; then
    echo "   ! could not remove $site — is a dev server still running on it?" >&2
    exit 1
  fi
  mkdir -p "$site"

  # Template sources, minus build output and installed packages.
  for item in app components lib public next.config.ts tsconfig.json next-env.d.ts; do
    cp -R "template/$item" "$site/" 2>/dev/null || true
  done

  # Per-dealer content — the Flexible/Free layer.
  cp "configs/$site.ts" "$site/dealer.config.ts"

  # Each site is its own npm project so Vercel can build it in isolation.
  sed "s/\"name\": \"ford-dealer-template\"/\"name\": \"$site\"/" \
    template/package.json > "$site/package.json"

  cat > "$site/.gitignore" <<'EOF'
node_modules
.next
.vercel
.env.local
package-lock.json
AGENTS.md
CLAUDE.md
EOF

  cat > "$site/vercel.json" <<'EOF'
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs"
}
EOF
done

echo
echo "Done. Each directory is standalone:  cd <site> && npm install && npm run build"
