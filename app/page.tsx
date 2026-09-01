import Link from "next/link";
import { ConnectWallet } from "@/components/connect-wallet";
import { CutoffDate } from "@/components/cutoff-date";
import { MintButton } from "@/components/mint-button";
import { MintTerms } from "@/components/mint-terms";
import {
  FREE_ALLOWANCE,
  MAX_SUPPLY,
  MINT_PRICE_ETH,
} from "@/lib/economics";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 font-sans">
      {/* Torn-tissue edge filter used by the card's ::before */}
      <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter id="tp-tear" x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.011 0.014"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="9"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div className="tp-square flex w-full max-w-md flex-col items-center gap-6 p-8 sm:p-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/plumber.svg"
          alt="Art Plummer — a pixel-art frog plumber holding a plunger"
          width={160}
          height={160}
          className="h-40 w-40 rounded-lg ring-1 ring-green-400/20 [image-rendering:pixelated] drop-shadow-[0_6px_18px_rgba(120,200,90,0.28)]"
        />
        <h1 className="text-3xl font-bold tracking-tight">Art Plummers</h1>
        <p className="text-center">
          Mint an Art Plummer{" "}
          <span className="block text-sm text-[color:var(--foreground)]/60">
            {MAX_SUPPLY.toLocaleString()} onchain frogs · {MINT_PRICE_ETH} ETH
            each · wallets active before <CutoffDate /> mint {FREE_ALLOWANCE}{" "}
            free
          </span>
        </p>
        <ConnectWallet />
        <MintTerms />
        <MintButton />
        <div className="flex gap-4">
          {[
            { href: "/whitepaper", label: "whitepaper" },
            { href: "/disclaimer", label: "disclaimer" },
            { href: "/privacy", label: "privacy" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm underline underline-offset-4 opacity-60 transition-opacity hover:opacity-100"
            >
              {label}
            </Link>
          ))}
        </div>
        <p className="max-w-md text-center text-xs text-[color:var(--foreground)]/50">
          Disclaimer: Art Plummers have no intrinsic value and carry no
          expectation of financial return. There is no team and there is no
          roadmap. They are completely useless and exist for entertainment
          purposes only.
        </p>
      </div>
    </main>
  );
}
