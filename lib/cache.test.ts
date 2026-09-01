import { describe, expect, it } from "vitest";
import { createBoundedCache } from "@/lib/cache";

describe("createBoundedCache", () => {
  it("returns what was stored", () => {
    const c = createBoundedCache<number>({ maxEntries: 10 });
    c.set("a", 1);
    expect(c.get("a")).toBe(1);
  });

  it("returns undefined for a key it has not seen", () => {
    const c = createBoundedCache<number>({ maxEntries: 10 });
    expect(c.get("nope")).toBeUndefined();
  });

  it("caches falsy values rather than treating them as misses", () => {
    // `eligible: false` is a real answer worth caching.
    const c = createBoundedCache<boolean>({ maxEntries: 10 });
    c.set("a", false);
    expect(c.has("a")).toBe(true);
    expect(c.get("a")).toBe(false);
  });

  it("evicts the oldest entry once full", () => {
    const c = createBoundedCache<number>({ maxEntries: 2 });
    c.set("a", 1);
    c.set("b", 2);
    c.set("c", 3);
    expect(c.has("a")).toBe(false);
    expect(c.get("b")).toBe(2);
    expect(c.get("c")).toBe(3);
  });

  it("keeps recently read entries alive", () => {
    const c = createBoundedCache<number>({ maxEntries: 2 });
    c.set("a", 1);
    c.set("b", 2);
    c.get("a"); // refreshes a
    c.set("c", 3);
    expect(c.has("a")).toBe(true);
    expect(c.has("b")).toBe(false);
  });

  it("never exceeds its bound", () => {
    const c = createBoundedCache<number>({ maxEntries: 50 });
    for (let i = 0; i < 500; i++) c.set(`k${i}`, i);
    expect(c.size()).toBe(50);
  });
});
