import { createPublicClient, http, type Address } from "viem";
import { mainnet } from "viem/chains";

/**
 * Last Ethereum mainnet block before 2021-11-01 00:00 UTC (mined 23:59:20).
 * A wallet is an OG iff it had sent at least one mainnet transaction by then,
 * i.e. its nonce at this block is nonzero.
 */
export const CUTOFF_BLOCK = BigInt(13527858);

/** Chains that get mistaken for Ethereum mainnet, so the error can say so. */
const KNOWN_CHAINS: Record<number, string> = {
  4663: "Robinhood Chain",
  46630: "Robinhood Chain Testnet",
};

export class WrongChainError extends Error {
  constructor(readonly chainId: number) {
    const found = KNOWN_CHAINS[chainId] ?? `chain ${chainId}`;
    super(
      `MAINNET_RPC_URL points at ${found} (chain id ${chainId}), but it must ` +
        `point at Ethereum mainnet (chain id 1). Eligibility is a fact about ` +
        `Ethereum history — no other chain can answer it.`
    );
    this.name = "WrongChainError";
  }
}

/**
 * Guards the mix-up that motivated this: both networks are called "mainnet",
 * and pointed at the wrong one the nonce lookup does not fail. It returns 0,
 * so every OG is silently reported ineligible and quoted full price.
 */
export function assertEthereumMainnet(chainId: number): void {
  if (chainId !== mainnet.id) throw new WrongChainError(chainId);
}

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

  // Checked once per reader and cached: a misconfigured RPC should cost one
  // extra round trip per cold start, not one per request.
  let checked: Promise<void> | undefined;
  const verifyChain = () =>
    (checked ??= client.getChainId().then(assertEthereumMainnet));

  return async (address, blockNumber) => {
    await verifyChain();
    return client.getTransactionCount({ address, blockNumber });
  };
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
