import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { runFeasibilityStudy } from './feasibilityHandler.mjs';
import { getAnthropicModel } from './anthropicModel.mjs';
import { SYSTEM_PROMPT } from './systemPrompt.mjs';

/** Shared Express app (used by standalone `server/index.mjs` and Vite dev middleware). */
export function createApp() {
  const app = express();
  const MODEL = getAnthropicModel();

  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '2mb' }));

  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ error: 'Invalid JSON', detail: 'Request body must be valid JSON.' });
      return;
    }
    next(err);
  });

  app.get('/api/health', (_req, res) => {
    const keyConfigured = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    res.json({ ok: true, model: MODEL, anthropicKeyConfigured: keyConfigured });
  });

  app.post('/api/generate', async (req, res) => {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      res.status(500).json({
        error: 'Server misconfiguration',
        detail:
          'ANTHROPIC_API_KEY is missing or empty. Set it in project environment variables (e.g. Vercel → Settings → Environment Variables, or local `.env`). See `.env.example`.',
      });
      return;
    }

    const transcript =
      typeof req.body?.transcript === 'string' ? req.body.transcript.trim() : '';
    if (!transcript) {
      res.status(400).json({ error: 'Missing transcript', detail: 'Send JSON { "transcript": "..." }.' });
      return;
    }
    if (transcript.length < 80) {
      res.status(400).json({
        error: 'Transcript too short',
        detail: 'Paste a meaningful excerpt (at least ~80 characters) so the model can extract structure.',
      });
      return;
    }

    const anthropic = new Anthropic({ apiKey });

    try {
      const msg = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 16384,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `The following is the full sales call transcript (it may be in any language). Generate the full requirement document per your instructions (including **Engagement overview** after the title) — **output in English only**.\n\n---\n\n${transcript}`,
          },
        ],
      });

      const textBlocks = msg.content.filter((b) => b.type === 'text').map((b) => b.text);
      const document = textBlocks.join('\n').trim();
      if (!document) {
        res.status(502).json({ error: 'Empty model response', detail: 'Try again or shorten the transcript.' });
        return;
      }

      res.json({ document, model: msg.model, usage: msg.usage });
    } catch (err) {
      const status = err?.status ?? 500;
      const detail = err?.message ?? String(err);
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: 'Generation failed',
        detail,
      });
    }
  });

  app.post('/api/feasibility', async (req, res) => {
    const botType =
      typeof req.body?.botType === 'string' ? req.body.botType.trim() : 'voice_bot';
    const requirement =
      typeof req.body?.requirement === 'string' ? req.body.requirement.trim() : '';

    if (!requirement) {
      res.status(400).json({
        error: 'Missing requirement',
        detail: 'Send JSON { "requirement": "...", "botType": "voice_bot" | "chat_bot" }.',
      });
      return;
    }
    if (requirement.length < 80) {
      res.status(400).json({
        error: 'Requirement too short',
        detail: 'Paste a meaningful requirement or transcript (at least ~80 characters).',
      });
      return;
    }

    try {
      const result = await runFeasibilityStudy({ requirement, botType });
      res.json(result);
    } catch (err) {
      const status = err?.status ?? 500;
      const detail = err?.message ?? String(err);
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: 'Feasibility check failed',
        detail,
      });
    }
  });

  app.use((err, _req, res, _next) => {
    if (res.headersSent) return;
    res.status(500).json({
      error: 'Server error',
      detail: err instanceof Error ? err.message : String(err),
    });
  });

  return app;
}
