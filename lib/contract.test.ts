import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** lib/contract.ts reads env at module load, so each case needs a fresh import. */
async function loadWith(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) vi.stubEnv(k, "");
    else vi.stubEnv(k, v);
  }
  return import("@/lib/contract");
}

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllEnvs());

describe("mintChain", () => {
  it("targets Robinhood testnet by default", async () => {
    const { mintChain } = await loadWith({ NEXT_PUBLIC_MINT_CHAIN_ID: undefined });
    expect(mintChain.id).toBe(46630);
  });

  it("targets Robinhood mainnet when asked for by id", async () => {
    const { mintChain } = await loadWith({ NEXT_PUBLIC_MINT_CHAIN_ID: "4663" });
    expect(mintChain.id).toBe(4663);
    expect(mintChain.name).toBe("Robinhood Chain");
  });

  it("falls back to testnet on an unrecognised id, not to mainnet", async () => {
    // Defaulting the wrong way would point real users at real money after a
    // typo in an environment variable.
    const { mintChain } = await loadWith({ NEXT_PUBLIC_MINT_CHAIN_ID: "1" });
    expect(mintChain.id).toBe(46630);
  });
});

describe("artPlumberAddress", () => {
  it("is undefined when unset, so the UI can say minting isn't live", async () => {
    const m = await loadWith({ NEXT_PUBLIC_ART_PLUMBER_ADDRESS: undefined });
    expect(m.artPlumberAddress).toBeUndefined();
    expect(m.mintingIsLive()).toBe(false);
  });

  it("is undefined for a malformed address rather than passed through", async () => {
    const m = await loadWith({ NEXT_PUBLIC_ART_PLUMBER_ADDRESS: "0xnope" });
    expect(m.artPlumberAddress).toBeUndefined();
  });

  it("is used when it is a well-formed address", async () => {
    const addr = "0x64b7363007ce9a918a97fF1102672307215BDEf7";
    const m = await loadWith({ NEXT_PUBLIC_ART_PLUMBER_ADDRESS: addr });
    expect(m.artPlumberAddress).toBe(addr);
    expect(m.mintingIsLive()).toBe(true);
  });
});
