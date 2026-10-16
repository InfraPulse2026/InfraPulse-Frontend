import type { Model } from '../../api/client';
export type EvidenceContext = { correlatedID?: string; evidenceIDs?: readonly number[] };
export function evidenceLinks(
  ref: string,
  references: Model<'AIEvidenceReference'>[],
  context: EvidenceContext = {},
) {
  const matches = references.filter((r) => r.ref === ref);
  if (matches.length !== 1) return [];
  const e = matches[0]!;
  const links: { to: string; label: string }[] = [];
  if (e.incident_id)
    links.push({ to: `/incidents/signals/${encodeURIComponent(e.incident_id)}`, label: 'Симптом' });
  for (const id of [...new Set(e.asset_ids || [])].slice(0, 20))
    if (id) links.push({ to: `/assets/${encodeURIComponent(id)}`, label: `Asset ${id}` });
  const n = e.correlation_evidence_id;
  if (
    context.correlatedID &&
    Number.isSafeInteger(n) &&
    Number(n) > 0 &&
    context.evidenceIDs?.includes(n!)
  )
    links.push({
      to: `/incidents/${encodeURIComponent(context.correlatedID)}#correlation-evidence-${n}`,
      label: `Основание связи ${n}`,
    });
  // signal_id identifies the correlation member, not the /api/incidents resource.
  // Unknown references stay text; model strings never become arbitrary URLs.
  return links;
}
