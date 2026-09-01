import { hashTypedData, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

/**
 * The EIP-712 voucher ArtPlumber verifies with ecrecover. Domain and types
 * must match the contract exactly — see ArtPlumber's DOMAIN_SEPARATOR and
 * VOUCHER_TYPEHASH. A mismatch produces a signature that simply fails
 * on-chain with no other symptom, so lib/voucher.test.ts pins the resulting
 * digest against one computed independently with Foundry.
 */
export const VOUCHER_TYPES = {
  MintVoucher: [{ name: "wallet", type: "address" }],
} as const;

function domain(chainId: number, contract: Address) {
  return {
    name: "Art Plumber",
    version: "1",
    chainId,
    verifyingContract: contract,
  } as const;
}

/** The digest the contract's voucherDigest(wallet) returns. */
export function voucherHash(
  chainId: number,
  contract: Address,
  wallet: Address
): Hex {
  return hashTypedData({
    domain: domain(chainId, contract),
    types: VOUCHER_TYPES,
    primaryType: "MintVoucher",
    message: { wallet },
  });
}

/**
 * Sign a voucher attesting that `wallet` may claim the free mint. The key
 * must be the contract's immutable `signer` — it cannot be rotated, so a
 * leak means redeploying.
 */
export function signVoucher(
  privateKey: Hex,
  chainId: number,
  contract: Address,
  wallet: Address
): Promise<Hex> {
  return privateKeyToAccount(privateKey).signTypedData({
    domain: domain(chainId, contract),
    types: VOUCHER_TYPES,
    primaryType: "MintVoucher",
    message: { wallet },
  });
}
