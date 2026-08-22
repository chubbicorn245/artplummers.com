import type { Metadata } from "next";
import Link from "next/link";
import { CutoffDate } from "@/components/cutoff-date";

export const metadata: Metadata = {
  title: "Whitepaper — Art Plummers",
  description:
    "How Art Plummers works: pre–November 2021 wallet eligibility, onchain minting, and fully onchain generative art.",
};

export default function Whitepaper() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-6 py-16 font-sans">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Whitepaper</h1>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          Art Plummers are pixel-art frog plumbers, minted by early Ethereum
          wallets and generated entirely onchain. This page explains who can
          mint, how eligibility is verified, and how the art works.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Who can mint</h2>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          Only wallets that made at least one Ethereum mainnet transaction
          before <CutoffDate /> can mint an Art Plummer. If your wallet was
          active before the cutoff, you&apos;re eligible. Eligibility is a
          historical fact already recorded on Ethereum, so it&apos;s fixed — it
          isn&apos;t something that can be added or changed after the fact.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">How minting is verified</h2>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          Eligibility is checked by reading your wallet&apos;s{" "}
          <span className="font-medium">nonce</span> (its total sent-transaction
          count) as of block <span className="font-mono">13,527,858</span> — the
          last mainnet block mined before 2021-11-01 00:00 UTC. If that nonce is
          greater than zero, the wallet had already sent a transaction before{" "}
          <CutoffDate />, so it&apos;s eligible.
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
          There is no list to maintain and nothing to trust: eligibility is
          derived live from Ethereum&apos;s own history, it&apos;s the same for
          everyone, and it can&apos;t be secretly changed. It&apos;s
          permissionless and self-serve — connect a wallet and find out.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Mint limit</h2>
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
          Each eligible wallet can mint at most{" "}
          <span className="font-medium">3</span> Art Plummers. Eligibility is
          per-wallet, so if you also control another wallet that transacted
          before <CutoffDate />, you can switch to that wallet and mint from it
          too. Every eligible wallet gets its own allocation of up to three.
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
          their mint, using multiple eligible wallets, or otherwise engineering
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
