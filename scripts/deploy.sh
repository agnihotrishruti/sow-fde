#!/usr/bin/env bash
# One-shot deploy: GitHub push + Vercel production (requires VERCEL_TOKEN in env or .env)
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "Missing VERCEL_TOKEN."
  echo "Create one at https://vercel.com/account/tokens then:"
  echo "  export VERCEL_TOKEN=your_token"
  echo "Or add VERCEL_TOKEN=... to .env"
  exit 1
fi

if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "Missing ANTHROPIC_API_KEY in environment or .env"
  exit 1
fi

echo "Deploying to Vercel (production)..."
npx vercel@latest deploy --prod --yes --token="$VERCEL_TOKEN"

echo ""
echo "Set production env on Vercel (if not already):"
echo "  npx vercel env add ANTHROPIC_API_KEY production --token=\"\$VERCEL_TOKEN\""
echo ""
echo "Optional GitHub push:"
echo "  gh repo create sow-for-fde --public --source=. --push"
