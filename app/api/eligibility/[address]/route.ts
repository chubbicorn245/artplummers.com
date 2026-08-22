import { NextResponse } from "next/server";
import { createPublicClient, http, isAddress } from "viem";
import { mainnet } from "viem/chains";

// Last Ethereum mainnet block before 2021-11-01 00:00 UTC (mined 23:59:20 UTC).
// A wallet is eligible iff it had sent at least one mainnet transaction by then,
// i.e. its nonce at this block is nonzero.
const CUTOFF_BLOCK = BigInt(13527858);

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

  const client = createPublicClient({ chain: mainnet, transport: http(rpcUrl) });

  try {
    // Historical nonce lookup — requires an archive-capable RPC
    const nonce = await client.getTransactionCount({
      address,
      blockNumber: CUTOFF_BLOCK,
    });

    return NextResponse.json({
      address,
      eligible: nonce > 0,
      cutoffBlock: CUTOFF_BLOCK.toString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not check eligibility. Please try again." },
      { status: 502 }
    );
  }
}
