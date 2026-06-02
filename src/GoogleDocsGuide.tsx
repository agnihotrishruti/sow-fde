export const GOOGLE_DOCS_CREATE_URL =
  'https://docs.google.com/document/u/0/create?usp=dot_new';

/** Short instructions shown at the top of SOW and Feasibility modules. */
export default function GoogleDocsGuide() {
  return (
    <aside className="google-docs-guide" aria-label="How to copy into Google Docs">
      <p className="google-docs-guide-title">Copy into Google Docs</p>
      <ol className="google-docs-guide-steps">
        <li>
          After the document is generated, click <strong>Copy for Google Docs</strong>.
        </li>
        <li>
          Open a{' '}
          <a href={GOOGLE_DOCS_CREATE_URL} target="_blank" rel="noopener noreferrer">
            new Google Doc
          </a>{' '}
          and paste the content there (<kbd>Ctrl</kbd>+<kbd>V</kbd> or <kbd>Cmd</kbd>+<kbd>V</kbd>).
        </li>
      </ol>
    </aside>
  );
}
