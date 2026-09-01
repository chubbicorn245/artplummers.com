import { createPublicClient, http, type Address } from "viem";
import { mainnet } from "viem/chains";

/**
 * Last Ethereum mainnet block before 2021-11-01 00:00 UTC (mined 23:59:20).
 * A wallet is an OG iff it had sent at least one mainnet transaction by then,
 * i.e. its nonce at this block is nonzero.
 */
export const CUTOFF_BLOCK = BigInt(13527858);

/** Reads an address's transaction count at a historical block. */
export type NonceReader = (
  address: Address,
  blockNumber: bigint
) => Promise<number>;

/**
 * The real reader. Needs an archive-capable RPC: most keyless public nodes
 * prune the historical state this block requires.
 */
export function mainnetNonceReader(rpcUrl: string): NonceReader {
  const client = createPublicClient({ chain: mainnet, transport: http(rpcUrl) });
  return (address, blockNumber) =>
    client.getTransactionCount({ address, blockNumber });
}

/**
 * Whether `address` qualifies for the free mint. This is the single source of
 * the rule — both /api/eligibility (which reports it) and /api/voucher (which
 * signs based on it) go through here, so they can never disagree.
 */
export async function isOgWallet(
  address: Address,
  readNonce: NonceReader
): Promise<boolean> {
  const nonce = await readNonce(address, CUTOFF_BLOCK);
  return nonce > 0;
}
