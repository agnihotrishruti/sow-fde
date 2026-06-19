import { useCallback, useMemo, useState } from 'react';
import CopyForGoogleDocsButton from './CopyForGoogleDocsButton';
import GoogleDocsGuide from './GoogleDocsGuide';
import { postJson } from './postJson';
import { markdownToSafeHtml } from './markdownHtml';

export default function SowCreation() {
  const [transcript, setTranscript] = useState('');
  const [documentMd, setDocumentMd] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const docHtml = useMemo(
    () => (documentMd ? markdownToSafeHtml(documentMd) : ''),
    [documentMd],
  );

  const generate = useCallback(async () => {
    setErr(null);
    setNotice(null);
    setLoading(true);
    setDocumentMd('');
    try {
      const result = await postJson<{
        document?: string;
        inputTruncated?: boolean;
        detail?: string;
      }>('/api/generate', { transcript });
      if (!result.ok) {
        setErr(result.detail ? `${result.error}: ${result.detail}` : result.error);
        return;
      }
      if (!result.data.document) {
        setErr('No document in response.');
        return;
      }
      if (result.data.inputTruncated) {
        setNotice(
          result.data.detail ??
            'Your transcript was very long. We used the beginning and end only — consider pasting a shorter excerpt next time.',
        );
      }
      setDocumentMd(result.data.document);
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : 'Could not reach the app server. Run `npm run dev` from the sow-for-fde folder.',
      );
    } finally {
      setLoading(false);
    }
  }, [transcript]);

  return (
    <>
      <header className="hero">
        <p className="eyebrow">Voicebot &amp; chatbot sales → engineering</p>
        <h1>SOW creation</h1>
        <p className="lede">
          Paste a sales call transcript and get an <strong>SOW-style requirement brief</strong>: purpose,
          background, objectives, scoped behaviours by channel, workflows, technical integration tables,
          gaps, recommendations, next steps, and sales vs engineering open questions—grounded in the call.
        </p>
      </header>

      <GoogleDocsGuide />

      <div className="grid">
        <section className="panel input-panel" aria-labelledby="transcript-label">
          <div className="panel-head">
            <h2 id="transcript-label">Call transcript</h2>
            <span className="hint">
              Any language is fine; output is always English. Very long transcripts are trimmed automatically
              (~35k characters max). For best results, paste the most relevant 15–20 minutes of the call.
            </span>
          </div>
          {transcript.length > 0 ? (
            <p className="input-meta" aria-live="polite">
              {transcript.length.toLocaleString()} characters
              {transcript.length > 35000 ? ' — will be trimmed before generation' : ''}
            </p>
          ) : null}
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
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}
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
                <CopyForGoogleDocsButton markdown={documentMd} onError={setErr} />
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
                <p>Generating your document — this usually takes 30–90 seconds…</p>
              ) : (
                <p>
                  Generated document appears here. Use <strong>Copy for Google Docs</strong> to paste into a
                  new doc.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
