import type { Model } from '../../api/client';
export type Positions = Record<string, { x: number; y: number }>;
export type LayoutName = 'breadthfirst' | 'grid' | 'circle' | 'concentric';
export type SavedLayout = { positions: Positions; at: string; layout: LayoutName };
export function positionFor(positions: Positions, id: string) {
  if (!Object.hasOwn(positions, id)) return undefined;
  const value = positions[id];
  return value &&
    Number.isFinite(value.x) &&
    Number.isFinite(value.y) &&
    Math.abs(value.x) <= 1e7 &&
    Math.abs(value.y) <= 1e7
    ? value
    : undefined;
}
export function graphSlice(data: Model<'GlobalTopologyGraph'>) {
  const counts = new Map<string, number>();
  for (const n of data.nodes) counts.set(n.id, (counts.get(n.id) || 0) + 1);
  const nodes = data.nodes
    .filter((n) => typeof n.id === 'string' && !!n.id && counts.get(n.id) === 1)
    .slice(0, 500);
  const ids = new Set(nodes.map((n) => n.id));
  const edgeCounts = new Map<string, number>();
  for (const e of data.edges) edgeCounts.set(e.id, (edgeCounts.get(e.id) || 0) + 1);
  const edges = data.edges
    .filter(
      (e) =>
        e.id && !ids.has(e.id) && edgeCounts.get(e.id) === 1 && ids.has(e.from) && ids.has(e.to),
    )
    .slice(0, 1000);
  return {
    nodes,
    edges,
    omittedNodes: data.nodes.length - nodes.length,
    omittedEdges: data.edges.length - edges.length,
  };
}
