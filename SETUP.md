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
```

This is the Ethereum mainnet RPC used by `/api/eligibility/[address]` to read a wallet's nonce at historical block `13527858` (the last block before 2021-11-01 00:00 UTC). It must be **archive-capable**:

- Works keyless (fine for local dev): `https://eth.drpc.org`, `https://1rpc.io/eth`
- For production, use a keyed provider (Alchemy/Infura free tiers include archive access) — keyless public RPCs are rate-limited and can drop archive support at any time.

## 3. Run

```bash
npm run dev
```

Open http://localhost:3000, connect a wallet, and the check runs automatically. It decides the **price**, not whether you can mint — the mint is open to everyone:

- **✓ OG wallet** — sent at least one mainnet transaction before November 2021, so its first 2 Plummers are free, then 0.002 ETH each up to 10 total
- **0.002 ETH each** — it didn't, so every one of its 10 costs 0.002 ETH

The numbers above live in `lib/economics.ts`, mirrored from the contract's constants. Change them there, not inline in components.

You can also hit the API directly:

```bash
curl http://localhost:3000/api/eligibility/<wallet-address>
# → {"address":"0x…","eligible":true,"cutoffBlock":"13527858"}
```

`eligible` means *eligible for the free mint*. It is not a gate: a wallet with
`"eligible":false` can still mint, at full price.

## 4. Deploy (Vercel)

Set `MAINNET_RPC_URL` in the project's environment variables (all environments). Nothing else is required — the eligibility route is a standard serverless function.

## Related

The smart contract (Art Plumber, ERC-721 + EIP-712 vouchers) and the voucher-signing tooling live in the sibling `plumbers-contract` repo — see its `README.md`.

The mint step is **not built yet**. It needs two things that don't exist as of this writing: a deployed contract address, and a `/api/voucher` route holding the eligibility signer key to sign EIP-712 vouchers. When it lands, it must read `priceFor(wallet, quantity, signature)` from the contract for the exact `msg.value` rather than recomputing the free/paid split in TypeScript — `mint()` requires an exact match and reverts with `WRONG_PRICE` otherwise.
