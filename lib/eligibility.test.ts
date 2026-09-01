import { describe, expect, it } from "vitest";
import { CUTOFF_BLOCK, isOgWallet, type NonceReader } from "@/lib/eligibility";

const WALLET = "0x2222222222222222222222222222222222222222" as const;

describe("isOgWallet", () => {
  it("reads the nonce at the last block before 2021-11-01", async () => {
    let seenBlock: bigint | undefined;
    const reader: NonceReader = async (_address, blockNumber) => {
      seenBlock = blockNumber;
      return 1;
    };

    await isOgWallet(WALLET, reader);

    expect(seenBlock).toBe(BigInt(13527858));
    expect(CUTOFF_BLOCK).toBe(BigInt(13527858));
  });

  it("treats any pre-cutoff transaction as OG", async () => {
    const reader: NonceReader = async () => 1;
    await expect(isOgWallet(WALLET, reader)).resolves.toBe(true);
  });

  it("treats a wallet with no pre-cutoff transaction as not OG", async () => {
    const reader: NonceReader = async () => 0;
    await expect(isOgWallet(WALLET, reader)).resolves.toBe(false);
  });

  it("passes the wallet through to the reader unchanged", async () => {
    let seenAddress: string | undefined;
    const reader: NonceReader = async (address) => {
      seenAddress = address;
      return 0;
    };

    await isOgWallet(WALLET, reader);

    expect(seenAddress).toBe(WALLET);
  });
});
