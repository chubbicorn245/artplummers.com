import { ConnectWallet } from "@/components/connect-wallet";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 font-sans">
      <h1>Art Plummers</h1>
      <ConnectWallet />
    </main>
  );
}
