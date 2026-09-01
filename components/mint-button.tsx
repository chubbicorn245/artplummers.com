"use client";

import { useState } from "react";
import { formatEther, type Hex } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { artPlumberAbi } from "@/lib/abi/art-plumber";
import { artPlumberAddress, mintChain } from "@/lib/contract";
import { MAX_PER_TX } from "@/lib/economics";

/** No voucher: the full-price path. The contract treats this as "no discount". */
const NO_VOUCHER = "0x" as Hex;

/**
 * Fetches the wallet's free-mint voucher. A 403 is the expected answer for a
 * wallet that isn't an OG, not an error — it just mints at full price. Any
 * other failure also falls back to paying rather than blocking the mint.
 */
async function fetchVoucher(address: string): Promise<Hex> {
  try {
    const res = await fetch(`/api/voucher/${address}`);
    if (!res.ok) return NO_VOUCHER;
    const body = await res.json();
    return (body.signature as Hex) ?? NO_VOUCHER;
  } catch {
    return NO_VOUCHER;
  }
}

export function MintButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [quantity, setQuantity] = useState(1);

  const { data: voucher } = useQuery({
    queryKey: ["voucher", address],
    queryFn: () => fetchVoucher(address!),
    enabled: Boolean(isConnected && address && artPlumberAddress),
    staleTime: Infinity, // the signature is deterministic for a wallet
  });

  // The contract is the authority on price: free tokens are spent first, so
  // the split depends on how much of the allowance this wallet has used.
  // mint() requires msg.value to match exactly.
  const {
    data: price,
    isLoading: isPricing,
    refetch: refetchPrice,
  } = useReadContract({
    abi: artPlumberAbi,
    address: artPlumberAddress,
    functionName: "priceFor",
    args: address ? [address, BigInt(quantity), voucher ?? NO_VOUCHER] : undefined,
    chainId: mintChain.id,
    query: { enabled: Boolean(address && artPlumberAddress && voucher !== undefined) },
  });

  const { writeContract, data: txHash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: mintChain.id,
  });

  // Bound to a local so the narrowing below survives into the onClick
  // closure — an imported binding loses it.
  const contractAddress = artPlumberAddress;
  if (!contractAddress) {
    return (
      <p className="text-center text-sm text-[color:var(--foreground)]/60">
        Minting isn&apos;t live yet.
      </p>
    );
  }

  if (!isConnected || !address) return null;

  if (chainId !== mintChain.id) {
    return (
      <button
        onClick={() => switchChain({ chainId: mintChain.id })}
        disabled={isSwitching}
        className="rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {isSwitching ? "Switching…" : `Switch to ${mintChain.name}`}
      </button>
    );
  }

  if (isSuccess && txHash) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-green-400/40 bg-green-500/15 px-6 py-4 text-center backdrop-blur-sm">
        <p className="font-semibold text-green-300">
          Minted {quantity} Art Plummer{quantity > 1 ? "s" : ""}
        </p>
        <a
          href={`${mintChain.blockExplorers.default.url}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-green-100/80 underline underline-offset-4 hover:opacity-70"
        >
          View transaction
        </a>
        <button
          onClick={() => {
            // The price query is keyed on wallet/quantity/voucher, none of
            // which change when a mint succeeds — but the wallet's free
            // allowance does. Without this refetch the form comes back
            // quoting the pre-mint price, and minting again reverts
            // WRONG_PRICE.
            refetchPrice();
            reset();
          }}
          className="text-sm underline underline-offset-4 opacity-60 hover:opacity-100"
        >
          Mint more
        </button>
      </div>
    );
  }

  const busy = isPending || isConfirming;
  const priceLabel =
    price === undefined ? "…" : price === BigInt(0) ? "free" : `${formatEther(price)} ETH`;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <label htmlFor="mint-quantity" className="text-sm opacity-70">
          Quantity
        </label>
        <input
          id="mint-quantity"
          type="number"
          min={1}
          max={MAX_PER_TX}
          value={quantity}
          disabled={busy}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isInteger(n)) {
              setQuantity(Math.min(MAX_PER_TX, Math.max(1, n)));
            }
          }}
          className="w-20 rounded-lg border border-black/15 bg-transparent px-3 py-1.5 text-center dark:border-white/20"
        />
      </div>

      <button
        onClick={() =>
          writeContract({
            abi: artPlumberAbi,
            address: contractAddress,
            functionName: "mint",
            args: [BigInt(quantity), voucher ?? NO_VOUCHER],
            value: price,
            chainId: mintChain.id,
          })
        }
        disabled={busy || isPricing || price === undefined}
        className="rounded-full bg-foreground px-8 py-3 font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {isPending
          ? "Confirm in wallet…"
          : isConfirming
            ? "Minting…"
            : `Mint ${quantity} — ${priceLabel}`}
      </button>

      <p className="text-xs text-[color:var(--foreground)]/50">
        Up to {MAX_PER_TX} per transaction. No limit on how many you mint in
        total.
      </p>

      {error && (
        <p className="max-w-xs text-center text-sm text-red-500">
          {/^user rejected/i.test(error.message)
            ? "Transaction rejected."
            : error.message.split("\n")[0]}
        </p>
      )}
    </div>
  );
}
