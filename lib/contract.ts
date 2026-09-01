import type { Address } from "viem";
import { robinhoodTestnet } from "@/lib/chains";

/**
 * Where ArtPlumber is deployed. Unset until the contract ships, which is
 * what mintingIsLive() reports — the UI shows "not live yet" rather than a
 * button that cannot work.
 */
const configured = process.env.NEXT_PUBLIC_ART_PLUMBER_ADDRESS;

export const artPlumberAddress = (
  configured && /^0x[0-9a-fA-F]{40}$/.test(configured) ? configured : undefined
) as Address | undefined;

/** The chain the mint transaction goes to. */
export const mintChain = robinhoodTestnet;

export function mintingIsLive(): boolean {
  return artPlumberAddress !== undefined;
}
