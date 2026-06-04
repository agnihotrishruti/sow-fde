import Anthropic from '@anthropic-ai/sdk';
import { buildFeasibilitySystemPrompt } from './feasibilityPrompt.mjs';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
const VALID_BOT_TYPES = new Set(['voice_bot', 'chat_bot']);

export async function runFeasibilityStudy({ requirement, botType }) {
  if (!VALID_BOT_TYPES.has(botType)) {
    const err = new Error('Invalid botType. Use voice_bot or chat_bot.');
    err.status = 400;
    throw err;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    const err = new Error(
      'ANTHROPIC_API_KEY is missing. Set it in environment variables or local `.env`.',
    );
    err.status = 500;
    throw err;
  }

  let system;
  try {
    system = buildFeasibilitySystemPrompt(botType);
  } catch (e) {
    const err = new Error(e instanceof Error ? e.message : 'Invalid botType.');
    err.status = 400;
    throw err;
  }

  const anthropic = new Anthropic({ apiKey });

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system,
    messages: [
      {
        role: 'user',
        content: `Now analyse the requirement provided by the user (may be in any language; respond in English):

---

${requirement}`,
      },
    ],
  });

  const textBlocks = msg.content.filter((b) => b.type === 'text').map((b) => b.text);
  const report = textBlocks.join('\n').trim();
  if (!report) {
    const err = new Error('Empty model response');
    err.status = 502;
    throw err;
  }

  return { report, model: msg.model, usage: msg.usage, botType };
}
