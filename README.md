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

## Deploy on Vercel (via GitHub)

### 1. Push this folder to GitHub

From the `sow-for-fde` directory:

```bash
git init
git add .
git commit -m "Initial commit: SOW for FDE"
gh repo create sow-for-fde --public --source=. --push
```

Or create a repo on [github.com/new](https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/sow-for-fde.git
git push -u origin main
```

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your GitHub repository `sow-for-fde`
3. Framework preset: **Vite** (auto-detected from `vercel.json`)
4. **Environment variables** → add:
   - `ANTHROPIC_API_KEY` — your Anthropic API key (required)
   - `ANTHROPIC_MODEL` — optional (default `claude-sonnet-4-20250514`)
5. Click **Deploy**

Each push to `main` triggers a new production deployment.

### API routes (production)

- `GET /api/health` — health check
- `POST /api/generate` — body `{ "transcript": "..." }`

The static app is served from `dist/`; API runs as a Vercel serverless function (`api/index.mjs`).
