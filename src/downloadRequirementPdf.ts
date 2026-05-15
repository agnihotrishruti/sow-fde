import html2pdf from 'html2pdf.js';
import { wrapExportDocumentBody } from './documentExportSurface';
import { markdownToSafeHtml } from './markdownHtml';

function flushLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Renders Markdown to HTML and downloads an A4 PDF (white background, dark text).
 * Uses a flex-mounted surface (no transform) so html2canvas is not blank.
 */
export async function downloadRequirementPdf(markdown: string): Promise<void> {
  const inner = markdownToSafeHtml(markdown);
  if (!inner.replace(/\s/g, '')) {
    throw new Error('No content to export.');
  }

  const layer = document.createElement('div');
  layer.setAttribute('data-pdf-export-layer', 'true');
  layer.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:2147483000',
    'display:flex',
    'justify-content:center',
    'align-items:flex-start',
    'padding:20px 12px',
    'overflow:auto',
    'background:rgba(0,0,0,0.5)',
    'box-sizing:border-box',
  ].join(';');

  const card = document.createElement('div');
  card.style.cssText = [
    'position:relative',
    'width:min(794px,calc(100vw - 32px))',
    'flex-shrink:0',
    'background:#ffffff',
    'box-sizing:border-box',
    'box-shadow:0 12px 48px rgba(0,0,0,0.25)',
    'margin:0 auto 24px',
  ].join(';');

  card.innerHTML = wrapExportDocumentBody(inner);
  const surface = card.querySelector('.export-document-root') as HTMLElement | null;
  if (!surface) {
    layer.remove();
    throw new Error('Export surface missing — cannot build PDF.');
  }

  layer.appendChild(card);
  document.body.appendChild(layer);

  const filename = `SOW-FDE-requirements-${new Date().toISOString().slice(0, 10)}.pdf`;

  try {
    await document.fonts.ready.catch(() => {});
    await flushLayout();
    await new Promise((r) => setTimeout(r, 280));

    await html2pdf()
      .set({
        margin: [14, 12, 14, 12],
        filename,
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff',
          onclone: (_clonedDoc, el) => {
            const node = el as HTMLElement;
            node.style.backgroundColor = '#ffffff';
            node.style.color = '#111111';
          },
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      })
      .from(surface)
      .save();
  } finally {
    layer.remove();
  }
}
