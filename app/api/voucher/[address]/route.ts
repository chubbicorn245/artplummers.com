import { NextResponse } from "next/server";
import { isAddress, type Hex } from "viem";
import { isOgWallet, mainnetNonceReader } from "@/lib/eligibility";
import { signVoucher } from "@/lib/voucher";
import { artPlumberAddress, mintChain } from "@/lib/contract";

/**
 * Issues the EIP-712 voucher that unlocks a wallet's free mints.
 *
 * The eligibility check is re-run here from mainnet history: the client's
 * claim to be an OG is never trusted, because signing is exactly what makes
 * the claim true on-chain. A wallet that doesn't qualify gets a 403 and no
 * signature, and mints at full price with an empty `0x` instead.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  if (!artPlumberAddress) {
    return NextResponse.json(
      { error: "Minting is not live yet" },
      { status: 503 }
    );
  }

  const rpcUrl = process.env.MAINNET_RPC_URL;
  const signerKey = process.env.ELIGIBILITY_SIGNER_PRIVATE_KEY;
  if (!rpcUrl || !signerKey) {
    return NextResponse.json(
      { error: "Server misconfigured: voucher signing is unavailable" },
      { status: 500 }
    );
  }

  // Check the shape before doing any work. Without this a malformed key —
  // a placeholder pasted verbatim, a missing 0x, a truncated copy — throws
  // inside signTypedData and surfaces as an opaque 500 with an empty body,
  // which is a miserable thing to debug.
  if (!/^0x[0-9a-fA-F]{64}$/.test(signerKey)) {
    return NextResponse.json(
      {
        error:
          "Server misconfigured: ELIGIBILITY_SIGNER_PRIVATE_KEY is not a " +
          "32-byte hex private key (expected 0x followed by 64 hex characters)",
      },
      { status: 500 }
    );
  }

  let eligible: boolean;
  try {
    eligible = await isOgWallet(address, mainnetNonceReader(rpcUrl));
  } catch {
    return NextResponse.json(
      { error: "Could not check eligibility. Please try again." },
      { status: 502 }
    );
  }

  if (!eligible) {
    return NextResponse.json(
      { error: "This wallet does not qualify for the free mint" },
      { status: 403 }
    );
  }

  try {
    const signature = await signVoucher(
      signerKey as Hex,
      mintChain.id,
      artPlumberAddress,
      address
    );
    return NextResponse.json({ address, signature });
  } catch {
    return NextResponse.json(
      { error: "Voucher signing failed" },
      { status: 500 }
    );
  }
}
