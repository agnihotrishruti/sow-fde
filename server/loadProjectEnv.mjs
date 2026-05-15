import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Repo root (parent of `server/`, same folder as `package.json` and `.env`). */
export const PROJECT_ROOT = path.resolve(__dirname, '..');

// `override: true` so values from `.env` win over empty or stale shell exports (e.g. ANTHROPIC_API_KEY="").
dotenv.config({ path: path.join(PROJECT_ROOT, '.env'), override: true });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });
