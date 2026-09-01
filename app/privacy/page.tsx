import type { Metadata } from "next";
import Link from "next/link";
import { CutoffDate } from "@/components/cutoff-date";

export const metadata: Metadata = {
  title: "Privacy — Art Plummers",
  description:
    "What this site sees, what it keeps, and what it sends elsewhere. There are no accounts, no analytics and no database.",
};

const P = "text-sm leading-relaxed text-black/70 dark:text-white/70";
const LI = "text-sm leading-relaxed text-black/70 dark:text-white/70";

export default function Privacy() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-6 py-16 font-sans">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
        <p className={P}>
          Last updated <span className="font-medium">[DATE]</span>. There are no
          accounts, no sign-up, no analytics, no advertising and no database.
          This page describes the whole of it.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">What the site sees</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li className={LI}>
            <span className="font-medium">Your wallet address</span>, once you
            connect one. It is sent to our own API to check whether you
            qualify for the free mint, and it appears in the transaction you
            sign.
          </li>
          <li className={LI}>
            <span className="font-medium">Your IP address</span>, as part of
            any ordinary web request. We use it only to rate-limit the API so
            one caller cannot exhaust it.
          </li>
        </ul>
        <p className={P}>
          We do not ask for, and have nowhere to put, your name, email address,
          phone number or payment details. Nothing on this site sets a cookie.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">What is kept, and for how long</h2>
        <p className={P}>
          Two things are held in server memory: whether an address qualifies
          for the free mint, and the signed voucher issued for it. Both are
          kept because they can never change — whether a wallet transacted
          before <CutoffDate /> is a fact about the past — and both are lost
          whenever the server restarts. There is no database and nothing is
          written to disk.
        </p>
        <p className={P}>
          Your wallet connection is remembered by your browser, in its own
          local storage, so the page does not forget you on refresh. That stays
          on your device. Disconnecting, or clearing site data, removes it.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Who else sees it</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li className={LI}>
            <span className="font-medium">An Ethereum node provider</span>{" "}
            receives your wallet address so we can read its transaction count
            as of a block in 2021. That is the eligibility check.
          </li>
          <li className={LI}>
            <span className="font-medium">A Robinhood Chain node</span>{" "}
            receives your address and your transaction when your wallet reads
            prices or mints.
          </li>
          <li className={LI}>
            <span className="font-medium">Our hosting provider</span> keeps
            ordinary server logs, which include IP addresses.
          </li>
          <li className={LI}>
            <span className="font-medium">Your wallet software</span> has its
            own privacy policy, which we do not control.
          </li>
        </ul>
        <p className={P}>
          We do not sell data, and there is no advertising or third-party
          tracking on this site.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">
          What happens on-chain is permanent
        </h2>
        <p className={P}>
          Minting writes your wallet address and your token to a public
          blockchain. That record is readable by anyone, forever, and it is not
          ours to edit or delete — no one can honour a deletion request for it,
          including us. If you would rather not have a mint publicly tied to an
          address, use an address you are comfortable making public.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Questions</h2>
        <p className={P}>
          For anything about this page, including a request to see or delete
          what little we hold off-chain, contact{" "}
          <span className="font-medium">[CONTACT]</span>.
        </p>
      </section>

      <div className="flex gap-6">
        <Link href="/" className="text-sm underline underline-offset-4 hover:opacity-70">
          ← back home
        </Link>
        <Link href="/disclaimer" className="text-sm underline underline-offset-4 hover:opacity-70">
          disclaimer
        </Link>
      </div>
    </main>
  );
}
