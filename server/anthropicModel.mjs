/** Default Claude model (Sonnet 4.6). Override with ANTHROPIC_MODEL in env. */
export const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-6';

export function getAnthropicModel() {
  const fromEnv = process.env.ANTHROPIC_MODEL?.trim();
  return fromEnv || DEFAULT_ANTHROPIC_MODEL;
}
