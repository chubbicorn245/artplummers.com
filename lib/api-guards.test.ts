import { describe, expect, it } from "vitest";
import { eligibilityCacheKey, voucherCacheKey } from "@/lib/api-guards";

const WALLET = "0x1b1077Bb5c92B83b645faa421D71C91b702e9fA2";
const A = "0x64b7363007ce9a918a97fF1102672307215BDEf7";
const B = "0x0000000000000000000000000000000000000abc";

describe("eligibilityCacheKey", () => {
  it("folds the checksummed and lowercase forms of one wallet together", () => {
    // Same 20-byte account, two spellings: they must share a cache entry so
    // the second casing does not trigger a redundant archive read.
    expect(eligibilityCacheKey(WALLET)).toBe(eligibilityCacheKey(WALLET.toLowerCase()));
  });

  it("keeps different wallets apart", () => {
    expect(eligibilityCacheKey(A)).not.toBe(eligibilityCacheKey(B));
  });
});

describe("voucherCacheKey", () => {
  it("is stable for the same wallet, chain and contract", () => {
    expect(voucherCacheKey(46630, A, WALLET)).toBe(voucherCacheKey(46630, A, WALLET));
  });

  it("differs by contract", () => {
    // A voucher is signed for one contract. Serving a cached signature after
    // a redeploy would hand out one that fails ecrecover on the new address.
    expect(voucherCacheKey(46630, A, WALLET)).not.toBe(
      voucherCacheKey(46630, B, WALLET)
    );
  });

  it("differs by chain", () => {
    expect(voucherCacheKey(46630, A, WALLET)).not.toBe(
      voucherCacheKey(4663, A, WALLET)
    );
  });

  it("differs by wallet", () => {
    expect(voucherCacheKey(46630, A, WALLET)).not.toBe(
      voucherCacheKey(46630, A, B)
    );
  });

  it("does not confuse a wallet with a contract of the same value", () => {
    // Naive concatenation could collide across field boundaries.
    expect(voucherCacheKey(46630, A, B)).not.toBe(voucherCacheKey(46630, B, A));
  });
});
