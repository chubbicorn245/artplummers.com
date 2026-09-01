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

  const signature = await signVoucher(
    signerKey as Hex,
    mintChain.id,
    artPlumberAddress,
    address
  );

  return NextResponse.json({ address, signature });
}
