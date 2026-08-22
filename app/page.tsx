import Link from "next/link";
import { ConnectWallet } from "@/components/connect-wallet";
import { CutoffDate } from "@/components/cutoff-date";
import { EligibilityCheck } from "@/components/eligibility-check";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 font-sans">
      <h1>Art Plummers</h1>
      <p className="text-center">
        Mint an Art Plummer{" "}
        <span className="block text-sm text-black/60 dark:text-white/60">
          (wallet eligible if tx before <CutoffDate />)
        </span>
      </p>
      <ConnectWallet />
      <EligibilityCheck />
      <Link
        href="/whitepaper"
        className="text-sm underline underline-offset-4 opacity-60 transition-opacity hover:opacity-100"
      >
        whitepaper
      </Link>
      <p className="max-w-md text-center text-xs text-black/40 dark:text-white/40">
        Disclaimer: Art Plummers have no intrinsic value and carry no
        expectation of financial return. There is no team and there is no
        roadmap. They are completely useless and exist for entertainment
        purposes only.
      </p>
    </main>
  );
}
