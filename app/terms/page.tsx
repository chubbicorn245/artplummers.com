import type { Metadata } from "next";
import Link from "next/link";
import { CutoffDate } from "@/components/cutoff-date";
import {
  FREE_ALLOWANCE,
  MAX_PER_TX,
  MAX_SUPPLY,
  MINT_PRICE_ETH,
} from "@/lib/economics";

export const metadata: Metadata = {
  title: "Terms — Art Plummers",
  description:
    "The terms for minting an Art Plummer: what you get, what it costs, and what nobody can undo.",
};

const P = "text-sm leading-relaxed text-black/70 dark:text-white/70";

export default function Terms() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-6 py-16 font-sans">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Terms</h1>
        <p className={P}>
          Last updated <span className="font-medium">[DATE]</span>. By minting
          an Art Plummer you agree to what follows. It is short because the
          system is small: a contract that cannot be changed, and a website
          that talks to it.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">What an Art Plummer is</h2>
        <p className={P}>
          An ERC-721 token on Robinhood Chain whose artwork and traits are
          generated and stored entirely by the contract. There is no server
          and no IPFS in the picture: the token is the art.
        </p>
        <p className={P}>
          The contract itself carries this, permanently and unchangeably, and
          it is the most important thing on this page:
        </p>
        <blockquote className="border-l-2 border-black/20 pl-4 text-sm leading-relaxed italic dark:border-white/25">
          Art Plumbers have no intrinsic value and carry no expectation of
          financial return. There is no team and there is no roadmap. They are
          completely useless and exist for entertainment purposes only.
        </blockquote>
        <p className={P}>
          Nothing on this site is an offer of an investment, a security, or a
          promise of future work. Do not spend money you would mind losing.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">What it costs</h2>
        <p className={P}>
          The collection is {MAX_SUPPLY.toLocaleString()} tokens. Wallets that
          transacted on Ethereum mainnet before <CutoffDate /> mint their first{" "}
          {FREE_ALLOWANCE} free; every other token, for anyone, costs{" "}
          {MINT_PRICE_ETH} ETH. You also pay network gas, which goes to the
          network and not to us.
        </p>
        <p className={P}>
          There is no per-wallet limit. One buyer can acquire the entire
          collection. A single transaction mints at most {MAX_PER_TX}.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Mints are final</h2>
        <p className={P}>
          The contract has no refund function, no owner, no admin key, no pause
          switch and no upgrade path. Once a mint confirms, nobody — including
          whoever deployed it — can reverse it, alter your token, freeze it, or
          change the price, the supply, or the rules. That is the point, and it
          cuts both ways: there is no one to appeal to if you mint by mistake.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">
          The traits are random, but predictably so
        </h2>
        <p className={P}>
          Each token&apos;s traits come from a seed fixed at mint time. On
          Robinhood Chain that seed is derived from your address and the token
          id, both of which are public before you mint — so a determined person
          can compute in advance which token ids would give their wallet a rare
          combination, and try to land on them.
        </p>
        <p className={P}>
          We are telling you this rather than implying the odds are protected.
          If you mint casually, you get what you get.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Your wallet is yours</h2>
        <p className={P}>
          We never take custody of your funds or tokens, and we cannot recover
          them. Payment goes straight from your wallet to the contract. You are
          responsible for the wallet you use, the network it is on, and the
          transactions you sign. A transaction sent to the wrong network or a
          lost private key is not something anyone can undo for you.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">This website</h2>
        <p className={P}>
          The site is provided as-is, with no guarantee that it will be
          available, accurate or uninterrupted. It is a convenience: the
          contract can be used directly through a block explorer without it, and
          it will keep working if this site disappears.
        </p>
        <p className={P}>
          To the fullest extent the law allows, we are not liable for losses
          arising from using this site or the contract, including lost funds,
          failed transactions, network outages, or the value of a token
          changing.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Changes and contact</h2>
        <p className={P}>
          These terms may change; the contract cannot. Material changes will be
          reflected in the date above. Questions:{" "}
          <span className="font-medium">[CONTACT]</span>. Governing law:{" "}
          <span className="font-medium">[JURISDICTION]</span>.
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
