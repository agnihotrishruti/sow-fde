/** ~35k chars keeps input + generation within Vercel's 60s limit on most calls. */
export const MAX_TRANSCRIPT_CHARS = 35_000;
export const MAX_REQUIREMENT_CHARS = 25_000;

/**
 * Trim very long pasted text: keep start + end so opening context and closing decisions survive.
 */
export function prepareLongText(text, maxChars) {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) {
    return { text: trimmed, truncated: false, originalLength: trimmed.length };
  }

  const noticeBudget = 180;
  const bodyBudget = maxChars - noticeBudget;
  const headLen = Math.floor(bodyBudget * 0.65);
  const tailLen = bodyBudget - headLen;
  const omitted = trimmed.length - headLen - tailLen;

  const notice =
    `\n\n[--- ${omitted.toLocaleString()} characters omitted from the middle to fit processing limits; ` +
    `beginning and end of the source text are retained ---]\n\n`;

  return {
    text: trimmed.slice(0, headLen) + notice + trimmed.slice(-tailLen),
    truncated: true,
    originalLength: trimmed.length,
  };
}
