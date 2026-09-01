import { NextResponse } from "next/server";
import { isAddress } from "viem";
import {
  CUTOFF_BLOCK,
  isOgWallet,
  mainnetNonceReader,
  WrongChainError,
} from "@/lib/eligibility";
import {
  clientKey,
  eligibilityCache,
  eligibilityCacheKey,
  rateLimiter,
} from "@/lib/api-guards";

/**
 * Reports whether a wallet qualifies for the free mint. This is NOT a gate:
 * `eligible: false` wallets can still mint, at full price.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const limit = rateLimiter.check(clientKey(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
      }
    );
  }

  const rpcUrl = process.env.MAINNET_RPC_URL;
  if (!rpcUrl) {
    return NextResponse.json(
      { error: "Server misconfigured: MAINNET_RPC_URL is not set" },
      { status: 500 }
    );
  }

  try {
    // Historical nonce lookup — requires an archive-capable RPC. Cached
    // because the answer is a fact about frozen history.
    const cacheKey = eligibilityCacheKey(address);
    const eligible = eligibilityCache.has(cacheKey)
      ? (eligibilityCache.get(cacheKey) as boolean)
      : await isOgWallet(address, mainnetNonceReader(rpcUrl));
    eligibilityCache.set(cacheKey, eligible);

    return NextResponse.json({
      address,
      eligible,
      cutoffBlock: CUTOFF_BLOCK.toString(),
    });
  } catch (e) {
    // A wrong-chain RPC is a deployment mistake, not a transient fault, and
    // it would otherwise pass silently as "nobody is eligible".
    if (e instanceof WrongChainError) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Could not check eligibility. Please try again." },
      { status: 502 }
    );
  }
}
