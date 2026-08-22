"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { CutoffDate } from "@/components/cutoff-date";

type EligibilityResponse = {
  address: string;
  eligible: boolean;
  cutoffBlock: string;
};

async function fetchEligibility(address: string): Promise<EligibilityResponse> {
  const res = await fetch(`/api/eligibility/${address}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Eligibility check failed");
  return body;
}

export function EligibilityCheck() {
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
      <p className="animate-pulse text-sm text-white/70">
        Checking eligibility…
      </p>
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
        <p className="font-semibold text-green-300">✓ You&apos;re eligible</p>
        <p className="text-sm text-green-100/80">
          This wallet transacted on Ethereum mainnet before <CutoffDate />.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-red-400/40 bg-red-500/15 px-6 py-4 text-center backdrop-blur-sm">
      <p className="font-semibold text-red-300">✗ Not eligible</p>
      <p className="text-sm text-red-100/80">
        This wallet has no Ethereum mainnet transaction before <CutoffDate />.
      </p>
    </div>
  );
}
