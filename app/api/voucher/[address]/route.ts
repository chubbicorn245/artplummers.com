import { NextResponse } from "next/server";
import { isAddress, type Hex } from "viem";
import {
  isOgWallet,
  mainnetNonceReader,
  WrongChainError,
} from "@/lib/eligibility";
import { signVoucher } from "@/lib/voucher";
import { artPlumberAddress, mintChain } from "@/lib/contract";
import {
  clientKey,
  eligibilityCache,
  rateLimiter,
  voucherCache,
} from "@/lib/api-guards";

/**
 * Issues the EIP-712 voucher that unlocks a wallet's free mints.
 *
 * The eligibility check is re-run here from mainnet history: the client's
 * claim to be an OG is never trusted, because signing is exactly what makes
 * the claim true on-chain. A wallet that doesn't qualify gets a 403 and no
 * signature, and mints at full price with an empty `0x` instead.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  // Signing costs an archive read and an ECDSA signature, on an endpoint
  // anyone can hit in a loop. Served-from-cache requests still count: the
  // limit is about the caller, not about what the call happens to cost.
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

  const cached = voucherCache.get(address);
  if (cached) return NextResponse.json({ address, signature: cached });

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
    eligible =
      eligibilityCache.has(address)
        ? (eligibilityCache.get(address) as boolean)
        : await isOgWallet(address, mainnetNonceReader(rpcUrl));
    eligibilityCache.set(address, eligible);
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
    voucherCache.set(address, signature);
    return NextResponse.json({ address, signature });
  } catch {
    return NextResponse.json(
      { error: "Voucher signing failed" },
      { status: 500 }
    );
  }
}
