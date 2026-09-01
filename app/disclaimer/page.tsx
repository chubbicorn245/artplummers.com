import type { Metadata } from "next";
import Link from "next/link";
import { CutoffDate } from "@/components/cutoff-date";
import {
  FREE_ALLOWANCE,
  MAX_SUPPLY,
  MINT_PRICE_ETH,
} from "@/lib/economics";

export const metadata: Metadata = {
  title: "Disclaimer — Art Plummers",
  description:
    "What an Art Plummer is, what it costs, and what nobody can undo. Read before minting.",
};

const P = "text-sm leading-relaxed text-black/70 dark:text-white/70";
const CONTACT = "info@artplummers.com";

export default function Disclaimer() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-6 py-16 font-sans">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Disclaimer</h1>
        <p className={P}>
          Please read this before minting. It is short, and none of it is
          boilerplate.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <p className={P}>
          The contract carries this permanently and unchangeably, which makes
          it the most reliable sentence available:
        </p>
        <blockquote className="border-l-2 border-black/20 pl-4 text-sm leading-relaxed italic dark:border-white/25">
          Art Plumbers have no intrinsic value and carry no expectation of
          financial return. There is no team and there is no roadmap. They are
          completely useless and exist for entertainment purposes only.
        </blockquote>
        <p className={P}>
          Nothing here is an offer of an investment or a security, and nothing
          is a promise of future work. Do not spend money you would mind
          losing.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Mints cannot be undone</h2>
        <p className={P}>
          The contract has no owner, no admin key, no pause switch and no
          upgrade path. Once a mint confirms, nobody — including whoever
          deployed it — can reverse it, alter your token, freeze it, or change
          the price, the supply or the rules. That is the point, and it cuts
          both ways: there is no one to appeal to if you mint by mistake.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">What it costs</h2>
        <p className={P}>
          {MAX_SUPPLY.toLocaleString()} tokens in total. Wallets that
          transacted on Ethereum mainnet before <CutoffDate /> mint their first{" "}
          {FREE_ALLOWANCE} free; every other token costs {MINT_PRICE_ETH} ETH,
          plus network gas that goes to the network rather than to us. There is
          no per-wallet limit, so one buyer can acquire the entire collection.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">The odds are not protected</h2>
        <p className={P}>
          Each token&apos;s traits come from a seed fixed at mint time, derived
          from your address and the token id — both public before you mint. A
          determined person can compute in advance which ids would give their
          wallet a rare combination and try to land on them. We would rather
          say that than imply the randomness defends itself. Mint casually and
          you get what you get.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Your wallet is yours</h2>
        <p className={P}>
          We never take custody of your funds or tokens and cannot recover
          them. Payment goes straight from your wallet to the contract. You are
          responsible for the wallet you use, the network it is on, and the
          transactions you sign. This site is provided as-is, with no guarantee
          it will be available or uninterrupted — the contract works without
          it, through any block explorer.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Questions</h2>
        <p className={P}>
          <a
            href={`mailto:${CONTACT}`}
            className="font-medium underline underline-offset-4 hover:opacity-70"
          >
            {CONTACT}
          </a>
        </p>
      </section>

      <div className="flex gap-6">
        <Link href="/" className="text-sm underline underline-offset-4 hover:opacity-70">
          ← back home
        </Link>
        <Link href="/privacy" className="text-sm underline underline-offset-4 hover:opacity-70">
          privacy
        </Link>
      </div>
    </main>
  );
}
