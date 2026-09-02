import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

/**
 * lib/contract.ts reads env at module load, so each case imports the
 * component fresh after stubbing the address.
 */
async function renderWith(address: string | undefined) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_ART_PLUMBER_ADDRESS", address ?? "");
  const { ContractAddress } = await import("@/components/contract-address");
  render(<ContractAddress />);
}

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllEnvs());

describe("ContractAddress", () => {
  it("links the deployed address to the mint chain's explorer", async () => {
    const address = "0x64b7363007ce9a918a97fF1102672307215BDEf7";
    await renderWith(address);

    const link = screen.getByRole("link", { name: new RegExp(address, "i") });
    expect(link.getAttribute("href")).toBe(
      `https://explorer.testnet.chain.robinhood.com/address/${address}`
    );
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("renders nothing before the contract ships", async () => {
    // An explorer link built from an empty address 404s, so show none.
    await renderWith(undefined);

    expect(screen.queryByRole("link")).toBeNull();
  });
});
