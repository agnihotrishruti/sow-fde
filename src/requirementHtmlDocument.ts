import { wrapExportDocumentBody } from './documentExportSurface';
import { markdownToSafeHtml } from './markdownHtml';

/** Embedded print / screen styles for the standalone HTML view (no external CSS). */
const STANDALONE_CSS = `
:root {
  color-scheme: light;
  --ink: #0f1419;
  --ink-soft: #2a3344;
  --muted: #5a6578;
  --line: #d8dee8;
  --surface: #f7f9fc;
  --accent: #1a5a94;
  --accent-soft: #e8f2fa;
  --font-sans: "DM Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
}

*, *::before, *::after { box-sizing: border-box; }

html {
  font-size: 17px;
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  line-height: 1.58;
  color: #111111;
  background: #ffffff;
}

.doc-banner {
  background: linear-gradient(135deg, #0f1a28 0%, #1a2d44 100%);
  color: #e8edf5;
  padding: 1.35rem 1.5rem 1.5rem;
  border-bottom: 3px solid #3d7ab8;
}

.doc-banner h1 {
  margin: 0 0 0.35rem;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.doc-banner p {
  margin: 0;
  font-size: 0.88rem;
  opacity: 0.88;
  max-width: 56ch;
}

.doc-shell {
  max-width: 52rem;
  margin: 0 auto;
  padding: 2rem 1.35rem 3.5rem;
  background: #f5f6f8;
}

.doc-content {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(15, 20, 25, 0.06);
}

@media print {
  body { background: #fff; }
  .doc-banner { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .doc-shell { padding: 0; max-width: none; }
  .doc-content {
    border: none;
    box-shadow: none;
    border-radius: 0;
    padding: 0;
  }
}
`;

function buildStandaloneDocument(bodyHtml: string): string {
  const head =
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>SOW for FDE — Requirement document</title>' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">' +
    '<style>' +
    STANDALONE_CSS +
    '</style></head><body>';

  const banner =
    '<header class="doc-banner"><h1>Requirement document</h1>' +
    '<p>SOW for FDE — Voice &amp; chatbot sales discovery, formatted for engineering handoff.</p></header>';

  const main =
    '<main class="doc-shell"><article class="doc-content">' +
    wrapExportDocumentBody(bodyHtml) +
    '</article></main></body></html>';

  return head + banner + main;
}

/**
 * Opens the requirement document in a new browser tab as a complete HTML page.
 */
export function openRequirementAsHtml(markdown: string): void {
  const bodyHtml = markdownToSafeHtml(markdown);
  if (!bodyHtml.replace(/\s/g, '')) {
    throw new Error('No document content to open.');
  }

  const html = buildStandaloneDocument(bodyHtml);
  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) {
    throw new Error('Pop-up blocked. Allow pop-ups for this site to open the HTML document.');
  }

  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
}
