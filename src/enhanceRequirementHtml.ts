/** Must match system prompt #### wording (primary). */
export const SALES_DISCOVERY_H2 =
  'Sales discovery questions (ask the prospect before solutioning)';
export const TECH_FOLLOWUPS_H2 = 'Technical follow-ups for engineering';

const FUTURE_SECTION_TITLE =
  /^(future requirements?|future roadmap|long[-\s]term (vision|roadmap)|product roadmap|roadmap planning|phase\s*\d+\+?\s*planning)\s*$/i;

function headingLevel(el: Element): number {
  const m = /^H([1-6])$/.exec(el.tagName);
  return m ? Number(m[1]) : 6;
}

function isTechFollowupsHeading(el: Element): boolean {
  const t = el.textContent?.trim() ?? '';
  return t === TECH_FOLLOWUPS_H2 || /^technical follow[-\s]ups\b/i.test(t);
}

function isSalesDiscoveryHeading(el: Element): boolean {
  const t = el.textContent?.trim() ?? '';
  return t === SALES_DISCOVERY_H2 || /^sales discovery questions\b/i.test(t);
}

/** Remove standalone “future / roadmap” blocks (H2/H3 + body until next peer-or-higher heading). */
function stripFutureRequirementSections(root: Element): void {
  const headings = Array.from(root.querySelectorAll('h2, h3, h4'));
  for (const heading of headings) {
    const text = heading.textContent?.trim() ?? '';
    if (!FUTURE_SECTION_TITLE.test(text)) continue;

    const level = headingLevel(heading);
    const toRemove: Element[] = [heading];
    let n = heading.nextElementSibling;
    while (n) {
      if (n.tagName === 'H1') break;
      const nl = headingLevel(n);
      if ((n.tagName === 'H2' || n.tagName === 'H3' || n.tagName === 'H4') && nl <= level) break;
      toRemove.push(n);
      n = n.nextElementSibling;
    }
    toRemove.forEach((el) => el.remove());
  }
}

/** Wrap the sales discovery subsection for UI + PDF emphasis. */
function wrapSalesDiscoveryBlock(doc: Document, root: Element): void {
  const sales = Array.from(root.querySelectorAll('h2, h3, h4')).find((h) => isSalesDiscoveryHeading(h));
  if (!sales?.parentNode) return;

  const parent = sales.parentNode;
  const aside = doc.createElement('aside');
  aside.className = 'sales-feasibility-highlight';
  aside.setAttribute('role', 'note');

  const eyebrow = doc.createElement('p');
  eyebrow.className = 'sales-feasibility-eyebrow';
  eyebrow.textContent =
    'Sales team — ask the customer these first; answers unblock feasibility for tech.';

  aside.appendChild(eyebrow);

  const nodes: Element[] = [];
  let el: Element | null = sales;
  while (el) {
    const next = el.nextElementSibling;
    const tag = el.tagName;
    if (
      el !== sales &&
      (tag === 'H2' || tag === 'H3' || tag === 'H4') &&
      isTechFollowupsHeading(el)
    ) {
      break;
    }
    if (el !== sales && tag === 'H1') break;
    nodes.push(el);
    el = next;
  }

  parent.insertBefore(aside, sales);
  for (const node of nodes) {
    aside.appendChild(node);
  }
}

/**
 * Post-process sanitized HTML: drop roadmap-style blocks, highlight sales discovery questions.
 */
export function enhanceRequirementHtml(html: string): string {
  if (!html.trim()) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="enhance-root">${html}</div>`, 'text/html');
  const root = doc.querySelector('#enhance-root');
  if (!root) return html;

  stripFutureRequirementSections(root);
  wrapSalesDiscoveryBlock(doc, root);

  return root.innerHTML;
}
