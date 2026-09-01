/**
 * A small in-process LRU.
 *
 * Scoped deliberately: on serverless this is per-instance and vanishes on
 * cold start, so it is a cost damper, not a correctness mechanism. It works
 * here because the thing being cached — whether a wallet transacted before
 * November 2021 — is a fact about frozen history that can never change.
 * Shared caching across instances would need Redis or Vercel KV.
 */
export function createBoundedCache<T>({ maxEntries }: { maxEntries: number }) {
  const entries = new Map<string, T>();

  return {
    has: (key: string) => entries.has(key),

    get(key: string): T | undefined {
      if (!entries.has(key)) return undefined;
      // Re-insert so Map's insertion order doubles as recency order.
      const value = entries.get(key) as T;
      entries.delete(key);
      entries.set(key, value);
      return value;
    },

    set(key: string, value: T) {
      if (entries.has(key)) entries.delete(key);
      entries.set(key, value);
      while (entries.size > maxEntries) {
        const oldest = entries.keys().next().value as string;
        entries.delete(oldest);
      }
    },

    size: () => entries.size,
  };
}
