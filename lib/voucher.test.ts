import { describe, expect, it } from "vitest";
import { recoverTypedDataAddress } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { signVoucher, voucherHash, VOUCHER_TYPES } from "@/lib/voucher";

// Generated per run rather than hardcoded, so no private key literal — real
// or throwaway — ever lands in the repo. The assertions below are properties
// of the signature, not fixed values, so a fresh key each run is equivalent.
// (The one fixed assertion, the digest, does not involve the key at all.)
const SIGNER_KEY = generatePrivateKey();
const SIGNER = privateKeyToAccount(SIGNER_KEY).address;

const CHAIN_ID = 46630;
const CONTRACT = "0x1111111111111111111111111111111111111111" as const;
const WALLET = "0x2222222222222222222222222222222222222222" as const;

/**
 * The digest ArtPlumber.voucherDigest() produces for the same inputs,
 * computed independently with Foundry:
 *
 *   keccak256(0x1901 ++ domainSeparator ++ keccak256(abi.encode(
 *     keccak256("MintVoucher(address wallet)"), wallet)))
 *
 * If viem's domain or type definitions drift from the contract's, this is
 * the assertion that catches it — a signature over the wrong digest fails
 * ecrecover on-chain with no other symptom.
 */
const FOUNDRY_DIGEST =
  "0xecb5a8708635d18f9b3fba42534828585c3465c691b6eaf053ada3edc4e9a6a5";

describe("voucherHash", () => {
  it("matches the digest the contract computes", () => {
    expect(voucherHash(CHAIN_ID, CONTRACT, WALLET)).toBe(FOUNDRY_DIGEST);
  });

  it("is bound to the wallet", () => {
    const other = "0x3333333333333333333333333333333333333333" as const;
    expect(voucherHash(CHAIN_ID, CONTRACT, other)).not.toBe(FOUNDRY_DIGEST);
  });

  it("is bound to the contract", () => {
    const other = "0x4444444444444444444444444444444444444444" as const;
    expect(voucherHash(CHAIN_ID, other, WALLET)).not.toBe(FOUNDRY_DIGEST);
  });

  it("is bound to the chain", () => {
    expect(voucherHash(1, CONTRACT, WALLET)).not.toBe(FOUNDRY_DIGEST);
  });
});

describe("signVoucher", () => {
  it("produces a 65-byte signature", async () => {
    const sig = await signVoucher(SIGNER_KEY, CHAIN_ID, CONTRACT, WALLET);
    // 0x + r(32) + s(32) + v(1) = 132 chars
    expect(sig).toMatch(/^0x[0-9a-f]{130}$/);
  });

  it("recovers to the signer, which is what ecrecover checks on-chain", async () => {
    const signature = await signVoucher(SIGNER_KEY, CHAIN_ID, CONTRACT, WALLET);

    const recovered = await recoverTypedDataAddress({
      domain: {
        name: "Art Plumber",
        version: "1",
        chainId: CHAIN_ID,
        verifyingContract: CONTRACT,
      },
      types: VOUCHER_TYPES,
      primaryType: "MintVoucher",
      message: { wallet: WALLET },
      signature,
    });

    expect(recovered).toBe(SIGNER);
  });

  it("does not recover to the signer when checked against another wallet", async () => {
    const signature = await signVoucher(SIGNER_KEY, CHAIN_ID, CONTRACT, WALLET);

    const recovered = await recoverTypedDataAddress({
      domain: {
        name: "Art Plumber",
        version: "1",
        chainId: CHAIN_ID,
        verifyingContract: CONTRACT,
      },
      types: VOUCHER_TYPES,
      primaryType: "MintVoucher",
      message: { wallet: "0x3333333333333333333333333333333333333333" },
      signature,
    });

    expect(recovered).not.toBe(SIGNER);
  });
});
