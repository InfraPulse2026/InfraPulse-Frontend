import type { QueryClient } from '@tanstack/react-query';
// Keep the observed session query attached; remove every other user's cache.
export function clearPrivateCache(client: QueryClient) {
  void client.cancelQueries({ predicate: (q) => q.queryKey[0] !== 'session' });
  client.removeQueries({ predicate: (q) => q.queryKey[0] !== 'session' });
  client.getMutationCache().clear();
}
