import { useCallback, useMemo, useState } from 'react';
import CopyForGoogleDocsButton from './CopyForGoogleDocsButton';
import GoogleDocsGuide from './GoogleDocsGuide';
import { markdownToSafeHtml } from './markdownHtml';
import {
  parseFeasibilityVerdict,
  verdictLabel,
  type FeasibilityVerdict,
} from './parseFeasibilityVerdict';

type BotType = 'voice_bot' | 'chat_bot';
type ApiError = { error: string; detail?: string };

const BOT_OPTIONS: { value: BotType; label: string; disabled?: boolean }[] = [
  { value: 'voice_bot', label: 'Voice bot' },
  { value: 'chat_bot', label: 'Chat bot', disabled: true },
];

function verdictClass(v: FeasibilityVerdict): string {
  switch (v) {
    case 'feasible':
      return 'verdict-badge verdict-feasible';
    case 'partial':
      return 'verdict-badge verdict-partial';
    case 'not_feasible':
      return 'verdict-badge verdict-not';
    default:
      return 'verdict-badge verdict-unknown';
  }
}

export default function FeasibilityStudy() {
  const [botType, setBotType] = useState<BotType>('voice_bot');
  const [requirement, setRequirement] = useState('');
  const [reportMd, setReportMd] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const verdict = useMemo(
    () => (reportMd ? parseFeasibilityVerdict(reportMd) : 'unknown'),
    [reportMd],
  );

  const reportHtml = useMemo(() => (reportMd ? markdownToSafeHtml(reportMd) : ''), [reportMd]);

  const runStudy = useCallback(async () => {
    if (botType === 'chat_bot') {
      setErr('Chat bot feasibility is not enabled yet. Select Voice bot.');
      return;
    }

    setErr(null);
    setLoading(true);
    setReportMd('');
    try {
      const res = await fetch('/api/feasibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement, botType }),
      });
      const data = (await res.json()) as { report?: string } & ApiError;
      if (!res.ok) {
        setErr(data.detail ?? data.error ?? `Request failed (${res.status})`);
        return;
      }
      if (!data.report) {
        setErr('No report in response.');
        return;
      }
      setReportMd(data.report);
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : 'Could not reach the app server. Run `npm run dev` from the sow-for-fde folder.',
      );
    } finally {
      setLoading(false);
    }
  }, [botType, requirement]);

  return (
    <>
      <header className="hero">
        <p className="eyebrow">Pre-sales delivery check</p>
        <h1>Feasibility study</h1>
        <p className="lede">
          Assess a <strong>voice bot</strong> requirement against the MyOperator{' '}
          <strong>capability registry</strong> (platform limits, not past projects). Written for sales:
          plain English, with <strong>Feasible</strong>, <strong>Partially Feasible</strong>, or{' '}
          <strong>Not Feasible</strong>.
        </p>
      </header>

      <GoogleDocsGuide />

      <div className="grid">
        <section className="panel input-panel" aria-labelledby="feasibility-input-label">
          <div className="panel-head">
            <h2 id="feasibility-input-label">Requirement</h2>
            <span className="hint">
              Paste a transcript, email, or brief. We judge platform capability only—no project names in the
              report.
            </span>
          </div>

          <label className="field-label" htmlFor="bot-type">
            Bot type
          </label>
          <select
            id="bot-type"
            className="select-input"
            value={botType}
            onChange={(e) => setBotType(e.target.value as BotType)}
          >
            {BOT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
                {opt.disabled ? ' (coming soon)' : ''}
              </option>
            ))}
          </select>

          <textarea
            className="transcript"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="Describe the prospect requirement or paste the sales call transcript…"
            spellCheck={false}
            rows={16}
          />
          <div className="actions">
            <button
              type="button"
              className="primary"
              onClick={runStudy}
              disabled={loading || botType === 'chat_bot'}
            >
              {loading ? 'Assessing…' : 'Run feasibility study'}
            </button>
          </div>
          {err && (
            <p className="error" role="alert">
              {err}
            </p>
          )}
        </section>

        <section className="panel output-panel" aria-labelledby="feasibility-output-label">
          <div className="panel-head row">
            <h2 id="feasibility-output-label">Feasibility report</h2>
            <div className="output-actions">
              {reportMd ? (
                <span className={verdictClass(verdict)} role="status">
                  {verdictLabel(verdict)}
                </span>
              ) : null}
              {reportMd ? <CopyForGoogleDocsButton markdown={reportMd} onError={setErr} /> : null}
            </div>
          </div>
          {reportMd ? (
            <div className="doc-scroll">
              <article className="doc-body" dangerouslySetInnerHTML={{ __html: reportHtml }} />
            </div>
          ) : (
            <div className="placeholder">
              {loading ? (
                <p>Assessing against the MyOperator capability registry…</p>
              ) : (
                <p>
                  Report includes verdict, reasoning, feature breakdown, sales discovery items, and what the
                  bot vs client systems must do. Use <strong>Copy for Google Docs</strong> when ready.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
