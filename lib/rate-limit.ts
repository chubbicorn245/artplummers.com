/**
 * Fixed-window rate limiting, in process.
 *
 * Like the cache, this is per-instance on serverless: it blunts a single
 * caller hammering one instance, and does not add up to a global budget.
 * A real limit across instances needs Redis or Vercel KV. It is still worth
 * having, because the endpoint it guards spends a metered archive-RPC read
 * and an ECDSA signature per call.
 */
type Options = {
  limit: number;
  windowMs: number;
  /** Injectable so the tests do not depend on wall-clock timing. */
  now?: () => number;
};

export function createRateLimiter({ limit, windowMs, now = Date.now }: Options) {
  const windows = new Map<string, { count: number; startedAt: number }>();
  let lastSweep = Number.NEGATIVE_INFINITY;

  /**
   * Drop expired callers so a stream of unique keys cannot grow memory.
   * Triggered by elapsed time rather than map size: a size threshold would
   * let memory sit pinned at the threshold indefinitely.
   */
  function sweep(at: number) {
    if (at - lastSweep < windowMs) return;
    lastSweep = at;
    for (const [key, w] of windows) {
      if (at - w.startedAt >= windowMs) windows.delete(key);
    }
  }

  return {
    check(key: string): { allowed: boolean; retryAfterMs: number } {
      const at = now();
      sweep(at);

      const current = windows.get(key);
      if (!current || at - current.startedAt >= windowMs) {
        windows.set(key, { count: 1, startedAt: at });
        return { allowed: true, retryAfterMs: 0 };
      }

      current.count++;
      if (current.count <= limit) return { allowed: true, retryAfterMs: 0 };

      return {
        allowed: false,
        retryAfterMs: windowMs - (at - current.startedAt),
      };
    },

    size: () => windows.size,
  };
}
