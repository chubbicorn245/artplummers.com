"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";

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
      <p className="animate-pulse text-sm text-black/60 dark:text-white/60">
        Checking eligibility…
      </p>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-6 py-4 text-center">
        <p className="text-sm text-amber-600 dark:text-amber-400">
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
      <div className="flex flex-col items-center gap-1 rounded-xl border border-green-500/40 bg-green-500/10 px-6 py-4 text-center">
        <p className="font-medium text-green-600 dark:text-green-400">
          ✓ You&apos;re eligible
        </p>
        <p className="text-sm text-black/60 dark:text-white/60">
          This wallet transacted on Ethereum mainnet before November 2021.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-red-500/40 bg-red-500/10 px-6 py-4 text-center">
      <p className="font-medium text-red-600 dark:text-red-400">✗ Not eligible</p>
      <p className="text-sm text-black/60 dark:text-white/60">
        This wallet has no Ethereum mainnet transaction before November 2021.
      </p>
    </div>
  );
}
