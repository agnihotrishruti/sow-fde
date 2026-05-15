import '../server/loadProjectEnv.mjs';
import { createApp } from '../server/app.mjs';

/** Vercel serverless: serves /api/health and /api/generate */
export default createApp();
