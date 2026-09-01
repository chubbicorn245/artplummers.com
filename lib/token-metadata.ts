/**
 * Decoding for ArtPlumber's on-chain metadata.
 *
 * tokenURI returns `data:application/json;base64,<...>` whose payload carries
 * both the artwork (itself a `data:image/svg+xml;base64` URI) and the traits.
 * One read gets everything, and because the image is a data URI it can go
 * straight into an <img> — no dangerouslySetInnerHTML, and an <img> will not
 * run script embedded in an SVG.
 */

const PREFIX = "data:application/json;base64,";

export type TokenAttribute = { trait_type: string; value: string };

export type TokenMetadata = {
  name: string;
  image: string;
  attributes: TokenAttribute[];
};

/**
 * Returns null rather than throwing for anything unusable, so one odd token
 * degrades to a placeholder instead of taking down the whole reveal.
 */
export function decodeTokenUri(uri: string): TokenMetadata | null {
  // cast and some ABI decoders hand back a quoted string.
  const trimmed = uri.trim().replace(/^"|"$/g, "");
  if (!trimmed.startsWith(PREFIX)) return null;

  try {
    const parsed = JSON.parse(atob(trimmed.slice(PREFIX.length)));
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      name: String(parsed.name ?? ""),
      image: String(parsed.image ?? ""),
      attributes: Array.isArray(parsed.attributes) ? parsed.attributes : [],
    };
  } catch {
    return null;
  }
}
