import { createBoundedCache } from "@/lib/cache";
import { createRateLimiter } from "@/lib/rate-limit";

/**
 * Shared per-instance guards for the two public routes.
 *
 * Both routes spend a metered archive-RPC read per call, and /api/voucher
 * also spends an ECDSA signature — on endpoints anyone can hit in a loop.
 *
 * Caching is safe because the answer is a fact about frozen history: whether
 * a wallet transacted before November 2021 can never change, and the voucher
 * signed for it is deterministic. Nothing here expires for that reason.
 *
 * Both are per-instance and vanish on cold start, so they damp cost rather
 * than enforce a global budget. A real limit across instances needs Redis or
 * Vercel KV — worth adding if the mint draws a crowd.
 */

/** Whether an address qualifies for the free mint. */
export const eligibilityCache = createBoundedCache<boolean>({
  maxEntries: 5000,
});

/** Signed vouchers, keyed by address. Deterministic per wallet. */
export const voucherCache = createBoundedCache<string>({ maxEntries: 5000 });

export const rateLimiter = createRateLimiter({
  limit: 30,
  windowMs: 60_000,
});

/**
 * Best-effort client identity. Vercel sets x-forwarded-for; the leftmost
 * entry is the client, the rest are proxies. Falls back to a single shared
 * bucket, which is deliberately conservative: unknown callers share a limit
 * rather than each getting their own.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
