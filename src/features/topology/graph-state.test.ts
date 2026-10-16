import { describe, it, expect } from 'vitest';
import { topology } from '../../mocks/fixtures';
import { graphSlice, positionFor } from './graph-state';
describe('bounded topology graph', () => {
  it('rejects inherited, infinite and excessive coordinates', () => {
    expect(positionFor(Object.create({ inherited: { x: 1, y: 2 } }), 'inherited')).toBeUndefined();
    expect(positionFor({ n: { x: Infinity, y: 2 } }, 'n')).toBeUndefined();
    expect(positionFor({ n: { x: 1, y: 1e8 } }, 'n')).toBeUndefined();
    expect(positionFor({ n: { x: -3, y: 0 } }, 'n')).toEqual({ x: -3, y: 0 });
  });
  it('drops ambiguous node IDs and dangling edges without mutating input', () => {
    const value = structuredClone(topology);
    value.nodes.push({ ...value.nodes[0]! });
    const before = structuredClone(value);
    const sliced = graphSlice(value);
    expect(sliced.nodes.some((n) => n.id === value.nodes[0]!.id)).toBe(false);
    expect(
      sliced.edges.every(
        (e) => sliced.nodes.some((n) => n.id === e.from) && sliced.nodes.some((n) => n.id === e.to),
      ),
    ).toBe(true);
    expect(value).toEqual(before);
  });
  it('caps rendered elements and excludes node/edge collisions and duplicate edges', () => {
    const nodes = Array.from({ length: 501 }, (_, i) => ({ ...topology.nodes[0]!, id: `n${i}` }));
    const edges = Array.from({ length: 1005 }, (_, i) => ({
      ...topology.edges[0]!,
      id: `e${i}`,
      from: 'n0',
      to: 'n1',
    }));
    edges.unshift({ ...edges[0]!, id: 'n0' });
    edges.push({ ...edges[1]! });
    const value = graphSlice({ ...topology, nodes, edges });
    expect(value.nodes).toHaveLength(500);
    expect(value.edges).toHaveLength(1000);
    expect(value.edges.some((e) => e.id === 'n0' || e.id === 'e0')).toBe(false);
    expect(value.omittedNodes).toBe(1);
    expect(value.omittedEdges).toBe(edges.length - 1000);
  });
});
