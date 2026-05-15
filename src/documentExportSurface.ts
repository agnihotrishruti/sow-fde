/**
 * Scoped styles for PDF, HTML export, and clipboard — white background, dark text.
 * Keeps html2canvas from capturing “invisible” light-on-light or transform glitches.
 */
export const EXPORT_DOCUMENT_CSS = `
.export-document-root {
  box-sizing: border-box;
  background: #ffffff !important;
  color: #111111 !important;
  font-family: "DM Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 13px;
  line-height: 1.55;
  max-width: 100%;
  padding: 2rem 2.25rem 2.5rem;
}
.export-document-root * {
  box-sizing: border-box;
}
.export-document-root h1,
.export-document-root h2,
.export-document-root h3,
.export-document-root h4 {
  color: #000000 !important;
  font-weight: 700;
}
.export-document-root p,
.export-document-root li,
.export-document-root td,
.export-document-root th {
  color: #111111 !important;
}
.export-document-root h1 {
  font-size: 1.45rem;
  margin: 0 0 0.65em;
  padding-bottom: 0.35em;
  border-bottom: 2px solid #d0d5de;
}
.export-document-root h2 { font-size: 1.12rem; margin: 1.35em 0 0.45em; }
.export-document-root h3 { font-size: 1.02rem; margin: 1.1em 0 0.35em; }
.export-document-root h4 { font-size: 0.95rem; margin: 0.95em 0 0.3em; }
.export-document-root p { margin: 0 0 0.75em; }
.export-document-root ul,
.export-document-root ol { margin: 0.35em 0 0.85em; padding-left: 1.35em; }
.export-document-root li { margin: 0.25em 0; }
.export-document-root strong { color: #000000 !important; font-weight: 700; }
.export-document-root a { color: #0b57d0 !important; }
.export-document-root blockquote {
  margin: 0.75em 0;
  padding: 0.5rem 0.85rem;
  border-left: 4px solid #3d7ab8;
  background: #f0f5fb !important;
  color: #222222 !important;
}
.export-document-root code,
.export-document-root pre {
  font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace;
  background: #f4f5f8 !important;
  color: #111111 !important;
  border: 1px solid #d8dee8;
  border-radius: 4px;
}
.export-document-root code { font-size: 0.9em; padding: 0.1em 0.35em; }
.export-document-root pre {
  padding: 0.75rem 0.9rem;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
}
.export-document-root pre code { background: transparent !important; border: none; padding: 0; }
.export-document-root table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.85em 0;
  font-size: 12px;
}
.export-document-root th,
.export-document-root td {
  border: 1px solid #c5cedd !important;
  padding: 0.4rem 0.5rem;
  text-align: left;
  vertical-align: top;
  background: #ffffff !important;
}
.export-document-root th {
  background: #eef1f6 !important;
  font-weight: 700;
  color: #000000 !important;
}
.export-document-root hr {
  border: none;
  border-top: 1px solid #d0d5de;
  margin: 1.1em 0;
}
.export-document-root .sales-feasibility-highlight {
  margin: 1rem 0 1.2rem;
  padding: 1rem 1.1rem;
  border: 2px solid #3d7ab8 !important;
  border-radius: 8px;
  background: linear-gradient(180deg, #e8f4fc 0%, #ffffff 100%) !important;
}
.export-document-root .sales-feasibility-eyebrow {
  margin: 0 0 0.55rem;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1a5a94 !important;
}
.export-document-root .sales-feasibility-highlight h2,
.export-document-root .sales-feasibility-highlight h3,
.export-document-root .sales-feasibility-highlight h4,
.export-document-root .sales-feasibility-highlight li,
.export-document-root .sales-feasibility-highlight p {
  color: #111111 !important;
}
`;

/** Inner HTML for PDF/canvas: scoped styles + body fragment (already sanitized). */
export function wrapExportDocumentBody(innerHtml: string): string {
  return `<div class="export-document-root"><style>${EXPORT_DOCUMENT_CSS}</style>${innerHtml}</div>`;
}

/** Full minimal HTML document for clipboard (Google Docs, Word). */
export function buildClipboardHtmlDocument(innerBodyHtml: string): string {
  const body = wrapExportDocumentBody(innerBodyHtml);
  return (
    '<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Requirement document</title></head>' +
    '<body style="margin:0;padding:16px;background:#ffffff;color:#111111;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">' +
    body +
    '</body></html>'
  );
}
