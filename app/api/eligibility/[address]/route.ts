import { NextResponse } from "next/server";
import { isAddress } from "viem";
import {
  CUTOFF_BLOCK,
  isOgWallet,
  mainnetNonceReader,
} from "@/lib/eligibility";

/**
 * Reports whether a wallet qualifies for the free mint. This is NOT a gate:
 * `eligible: false` wallets can still mint, at full price.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const rpcUrl = process.env.MAINNET_RPC_URL;
  if (!rpcUrl) {
    return NextResponse.json(
      { error: "Server misconfigured: MAINNET_RPC_URL is not set" },
      { status: 500 }
    );
  }

  try {
    // Historical nonce lookup — requires an archive-capable RPC
    const eligible = await isOgWallet(address, mainnetNonceReader(rpcUrl));

    return NextResponse.json({
      address,
      eligible,
      cutoffBlock: CUTOFF_BLOCK.toString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not check eligibility. Please try again." },
      { status: 502 }
    );
  }
}
