import { queryOptions, useQuery } from '@tanstack/react-query';
import { api, unwrap, emptyQuery } from './client';

export const sessionQuery = queryOptions({
  queryKey: ['session'],
  queryFn: async ({ signal }) => unwrap(await api.GET('/api/auth/me', { signal })),
  staleTime: 30_000,
  retry: false,
  refetchInterval: 60_000,
});
export const assetsQuery = (
  query: {
    kind?: 'host' | 'network_device' | 'system' | 'bmc' | 'chassis' | 'component' | 'unknown';
    scope?: 'all' | 'real' | 'simulated';
    limit?: number;
    offset?: number;
  } = {},
) =>
  queryOptions({
    queryKey: ['assets', query],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/assets', { params: { query: emptyQuery(query) }, signal })),
    refetchInterval: 30_000,
  });
export const sourcesQuery = (offset = 0) =>
  queryOptions({
    queryKey: ['sources', offset],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/data-sources', { params: { query: { limit: 50, offset } }, signal }),
      ),
    refetchInterval: 30_000,
  });
export const collectorsQuery = queryOptions({
  queryKey: ['collectors'],
  queryFn: async ({ signal }) => unwrap(await api.GET('/api/agents', { signal })),
  refetchInterval: 15_000,
});
export const casesQuery = (
  query: {
    state?: string;
    severity?: string;
    asset_id?: string;
    limit?: number;
    offset?: number;
  } = {},
) =>
  queryOptions({
    queryKey: ['cases', query],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.GET('/api/correlation/incidents', {
          params: { query: emptyQuery(query) },
          signal,
        }),
      ),
    refetchInterval: 10_000,
  });
export const caseSummaryQuery = queryOptions({
  queryKey: ['case-summary'],
  queryFn: async ({ signal }) => unwrap(await api.GET('/api/correlation/summary', { signal })),
  refetchInterval: 15_000,
});
export const incidentsQuery = (query: { state?: string; limit?: number; offset?: number } = {}) =>
  queryOptions({
    queryKey: ['incidents', query],
    queryFn: async ({ signal }) =>
      unwrap(await api.GET('/api/incidents', { params: { query: emptyQuery(query) }, signal })),
    refetchInterval: 15_000,
  });
export const useSession = () => useQuery(sessionQuery);
