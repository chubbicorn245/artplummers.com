import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  it("allows requests up to the limit", () => {
    let now = 0;
    const rl = createRateLimiter({ limit: 3, windowMs: 1000, now: () => now });
    expect(rl.check("a").allowed).toBe(true);
    expect(rl.check("a").allowed).toBe(true);
    expect(rl.check("a").allowed).toBe(true);
  });

  it("refuses the request past the limit", () => {
    let now = 0;
    const rl = createRateLimiter({ limit: 2, windowMs: 1000, now: () => now });
    rl.check("a");
    rl.check("a");
    expect(rl.check("a").allowed).toBe(false);
  });

  it("reports how long to wait", () => {
    let now = 0;
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => now });
    rl.check("a");
    now = 400;
    expect(rl.check("a").retryAfterMs).toBe(600);
  });

  it("lets the caller through again once the window passes", () => {
    let now = 0;
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => now });
    rl.check("a");
    now = 1001;
    expect(rl.check("a").allowed).toBe(true);
  });

  it("tracks callers independently", () => {
    let now = 0;
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => now });
    rl.check("a");
    expect(rl.check("b").allowed).toBe(true);
    expect(rl.check("a").allowed).toBe(false);
  });

  it("forgets stale callers so memory cannot grow without bound", () => {
    let now = 0;
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => now });
    for (let i = 0; i < 500; i++) rl.check(`caller-${i}`);
    expect(rl.size()).toBe(500);
    now = 5000; // every window has expired
    rl.check("fresh");
    expect(rl.size()).toBeLessThan(10);
  });
});
