import { artPlumberAddress, mintChain } from "@/lib/contract";

/**
 * The deployed contract, linked to the chain's explorer so anyone can read
 * the code and supply for themselves. Renders nothing until the contract
 * ships — the same unset address mintingIsLive() keys on — rather than a
 * link to an explorer page that doesn't exist.
 */
export function ContractAddress() {
  if (!artPlumberAddress) return null;

  return (
    <a
      href={`${mintChain.blockExplorers.default.url}/address/${artPlumberAddress}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-center text-xs opacity-50 transition-opacity hover:opacity-100"
    >
      contract{" "}
      <span className="font-mono break-all underline underline-offset-4">
        {artPlumberAddress}
      </span>
    </a>
  );
}
