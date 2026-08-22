import { ConnectWallet } from "@/components/connect-wallet";
import { EligibilityCheck } from "@/components/eligibility-check";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 font-sans">
      <h1>Art Plummers</h1>
      <p className="text-center">
        Mint an Art Plummer{" "}
        <span className="block text-sm text-black/60 dark:text-white/60">
          (wallet eligible if tx before November 2021)
        </span>
      </p>
      <ConnectWallet />
      <EligibilityCheck />
    </main>
  );
}
