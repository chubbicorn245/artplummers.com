import { describe, expect, it } from "vitest";
import { decodeTokenUri } from "@/lib/token-metadata";

/** Shaped exactly like ArtPlumberRenderer.tokenURI's output. */
function dataUri(json: unknown) {
  return `data:application/json;base64,${btoa(JSON.stringify(json))}`;
}

const META = {
  name: "Art Plumber #1",
  description: "Fully on-chain pixel plumber.",
  image: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
  attributes: [
    { trait_type: "Plungers", value: "Hand Only" },
    { trait_type: "Suit", value: "Purple" },
    { trait_type: "Suckers Match", value: "No" },
  ],
};

describe("decodeTokenUri", () => {
  it("decodes the base64 JSON the contract returns", () => {
    const meta = decodeTokenUri(dataUri(META));

    expect(meta?.name).toBe("Art Plumber #1");
    expect(meta?.image).toBe(META.image);
    expect(meta?.attributes).toHaveLength(3);
    expect(meta?.attributes[0]).toEqual({
      trait_type: "Plungers",
      value: "Hand Only",
    });
  });

  it("tolerates a token with no attributes", () => {
    const meta = decodeTokenUri(dataUri({ name: "x", image: "y" }));
    expect(meta?.attributes).toEqual([]);
  });

  it("returns null rather than throwing on a non-data URI", () => {
    expect(decodeTokenUri("https://example.com/1.json")).toBeNull();
  });

  it("returns null rather than throwing on malformed base64", () => {
    expect(decodeTokenUri("data:application/json;base64,!!!not-base64!!!")).toBeNull();
  });

  it("returns null rather than throwing on valid base64 that isn't JSON", () => {
    expect(decodeTokenUri(`data:application/json;base64,${btoa("nope")}`)).toBeNull();
  });

  it("strips surrounding quotes, which cast and some ABI decoders add", () => {
    const meta = decodeTokenUri(`"${dataUri(META)}"`);
    expect(meta?.name).toBe("Art Plumber #1");
  });
});
