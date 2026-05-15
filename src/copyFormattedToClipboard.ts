import { buildClipboardHtmlDocument } from './documentExportSurface';
import { markdownToSafeHtml } from './markdownHtml';

/**
 * Copies rich HTML (for Google Docs / Word) plus plain Markdown as fallback.
 */
export async function copyFormattedDocument(markdown: string): Promise<void> {
  const inner = markdownToSafeHtml(markdown);
  if (!inner.replace(/\s/g, '')) {
    throw new Error('No document content to copy.');
  }

  const htmlDoc = buildClipboardHtmlDocument(inner);

  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Formatted copy needs a secure context (https or localhost) and a modern browser.');
  }

  const htmlBlob = new Blob([htmlDoc], { type: 'text/html' });
  const textBlob = new Blob([markdown], { type: 'text/plain' });

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      }),
    ]);
  } catch {
    await navigator.clipboard.writeText(markdown);
    throw new Error(
      'Rich HTML copy failed (try Chrome or Edge, or use Open HTML). Plain Markdown was copied to the clipboard instead.',
    );
  }
}
