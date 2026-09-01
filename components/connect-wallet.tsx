"use client";

import { useSyncExternalStore } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** Never fires: the "have we hydrated yet" value changes exactly once, and
 *  React already re-renders at that point. Module-level so the reference is
 *  stable across renders and useSyncExternalStore doesn't resubscribe. */
const subscribeToNothing = () => () => {};

/**
 * False during SSR and the hydration pass, true afterwards. React uses the
 * server snapshot for both, so markup matches and there's no mismatch — and
 * unlike a useState/useEffect flag, nothing sets state from an effect.
 */
function useHasHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );
}

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const hasHydrated = useHasHydrated();

  // Avoid hydration mismatch: wallet state is only known on the client.
  if (!hasHydrated) return null;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-black/10 px-4 py-2 font-mono text-sm dark:border-white/20">
          {truncate(address)}
        </span>
        <button
          onClick={() => disconnect()}
          className="rounded-full border border-black/10 px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => connect({ connector: connectors[0] })}
        disabled={isPending}
        className="rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {isPending ? "Connecting…" : "Connect Wallet"}
      </button>
      {error && (
        <p className="text-sm text-red-500">
          {error.message.includes("Provider not found")
            ? "No wallet found. Install a browser wallet like MetaMask."
            : error.message}
        </p>
      )}
    </div>
  );
}
