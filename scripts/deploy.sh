#!/usr/bin/env bash
# Deploy to Vercel using VERCEL_TOKEN only — no `vercel login`, no GitHub required.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "Missing VERCEL_TOKEN in .env"
  echo "Create one at https://vercel.com/account/tokens"
  exit 1
fi

if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "Missing ANTHROPIC_API_KEY in .env"
  exit 1
fi

# Non-interactive mode for CI / local scripts (avoids prompts & odd TTY behavior)
export CI=1
export VERCEL_TELEMETRY_DISABLED=1

VERCEL=(npx vercel@latest --token="$VERCEL_TOKEN" --non-interactive)

echo "==> Pushing ANTHROPIC_API_KEY to Vercel (production) — safe to re-run"
# Remove existing value so `env add` never blocks on “already exists”
"${VERCEL[@]}" env remove ANTHROPIC_API_KEY production -y 2>/dev/null || true
printf '%s' "$ANTHROPIC_API_KEY" | "${VERCEL[@]}" env add ANTHROPIC_API_KEY production

if [[ -n "${ANTHROPIC_MODEL:-}" ]]; then
  "${VERCEL[@]}" env remove ANTHROPIC_MODEL production -y 2>/dev/null || true
  printf '%s' "$ANTHROPIC_MODEL" | "${VERCEL[@]}" env add ANTHROPIC_MODEL production
fi

echo ""
echo "==> Deploying production (this can take 2–6 minutes; URL may appear before “Building” finishes)"
echo "    If the terminal looks stuck after a URL, it is usually still building on Vercel."
echo "    Open the Inspect link in the output, or: https://vercel.com/dashboard"
echo ""

# Do NOT pipe into grep — that can truncate output or confuse the CLI
"${VERCEL[@]}" deploy --prod --yes

echo ""
echo "==> Done."
echo "    App (alias):   https://sow-for-fde.vercel.app"
echo "    Health check:  https://sow-for-fde.vercel.app/api/health"
echo "    Expect: anthropicKeyConfigured = true"
