import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mainnet } from "wagmi/chains";
import { createHarness } from "@/test/harness";
import { MintButton } from "@/components/mint-button";

const FREE = BigInt(0);
const ONE_TOKEN = BigInt(2000000000000000); // 0.002 ETH

afterEach(() => vi.unstubAllGlobals());

/**
 * Set the quantity input. fireEvent.change rather than userEvent.type:
 * jsdom does not support text selection on `input[type=number]`, so
 * `{selectall}` is a no-op there and typing would append to the existing
 * value instead of replacing it.
 */
function setQuantity(value: string) {
  const input = screen.getByLabelText(/quantity/i) as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
  return input;
}

describe("MintButton", () => {
  it("offers to switch networks when the wallet is on the wrong chain", async () => {
    const h = createHarness({ chain: mainnet, price: ONE_TOKEN });
    await h.renderConnected(<MintButton />);

    expect(
      await screen.findByRole("button", { name: /switch to robinhood/i })
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Mint / })).toBeNull();
  });

  it("quotes the price the contract returns", async () => {
    const h = createHarness({ price: ONE_TOKEN });
    await h.renderConnected(<MintButton />);

    expect(
      await screen.findByRole("button", { name: /Mint 1 — 0\.002 ETH/ })
    ).toBeTruthy();
  });

  it("says free when the contract quotes nothing", async () => {
    const h = createHarness({ price: FREE, og: true });
    await h.renderConnected(<MintButton />);

    expect(
      await screen.findByRole("button", { name: /Mint 1 — free/ })
    ).toBeTruthy();
  });

  it("mints at full price when the voucher endpoint declines", async () => {
    const h = createHarness({ price: ONE_TOKEN, og: false });
    await h.renderConnected(<MintButton />);
    await screen.findByRole("button", { name: /Mint 1 — 0\.002 ETH/ });

    // A 403 is the normal answer for a non-OG, not an error: it must not
    // block minting.
    expect(h.calls.voucher).toBeGreaterThan(0);
    expect(screen.queryByText(/qualify|error/i)).toBeNull();
  });

  it("requotes when the quantity changes", async () => {
    const h = createHarness({ price: ONE_TOKEN });
    await h.renderConnected(<MintButton />);
    await screen.findByRole("button", { name: /Mint 1 —/ });

    h.setPrice(BigInt(3) * ONE_TOKEN);
    setQuantity("3");

    expect(
      await screen.findByRole("button", { name: /Mint 3 — 0\.006 ETH/ })
    ).toBeTruthy();
  });

  it("stays empty while you clear it, instead of snapping back to 1", async () => {
    const h = createHarness({ price: ONE_TOKEN });
    await h.renderConnected(<MintButton />);
    await screen.findByRole("button", { name: /Mint 1 —/ });

    const input = setQuantity("");

    expect(input.value).toBe("");
    expect(
      (screen.getByRole("button", { name: /^Mint/ }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it("lets you type a new quantity after clearing the field", async () => {
    const h = createHarness({ price: ONE_TOKEN });
    await h.renderConnected(<MintButton />);
    await screen.findByRole("button", { name: /Mint 1 —/ });

    const input = setQuantity("");
    await userEvent.type(input, "3");

    // Snapping the cleared field back to 1 would make this "13".
    expect(input.value).toBe("3");
  });

  it("restores a usable quantity when you leave the field empty", async () => {
    const h = createHarness({ price: ONE_TOKEN });
    await h.renderConnected(<MintButton />);
    await screen.findByRole("button", { name: /Mint 1 —/ });

    const input = setQuantity("");
    fireEvent.blur(input);

    expect(input.value).toBe("1");
  });

  it("clamps the quantity to the per-transaction maximum", async () => {
    const h = createHarness({ price: ONE_TOKEN });
    await h.renderConnected(<MintButton />);
    await screen.findByRole("button", { name: /Mint 1 —/ });

    const input = setQuantity("99");

    await waitFor(() => expect(Number(input.value)).toBe(20));
  });

  it("reveals the art and traits of what was just minted", async () => {
    const h = createHarness({ price: FREE, og: true });
    await h.renderConnected(<MintButton />);
    setQuantity("2");
    await userEvent.click(
      await screen.findByRole("button", { name: /Mint 2 — free/ })
    );

    // Ids come from the receipt's Transfer logs, not from a guess.
    expect(await screen.findByAltText("Art Plumber #1")).toBeTruthy();
    expect(await screen.findByAltText("Art Plumber #2")).toBeTruthy();

    const reveal = screen.getByTestId("minted-reveal");
    expect(reveal.querySelectorAll("img")).toHaveLength(2);
    // The artwork is the on-chain SVG itself, inlined as a data URI.
    expect(
      screen.getAllByAltText(/Art Plumber/)[0].getAttribute("src")
    ).toMatch(/^data:image\/svg\+xml;base64,/);
    // Traits render alongside it.
    expect(within(reveal).getAllByText("Hand Only").length).toBe(2);
    expect(within(reveal).getAllByText("Purple").length).toBe(2);
  });

  it("calls out a Perfect Plumber", async () => {
    const h = createHarness({
      price: FREE,
      og: true,
      attributes: [
        { trait_type: "Plungers", value: "Double" },
        { trait_type: "Suckers Match", value: "Yes" },
        { trait_type: "Sticks Match", value: "Yes" },
        { trait_type: "Perfect Plumber", value: "Yes" },
      ],
    });
    await h.renderConnected(<MintButton />);
    await userEvent.click(
      await screen.findByRole("button", { name: /Mint 1 — free/ })
    );

    const reveal = await screen.findByTestId("minted-reveal");
    expect(within(reveal).getByText("Perfect Plumber")).toBeTruthy();
    // The trait row is not duplicated by the callout.
    expect(within(reveal).getAllByText("Perfect Plumber")).toHaveLength(1);
  });

  it("degrades to a placeholder when a token's metadata is unreadable", async () => {
    const h = createHarness({ price: FREE, og: true, brokenTokenUri: true });
    await h.renderConnected(<MintButton />);
    await userEvent.click(
      await screen.findByRole("button", { name: /Mint 1 — free/ })
    );

    const reveal = await screen.findByTestId("minted-reveal");
    expect(within(reveal).getByText(/artwork unavailable/i)).toBeTruthy();
    expect(within(reveal).getByText("#1")).toBeTruthy();
  });

  it("refetches the price after a mint, so a spent free allowance is not requoted", async () => {
    // The regression this file was written for: the priceFor query is keyed
    // on wallet/quantity/voucher, none of which change when a mint succeeds
    // — but the wallet's free allowance does. Without a refetch the form
    // came back quoting free, and minting again reverted WRONG_PRICE.
    const h = createHarness({ price: FREE, og: true });
    await h.renderConnected(<MintButton />);

    await userEvent.click(
      await screen.findByRole("button", { name: /Mint 1 — free/ })
    );

    const mintMore = await screen.findByRole("button", { name: /mint more/i });
    expect(h.calls.mint).toBe(1);

    // The allowance is now spent: the contract would charge for the next one.
    h.setPrice(ONE_TOKEN);
    await userEvent.click(mintMore);

    expect(
      await screen.findByRole("button", { name: /Mint 1 — 0\.002 ETH/ })
    ).toBeTruthy();
  });
});
