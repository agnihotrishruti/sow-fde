import { getAnthropicModel } from '../server/anthropicModel.mjs';

/** Vercel serverless: GET /api/health */
export default function handler(req, res) {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const MODEL = getAnthropicModel();
  const keyConfigured = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, model: MODEL, anthropicKeyConfigured: keyConfigured });
}
