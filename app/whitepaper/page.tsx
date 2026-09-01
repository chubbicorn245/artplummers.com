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
  title: "Whitepaper — Art Plummers",
  description:
    "How Art Plummers works: an open mint with a free allocation for pre–November 2021 wallets, and fully onchain generative art.",
};

export default function Whitepaper() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-6 py-16 font-sans">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Whitepaper</h1>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          Art Plummers are pixel-art frog plumbers, generated entirely onchain.
          Anyone can mint one; wallets that were already using Ethereum before{" "}
          <CutoffDate /> get theirs free. This page explains what it costs, how
          that check is verified, and how the art works.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">What it costs</h2>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          The collection is {MAX_SUPPLY.toLocaleString()} Art Plummers, and the
          mint is open to everyone — there is no allowlist and no gate. What
          the <CutoffDate /> check decides is the price, not the entry:
        </p>
        <ul className="flex flex-col gap-2 text-sm leading-relaxed text-black/70 dark:text-white/70">
          <li>
            <span className="font-medium">
              Wallets active before <CutoffDate />
            </span>{" "}
            mint their first {FREE_ALLOWANCE} free, then pay {MINT_PRICE_ETH}{" "}
            ETH for every one after that.
          </li>
          <li>
            <span className="font-medium">Every other wallet</span> pays{" "}
            {MINT_PRICE_ETH} ETH per Plummer.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          Whether a wallet qualifies is a historical fact already recorded on
          Ethereum, so it&apos;s fixed — it isn&apos;t something that can be
          added or changed after the fact.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">
          How the free mint is verified
        </h2>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          The check reads your wallet&apos;s{" "}
          <span className="font-medium">nonce</span> (its total sent-transaction
          count) as of block <span className="font-mono">13,527,858</span> — the
          last mainnet block mined before 2021-11-01 00:00 UTC. If that nonce is
          greater than zero, the wallet had already sent a transaction before{" "}
          <CutoffDate />, so its first {FREE_ALLOWANCE} Plummers are free.
          Wallets that don&apos;t qualify aren&apos;t turned away; they simply
          pay {MINT_PRICE_ETH} ETH per Plummer.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Why not an allowlist snapshot</h2>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          A traditional allowlist is a fixed list of addresses that the team
          curates, snapshots, and publishes. You have to trust that the list
          wasn&apos;t quietly edited, that no insiders were slipped in, and that
          the snapshot was taken fairly. It&apos;s also a one-time artifact that
          can be lost, gamed, or gatekept.
        </p>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          Checking the nonce at a fixed historical block needs none of that.
          There is no list to maintain and nothing to trust: the free
          allocation is derived live from Ethereum&apos;s own history, it&apos;s
          the same for everyone, and it can&apos;t be secretly changed.
          It&apos;s permissionless and self-serve — connect a wallet and find
          out.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">How many you can mint</h2>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          There is <span className="font-medium">no per-wallet limit</span>.
          One wallet can mint as many Art Plummers as it wants, right up to the
          full {MAX_SUPPLY.toLocaleString()} — so the collection can be bought
          out by whoever shows up with the ETH. The {FREE_ALLOWANCE} free
          Plummers are the only thing a wallet gets a limited amount of.
        </p>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          A single transaction mints at most{" "}
          <span className="font-medium">{MAX_PER_TX}</span>. That&apos;s a gas
          limit, not an allocation: minting is a loop, and an unbounded batch
          would cost more gas than a block allows. Want more than {MAX_PER_TX}?
          Send another transaction.
        </p>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          The free allocation is per-wallet, so if you also control another
          wallet that transacted before <CutoffDate />, you can switch to it
          and mint its {FREE_ALLOWANCE} free Plummers too.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">The art</h2>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          Every Art Plummer&apos;s traits and colors are randomly generated{" "}
          <span className="font-medium">onchain</span> at mint. There is no
          IPFS, no external server, and no off-chain metadata — the image is
          stored and rendered entirely on Ethereum, so your Plummer exists for
          as long as Ethereum does. Onchain, forever.
        </p>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          Because the outcome is derived at mint time, a determined minter could
          try to <span className="italic">work</span> the randomness — timing
          their mint, minting from several wallets, or otherwise engineering
          the conditions to chase a specific color match. That&apos;s allowed.
          If someone puts in that much effort and lands the match they were
          after, they earned it — they worked hard for it, and they deserve it.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Disclaimer</h2>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          Please read this before minting. Art Plummers have no intrinsic value
          and carry no expectation of financial return. There is no team and
          there is no roadmap. They are completely useless and exist for
          entertainment purposes only.
        </p>
      </section>

      <Link
        href="/"
        className="text-sm underline underline-offset-4 hover:opacity-70"
      >
        ← back home
      </Link>
    </main>
  );
}
