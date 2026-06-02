export type FeasibilityVerdict = 'feasible' | 'partial' | 'not_feasible' | 'unknown';

export function parseFeasibilityVerdict(markdown: string): FeasibilityVerdict {
  const verdictSection =
    markdown.match(/##\s*1\.\s*Feasibility\s+Verdict\s*([\s\S]*?)(?=\n##\s|\n#\s|$)/i)?.[1] ??
    markdown.match(/##\s*Verdict\s*([\s\S]*?)(?=\n##\s|\n#\s|$)/i)?.[1] ??
    markdown.match(/Feasibility\s+Verdict\s*:?\s*([^\n]+)/i)?.[1] ??
    markdown;

  const text = verdictSection.toLowerCase();

  if (/not\s+feasible/.test(text) && !/partially/.test(text)) return 'not_feasible';
  if (/partially\s+feasible/.test(text)) return 'partial';
  if (/\bfeasible\b/.test(text) && !/not\s+feasible/.test(text) && !/partially/.test(text)) {
    return 'feasible';
  }

  return 'unknown';
}

export function verdictLabel(v: FeasibilityVerdict): string {
  switch (v) {
    case 'feasible':
      return 'Feasible';
    case 'partial':
      return 'Partially Feasible';
    case 'not_feasible':
      return 'Not Feasible';
    default:
      return 'Verdict pending';
  }
}
