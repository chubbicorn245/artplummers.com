import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Whitepaper — Art Plummers",
  description: "The Art Plummers whitepaper",
};

export default function Whitepaper() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 font-sans">
      <h1>Whitepaper</h1>
      <p className="text-sm text-black/60 dark:text-white/60">Coming soon.</p>
      <Link
        href="/"
        className="text-sm underline underline-offset-4 hover:opacity-70"
      >
        ← back home
      </Link>
    </main>
  );
}
