import { useCallback, useMemo, useState } from 'react';
import { copyFormattedDocument } from './copyFormattedToClipboard';
import { markdownToSafeHtml } from './markdownHtml';
import { openRequirementAsHtml } from './requirementHtmlDocument';

type ApiError = { error: string; detail?: string };

export default function App() {
  const [transcript, setTranscript] = useState('');
  const [documentMd, setDocumentMd] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<'md' | 'html' | null>(null);

  const docHtml = useMemo(
    () => (documentMd ? markdownToSafeHtml(documentMd) : ''),
    [documentMd],
  );

  const generate = useCallback(async () => {
    setErr(null);
    setCopied(null);
    setLoading(true);
    setDocumentMd('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      const data = (await res.json()) as { document?: string } & ApiError;
      if (!res.ok) {
        setErr(data.detail ?? data.error ?? `Request failed (${res.status})`);
        return;
      }
      if (!data.document) {
        setErr('No document in response.');
        return;
      }
      setDocumentMd(data.document);
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : 'Could not reach the app server. Run `npm run dev` from the sow-for-fde folder and open the Local URL Vite prints.',
      );
    } finally {
      setLoading(false);
    }
  }, [transcript]);

  const copyDoc = useCallback(async () => {
    if (!documentMd) return;
    try {
      await navigator.clipboard.writeText(documentMd);
      setCopied('md');
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setErr('Could not copy to clipboard.');
    }
  }, [documentMd]);

  const copyFormatted = useCallback(async () => {
    if (!documentMd) return;
    setErr(null);
    try {
      await copyFormattedDocument(documentMd);
      setCopied('html');
      window.setTimeout(() => setCopied(null), 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not copy formatted document.');
    }
  }, [documentMd]);

  const savePdf = useCallback(async () => {
    if (!documentMd) return;
    setErr(null);
    setPdfLoading(true);
    try {
      const { downloadRequirementPdf } = await import('./downloadRequirementPdf');
      await downloadRequirementPdf(documentMd);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not create PDF.');
    } finally {
      setPdfLoading(false);
    }
  }, [documentMd]);

  const openHtml = useCallback(() => {
    if (!documentMd) return;
    setErr(null);
    try {
      openRequirementAsHtml(documentMd);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not open HTML document.');
    }
  }, [documentMd]);

  return (
    <div className="app">
      <header className="hero">
        <p className="eyebrow">Voicebot &amp; chatbot sales → engineering</p>
        <h1>SOW for FDE</h1>
        <p className="lede">
          Paste a sales call transcript and get an <strong>SOW-style requirement brief</strong>: purpose,
          background, objectives, scoped behaviours by channel, workflows, technical integration tables,
          gaps, recommendations, next steps, and sales vs engineering open questions—grounded in the call,
          written for a technical audience.
        </p>
      </header>

      <main className="grid">
        <section className="panel input-panel" aria-labelledby="transcript-label">
          <div className="panel-head">
            <h2 id="transcript-label">Call transcript</h2>
            <span className="hint">
              Any language is fine for the transcript; the generated document is always in English.
            </span>
          </div>
          <textarea
            className="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste the sales call transcript here…"
            spellCheck={false}
            rows={18}
          />
          <div className="actions">
            <button type="button" className="primary" onClick={generate} disabled={loading}>
              {loading ? 'Generating…' : 'Generate requirement doc'}
            </button>
          </div>
          {err && (
            <p className="error" role="alert">
              {err}
            </p>
          )}
        </section>

        <section className="panel output-panel" aria-labelledby="output-label">
          <div className="panel-head row">
            <h2 id="output-label">Requirement document</h2>
            {documentMd ? (
              <div className="output-actions">
                <button type="button" className="ghost" onClick={copyDoc}>
                  {copied === 'md' ? 'Copied' : 'Copy Markdown'}
                </button>
                <button type="button" className="ghost" onClick={copyFormatted}>
                  {copied === 'html' ? 'Copied for Docs' : 'Copy for Google Docs'}
                </button>
                <button type="button" className="ghost" onClick={openHtml}>
                  Open HTML
                </button>
                <button type="button" className="ghost" onClick={savePdf} disabled={pdfLoading}>
                  {pdfLoading ? 'Preparing PDF…' : 'Download PDF'}
                </button>
              </div>
            ) : null}
          </div>
          {documentMd ? (
            <div className="doc-scroll">
              <article className="doc-body" dangerouslySetInnerHTML={{ __html: docHtml }} />
            </div>
          ) : (
            <div className="placeholder">
              {loading ? (
                <p>Calling Claude and structuring the requirement document…</p>
              ) : (
                <p>
                  Generated document appears here (white page, black text). Use{' '}
                  <strong>Copy for Google Docs</strong> to paste with headings and tables, or{' '}
                  <strong>Copy Markdown</strong>, <strong>Open HTML</strong>, or <strong>Download PDF</strong>.
                </p>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="foot">
        <p>
          Put <code>ANTHROPIC_API_KEY</code> in <code>.env</code> (see <code>.env.example</code>). Development:{' '}
          <code>npm run dev</code> — UI and <code>/api</code> share one port (default 5175). For{' '}
          <code>npm run preview</code>, run <code>npm run dev:api</code> in another terminal first.
        </p>
      </footer>
    </div>
  );
}
