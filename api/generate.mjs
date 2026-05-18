import '../server/loadProjectEnv.mjs';
import { createApp } from '../server/app.mjs';

const app = createApp();

/** Vercel serverless: POST /api/generate */
export default function handler(req, res) {
  app(req, res);
}

export const config = {
  maxDuration: 60,
};
