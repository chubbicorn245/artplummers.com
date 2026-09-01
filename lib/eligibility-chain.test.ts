import { describe, expect, it } from "vitest";
import { assertEthereumMainnet, WrongChainError } from "@/lib/eligibility";

describe("assertEthereumMainnet", () => {
  it("accepts Ethereum mainnet", () => {
    expect(() => assertEthereumMainnet(1)).not.toThrow();
  });

  it("rejects Robinhood Chain mainnet, the likely mix-up", () => {
    // Both are called "mainnet". Pointed at Robinhood, the nonce lookup does
    // not error — it returns 0, so every OG is silently reported ineligible
    // and charged full price.
    expect(() => assertEthereumMainnet(4663)).toThrow(WrongChainError);
    expect(() => assertEthereumMainnet(4663)).toThrow(/Robinhood Chain/);
    expect(() => assertEthereumMainnet(4663)).toThrow(/Ethereum mainnet/);
  });

  it("rejects Robinhood Chain testnet", () => {
    expect(() => assertEthereumMainnet(46630)).toThrow(WrongChainError);
    expect(() => assertEthereumMainnet(46630)).toThrow(/Robinhood Chain Testnet/);
  });

  it("rejects any other chain, naming the id it found", () => {
    expect(() => assertEthereumMainnet(137)).toThrow(WrongChainError);
    expect(() => assertEthereumMainnet(137)).toThrow(/137/);
  });

  it("carries the chain id it saw, for logging", () => {
    try {
      assertEthereumMainnet(4663);
      expect.unreachable();
    } catch (e) {
      expect((e as WrongChainError).chainId).toBe(4663);
    }
  });
});
