const CUTOFF_BLOCK = "13,527,858";

/**
 * "November 2021" with a hover tooltip explaining the exact cutoff block.
 * The eligibility check reads the wallet's nonce at this block — the last
 * Ethereum mainnet block mined before 2021-11-01 00:00 UTC.
 */
export function CutoffDate() {
  return (
    <span className="group relative cursor-help underline decoration-dotted underline-offset-4">
      November 2021
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-foreground px-3 py-1.5 text-xs whitespace-nowrap text-background opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        before block {CUTOFF_BLOCK}
      </span>
    </span>
  );
}
