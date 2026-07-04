/** Builds a stable cache key from a prefix and a query object (sorted keys, so param order never causes a cache miss). */
export const buildListCacheKey = (prefix: string, query: Record<string, unknown>): string => {
  const sortedEntries = Object.entries(query)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return `${prefix}:${JSON.stringify(sortedEntries)}`;
};
