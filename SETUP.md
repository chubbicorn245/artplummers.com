# Setup

## Prerequisites

- Node.js 20+ (tested on 22)
- A browser wallet (MetaMask, Rabby, etc.) to test the connect flow

## 1. Install

```bash
npm install
```

## 2. Environment

Create `.env.local` (see `.env.example`):

```bash
MAINNET_RPC_URL=https://eth.drpc.org
NEXT_PUBLIC_ART_PLUMBER_ADDRESS=
ELIGIBILITY_SIGNER_PRIVATE_KEY=
```

**`MAINNET_RPC_URL`** — the Ethereum mainnet RPC used by `/api/eligibility` and `/api/voucher` to read a wallet's nonce at historical block `13527858` (the last block before 2021-11-01 00:00 UTC). It must be **archive-capable**:

- Works keyless (fine for local dev): `https://eth.drpc.org`, `https://1rpc.io/eth`
- For production, use a keyed provider (Alchemy/Infura free tiers include archive access) — keyless public RPCs are rate-limited and can drop archive support at any time.

**`NEXT_PUBLIC_ART_PLUMBER_ADDRESS`** — the deployed contract on Robinhood Chain testnet (chain id 46630). Leave it empty until you deploy; the site shows "Minting isn't live yet" instead of a button that cannot work.

**`ELIGIBILITY_SIGNER_PRIVATE_KEY`** — the key that signs OG vouchers. It must be the private key of the address passed as the contract's `signer` constructor argument. Generate it with `cast wallet new`, deploy with the matching address, then put the key here.

> **Server-only.** Never prefix it with `NEXT_PUBLIC_`, never commit it. The contract has no owner and the signer cannot be rotated, so a leaked key means redeploying. In production it belongs in the deployment platform's environment variables or a secret manager.

## 3. Run

```bash
npm run dev
```

Open http://localhost:3000, connect a wallet, and the check runs automatically. It decides the **price**, not whether you can mint — the mint is open to everyone:

- **✓ OG wallet** — sent at least one mainnet transaction before November 2021, so its first 2 Plummers are free, then 0.003 ETH each
- **0.003 ETH each** — it didn't, so every Plummer it mints costs 0.003 ETH

There is no per-wallet cap: a wallet can mint as many as it likes, up to 20 per transaction.

The numbers above live in `lib/economics.ts`, mirrored from the contract's constants. Change them there, not inline in components.

You can also hit the API directly:

```bash
curl http://localhost:3000/api/eligibility/<wallet-address>
# → {"address":"0x…","eligible":true,"cutoffBlock":"13527858"}

curl http://localhost:3000/api/voucher/<wallet-address>
# OG      → {"address":"0x…","signature":"0x…"}
# not OG  → 403 {"error":"This wallet does not qualify for the free mint"}
# no NEXT_PUBLIC_ART_PLUMBER_ADDRESS → 503 {"error":"Minting is not live yet"}
```

`eligible` means *eligible for the free mint*. It is not a gate: a wallet with
`"eligible":false` can still mint, at full price.

`/api/voucher` re-runs the eligibility check server-side rather than trusting
the client — signing is what makes the claim true on-chain. A 403 is the
normal answer for a non-OG wallet, and the mint button falls back to minting
with an empty `0x` voucher at full price.

## 4. Test

```bash
npm test
```

Covers `lib/eligibility.ts` (the nonce rule, via an injected reader — no
network) and `lib/voucher.ts`. The voucher tests pin the EIP-712 digest
against one computed independently with Foundry: if viem's domain or type
definitions ever drift from the contract's, the signature would fail
`ecrecover` on-chain with no other symptom, and that assertion is what
catches it.

## 5. How the mint works

1. Connect a wallet. `/api/eligibility` reports whether it is an OG, and the panel shows what it will pay.
2. The mint button fetches `/api/voucher`; a non-OG gets a 403 and mints with an empty `0x` voucher instead.
3. It reads **`priceFor(wallet, quantity, signature)`** from the contract for the exact `msg.value`. The free/paid split is never recomputed in TypeScript — free tokens are spent first, so the price depends on how much of the allowance the wallet has already used, and `mint()` reverts `WRONG_PRICE` on any mismatch.
4. If the wallet is not on chain 46630 the button offers to switch networks first — eligibility is read from mainnet, but the mint is sent to Robinhood Chain.

## 6. Deploy (Vercel)

Set `MAINNET_RPC_URL`, `NEXT_PUBLIC_ART_PLUMBER_ADDRESS`, and `ELIGIBILITY_SIGNER_PRIVATE_KEY` in the project's environment variables (all environments). No migration; both API routes are standard serverless functions.

## Related

The smart contract (Art Plumber, ERC-721 + EIP-712 vouchers) and the voucher-signing tooling live in the sibling `plumbers-contract` repo — see its `README.md`.

The mint step is **not built yet**. It needs two things that don't exist as of this writing: a deployed contract address, and a `/api/voucher` route holding the eligibility signer key to sign EIP-712 vouchers. When it lands, it must read `priceFor(wallet, quantity, signature)` from the contract for the exact `msg.value` rather than recomputing the free/paid split in TypeScript — `mint()` requires an exact match and reverts with `WRONG_PRICE` otherwise.
