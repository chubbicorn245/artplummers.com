import type { Address } from "viem";
import { robinhoodMainnet, robinhoodTestnet } from "@/lib/chains";

/**
 * Where ArtPlumber is deployed. Unset until the contract ships, which is
 * what mintingIsLive() reports — the UI shows "not live yet" rather than a
 * button that cannot work.
 */
const configured = process.env.NEXT_PUBLIC_ART_PLUMBER_ADDRESS;

export const artPlumberAddress = (
  configured && /^0x[0-9a-fA-F]{40}$/.test(configured) ? configured : undefined
) as Address | undefined;

/**
 * The chain the mint transaction goes to. Testnet unless
 * NEXT_PUBLIC_MINT_CHAIN_ID names mainnet — defaulting to testnet means a
 * misconfigured deploy sends people to play money, not the other way round.
 */
export const mintChain =
  process.env.NEXT_PUBLIC_MINT_CHAIN_ID === String(robinhoodMainnet.id)
    ? robinhoodMainnet
    : robinhoodTestnet;

export function mintingIsLive(): boolean {
  return artPlumberAddress !== undefined;
}
