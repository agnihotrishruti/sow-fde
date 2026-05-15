import DOMPurify from 'dompurify';
import { parse, setOptions } from 'marked';
import { enhanceRequirementHtml } from './enhanceRequirementHtml';

setOptions({
  gfm: true,
  breaks: true,
});

/** Markdown → HTML for UI + PDF, XSS-safe, with layout enhancements. */
export function markdownToSafeHtml(markdown: string): string {
  const raw = parse(markdown, { async: false });
  const safe = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
  const enhanced = enhanceRequirementHtml(safe);
  // If post-processing ever empties the tree, fall back to sanitized markdown HTML.
  return enhanced.replace(/\s/g, '') ? enhanced : safe;
}
