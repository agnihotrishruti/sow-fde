import { useCallback, useState } from 'react';
import { copyFormattedDocument } from './copyFormattedToClipboard';

type Props = {
  markdown: string;
  onError?: (message: string) => void;
};

export default function CopyForGoogleDocsButton({ markdown, onError }: Props) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const copy = useCallback(async () => {
    if (!markdown.trim()) return;
    setBusy(true);
    try {
      await copyFormattedDocument(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not copy formatted document.';
      onError?.(message);
    } finally {
      setBusy(false);
    }
  }, [markdown, onError]);

  return (
    <button
      type="button"
      className="ghost"
      onClick={copy}
      disabled={busy || !markdown.trim()}
    >
      {copied ? 'Copied for Docs' : busy ? 'Copying…' : 'Copy for Google Docs'}
    </button>
  );
}
