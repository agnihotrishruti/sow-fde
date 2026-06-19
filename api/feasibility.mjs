import '../server/loadProjectEnv.mjs';
import { createApp } from '../server/app.mjs';
import { createVercelExpressHandler } from '../server/vercelExpressHandler.mjs';

const app = createApp();

/** Vercel serverless: POST /api/feasibility */
export default createVercelExpressHandler(app);

export const config = {
  maxDuration: 60,
};
