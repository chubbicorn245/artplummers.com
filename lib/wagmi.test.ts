import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function loadWith(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return import("@/lib/wagmi");
}

const KEYED = "https://robinhood-mainnet.g.alchemy.com/v2/test-key";

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllEnvs());

describe("wagmi config", () => {
  it("registers Ethereum and both Robinhood chains", async () => {
    const { config } = await loadWith({});
    expect(config.chains.map((c) => c.id).sort()).toEqual([1, 4663, 46630]);
  });

  it("applies a keyed RPC to the configured mint chain", async () => {
    const { config } = await loadWith({
      NEXT_PUBLIC_MINT_CHAIN_ID: "4663",
      NEXT_PUBLIC_ROBINHOOD_RPC_URL: KEYED,
    });
    expect(config.getClient({ chainId: 4663 }).transport.url).toBe(KEYED);
  });

  it("does not point the other Robinhood chain at it", async () => {
    // The variable names one endpoint. Applying it to both would send
    // testnet traffic to a mainnet node.
    const { config } = await loadWith({
      NEXT_PUBLIC_MINT_CHAIN_ID: "4663",
      NEXT_PUBLIC_ROBINHOOD_RPC_URL: KEYED,
    });
    expect(config.getClient({ chainId: 46630 }).transport.url).not.toBe(KEYED);
  });

  it("falls back to the chain's public RPC when unset", async () => {
    const { config } = await loadWith({ NEXT_PUBLIC_MINT_CHAIN_ID: "4663" });
    expect(config.getClient({ chainId: 4663 }).transport.url).toBe(
      "https://rpc.mainnet.chain.robinhood.com"
    );
  });
});
