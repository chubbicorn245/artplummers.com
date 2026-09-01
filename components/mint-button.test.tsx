import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mainnet } from "wagmi/chains";
import { createHarness } from "@/test/harness";
import { MintButton } from "@/components/mint-button";

const FREE = BigInt(0);
const ONE_TOKEN = BigInt(3000000000000000); // 0.003 ETH

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
      await screen.findByRole("button", { name: /Mint 1 — 0\.003 ETH/ })
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
    await screen.findByRole("button", { name: /Mint 1 — 0\.003 ETH/ });

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
      await screen.findByRole("button", { name: /Mint 3 — 0\.009 ETH/ })
    ).toBeTruthy();
  });

  it("clamps the quantity to the per-transaction maximum", async () => {
    const h = createHarness({ price: ONE_TOKEN });
    await h.renderConnected(<MintButton />);
    await screen.findByRole("button", { name: /Mint 1 —/ });

    const input = setQuantity("99");

    await waitFor(() => expect(Number(input.value)).toBe(20));
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
      await screen.findByRole("button", { name: /Mint 1 — 0\.003 ETH/ })
    ).toBeTruthy();
  });
});
