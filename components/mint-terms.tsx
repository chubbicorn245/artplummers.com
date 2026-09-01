"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { CutoffDate } from "@/components/cutoff-date";
import { FREE_ALLOWANCE, MINT_PRICE_ETH } from "@/lib/economics";

type EligibilityResponse = {
  address: string;
  /** True iff the wallet qualifies for the free mint — not a gate on minting. */
  eligible: boolean;
  cutoffBlock: string;
};

async function fetchEligibility(address: string): Promise<EligibilityResponse> {
  const res = await fetch(`/api/eligibility/${address}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Eligibility check failed");
  return body;
}

/**
 * What the connected wallet will pay. Every wallet can mint; the pre–November
 * 2021 check only decides whether the first FREE_ALLOWANCE tokens are free, so
 * neither outcome is a rejection.
 */
export function MintTerms() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["eligibility", address],
    queryFn: () => fetchEligibility(address!),
    enabled: Boolean(isConnected && address),
    staleTime: Infinity, // eligibility is historical — it never changes
    retry: 1,
  });

  if (!isConnected || !address) return null;

  if (isLoading) {
    return (
      <p className="animate-pulse text-sm text-white/70">Checking wallet…</p>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-6 py-4 text-center backdrop-blur-sm">
        <p className="text-sm font-medium text-amber-300">
          {error instanceof Error ? error.message : "Eligibility check failed"}
        </p>
        <button
          onClick={() => refetch()}
          className="text-sm underline underline-offset-4 hover:opacity-70"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  if (data.eligible) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-xl border border-green-400/40 bg-green-500/15 px-6 py-4 text-center shadow-[0_0_24px_rgba(120,200,90,0.15)] backdrop-blur-sm">
        <p className="font-semibold text-green-300">
          ✓ OG wallet — your first {FREE_ALLOWANCE} are free
        </p>
        <p className="text-sm text-green-100/80">
          This wallet transacted on Ethereum mainnet before <CutoffDate />.
          After that it&apos;s {MINT_PRICE_ETH} ETH each, as many as you like.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-black/15 bg-black/[0.03] px-6 py-4 text-center backdrop-blur-sm dark:border-white/20 dark:bg-white/[0.06]">
      <p className="font-semibold">{MINT_PRICE_ETH} ETH each</p>
      <p className="text-sm text-[color:var(--foreground)]/70">
        This wallet has no Ethereum mainnet transaction before <CutoffDate />,
        so the free mint doesn&apos;t apply — but you can still mint as many as
        you like.
      </p>
    </div>
  );
}
