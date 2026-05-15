# SOW for FDE

Generate SOW-style requirement documents from voice/chat sales call transcripts (Claude API).

## Local development

```bash
npm install
cp .env.example .env
# Set ANTHROPIC_API_KEY in .env
npm run dev
```

Open the URL Vite prints (default http://localhost:5175).

---

## Deploy on Vercel **without GitHub login**

You do **not** need `gh auth login` or a GitHub password. GitHub no longer accepts account passwords for Git/API — that often causes “incorrect username or password.”

### Option A — Vercel website only (easiest)

1. Sign in at [vercel.com](https://vercel.com) using **Continue with Google** or **Continue with GitHub** (not email/password if that fails).
2. On your Mac, zip or upload is **not** needed — use **Deploy from CLI with a token** (Option B) **or**:
3. **Deploy without Git:** In the Vercel dashboard → **Add New…** → **Project** → tab **Import Git Repository** is optional. Instead use CLI (Option B).

To use the dashboard **with** Git but **without** `gh` password:

- Create a repo on [github.com/new](https://github.com/new) while logged in via **Google/GitHub SSO** in the browser.
- Push using a **Personal Access Token** (not your GitHub password):

```bash
cd /path/to/sow-for-fde
git remote add origin https://github.com/YOUR_USERNAME/sow-fde.git
git push -u origin main
# Username: YOUR_USERNAME
# Password: paste a GitHub PAT (see below)
```

**Create a GitHub PAT (no password for Git):** GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate** → scope `repo` → copy token and use it as the **password** when `git push` asks.

Then in Vercel: [vercel.com/new](https://vercel.com/new) → Import that repo → add **`ANTHROPIC_API_KEY`** under Environment Variables → Deploy.

### Option B — Vercel token only (no GitHub at all)

No `vercel login`, no GitHub.

1. Sign in on [vercel.com](https://vercel.com) (Google/GitHub SSO).
2. Open [vercel.com/account/tokens](https://vercel.com/account/tokens) → **Create** → copy the token.
3. In `sow-for-fde/.env` add:

```env
VERCEL_TOKEN=your_vercel_token_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

4. Deploy from Terminal:

```bash
cd /path/to/sow-for-fde
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

The script deploys to production and syncs `ANTHROPIC_API_KEY` to Vercel. It prints your live URL (e.g. `https://sow-for-fde-….vercel.app`).

### Option C — Vercel CLI token (manual commands)

```bash
cd /path/to/sow-for-fde
export VERCEL_TOKEN=your_token
export ANTHROPIC_API_KEY=your_key

npx vercel@latest deploy --prod --yes --token="$VERCEL_TOKEN"

# Add API key to the project (once)
printf '%s' "$ANTHROPIC_API_KEY" | npx vercel@latest env add ANTHROPIC_API_KEY production --token="$VERCEL_TOKEN"
```

Redeploy after adding env vars if the first deploy ran before the key was set.

### If `./scripts/deploy.sh` looks “stuck” on `…vercel.appBuilding…`

That line often means the **CLI is still waiting for Vercel’s build** (2–6+ minutes). It is not frozen just because there is no new line after the URL.

- Wait a few more minutes, **or**
- Open your project on [vercel.com/dashboard](https://vercel.com/dashboard) → latest deployment → **View build logs**.
- If you hit **Ctrl+C** too early, the deployment may still finish; check the dashboard and open **https://sow-for-fde.vercel.app/api/health**.

### Dashboard shows **Blocked** (commit message in the UI)

That line is usually your **git commit title**, not an instruction from Vercel.

1. Click the deployment → open **Build Logs** for the **real** message.
2. **Git author:** Vercel can block if the commit email does not match GitHub. Fix: `git config user.email`, or deploy with **`./scripts/deploy.sh`**.

### `refusing to allow a Personal Access Token … workflow … without workflow scope`

GitHub needs the **`workflow`** scope on a classic PAT to push files under **`.github/workflows/`**.

**Either:** enable **`workflow`** on your token and push again, **or** this project has **no** Actions workflow (deploy with **`./scripts/deploy.sh`** / Vercel), so a **`repo`**-only token works.

### “Commit author email … @….local is not valid” (Vercel blocked deployment)

Git on macOS often uses a fake address like `you@Your-MacBook-Air.local`. Vercel requires a **real email that matches your GitHub account** (the one verified under GitHub → Settings → Emails).

**Fix for future commits (one-time):**

```bash
git config --global user.email "YOUR_GITHUB_VERIFIED_EMAIL"
git config --global user.name "Your Name"
```

Use the **same** `user.email` GitHub shows as primary/verified.

**Trigger a new deployment** with a valid author (pick one):

```bash
cd /path/to/sow-for-fde
git commit --allow-empty -m "chore: deploy with verified git author"
git push
```

**Or** amend the last commit (rewrites history — use only if you’re alone on the branch):

```bash
git commit --amend --reset-author --no-edit
git push --force-with-lease
```

**Bypass Git author checks:** deploy from your machine with **`./scripts/deploy.sh`** (Vercel token) so production updates don’t depend on git metadata.

---

## If Vercel says “incorrect username or password”

- Use **Continue with Google** or **Continue with GitHub** on [vercel.com/login](https://vercel.com/login), not email/password.
- Or skip login entirely for CLI: use a **token** from [vercel.com/account/tokens](https://vercel.com/account/tokens) (Option B).

## If GitHub says “incorrect username or password”

- Do **not** use your GitHub account password for `git push`.
- Use a **Personal Access Token** as the password (see Option A), or skip GitHub and use **Option B**.

---

## API routes (production)

- `GET /api/health` — health check
- `POST /api/generate` — body `{ "transcript": "..." }`

Static app from `dist/`; API via `api/index.mjs` on Vercel.
