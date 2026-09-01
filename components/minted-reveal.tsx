"use client";

import { useReadContracts } from "wagmi";
import { artPlumberAbi } from "@/lib/abi/art-plumber";
import { artPlumberAddress, mintChain } from "@/lib/contract";
import { decodeTokenUri, type TokenMetadata } from "@/lib/token-metadata";

/** Traits that are the point of the hunt, so worth calling out. */
const MATCH_TRAITS = new Set([
  "Suckers Match",
  "Sticks Match",
  "Uniform Match",
  "Perfect Plumber",
]);

function isHit(trait: string, value: string) {
  return MATCH_TRAITS.has(trait) && value !== "No";
}

function Plumber({ id, meta }: { id: bigint; meta: TokenMetadata | null }) {
  if (!meta) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-black/10 text-xs opacity-50 dark:border-white/20">
          #{id.toString()}
        </div>
        <p className="text-xs opacity-50">Artwork unavailable</p>
      </div>
    );
  }

  const perfect = meta.attributes.some((a) => a.trait_type === "Perfect Plumber");

  return (
    <figure className="flex flex-col items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={meta.image}
        alt={meta.name}
        width={128}
        height={128}
        className={`h-32 w-32 rounded-lg [image-rendering:pixelated] ${
          perfect
            ? "ring-2 ring-amber-400 shadow-[0_0_24px_rgba(224,164,34,0.45)]"
            : "ring-1 ring-black/10 dark:ring-white/15"
        }`}
      />
      <figcaption className="text-sm font-medium">{meta.name}</figcaption>
      {perfect && (
        <p className="text-xs font-semibold text-amber-400">Perfect Plumber</p>
      )}
      <dl className="flex flex-col gap-0.5 text-xs">
        {meta.attributes
          .filter((a) => a.trait_type !== "Perfect Plumber")
          .map((a) => (
            <div key={a.trait_type} className="flex justify-between gap-3">
              <dt className="opacity-55">{a.trait_type}</dt>
              <dd
                className={
                  isHit(a.trait_type, a.value)
                    ? "font-semibold text-amber-400"
                    : "font-medium"
                }
              >
                {a.value}
              </dd>
            </div>
          ))}
      </dl>
    </figure>
  );
}

/**
 * The reveal: what you just pulled. The artwork and traits both come out of a
 * single tokenURI read per token — the contract stores no image anywhere
 * else, so this is the canonical view of the token, not a preview of one.
 */
export function MintedReveal({ tokenIds }: { tokenIds: bigint[] }) {
  const { data, isLoading } = useReadContracts({
    contracts: tokenIds.map((id) => ({
      abi: artPlumberAbi,
      address: artPlumberAddress,
      functionName: "tokenURI" as const,
      args: [id] as const,
      chainId: mintChain.id,
    })),
    query: { enabled: Boolean(artPlumberAddress && tokenIds.length > 0) },
  });

  if (tokenIds.length === 0) return null;

  if (isLoading) {
    return (
      <p className="animate-pulse text-sm opacity-70">Revealing your art…</p>
    );
  }

  return (
    <div
      className="flex flex-wrap justify-center gap-6"
      data-testid="minted-reveal"
    >
      {tokenIds.map((id, i) => {
        const result = data?.[i];
        const meta =
          result?.status === "success"
            ? decodeTokenUri(result.result as string)
            : null;
        return <Plumber key={id.toString()} id={id} meta={meta} />;
      })}
    </div>
  );
}
