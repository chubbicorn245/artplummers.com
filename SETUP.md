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

Open http://localhost:3000, connect a wallet, and the eligibility check runs automatically:

- **✓ You're eligible** — the wallet sent at least one mainnet transaction before November 2021
- **✗ Not eligible** — it didn't

You can also hit the API directly:

```bash
curl http://localhost:3000/api/eligibility/<wallet-address>
# → {"address":"0x…","eligible":true,"cutoffBlock":"13527858"}
```

## 4. Deploy (Vercel)

Set `MAINNET_RPC_URL` in the project's environment variables (all environments). Nothing else is required — the eligibility route is a standard serverless function.

## Related

The smart contract (Plumbers, ERC721A + EIP-712 vouchers) and the voucher-signing tooling live in the `plumber-contract` repo — see its `README.md` and `SETUP.md`. The mint step (voucher signing + on-chain mint) will build on the eligibility check in a follow-up PR.
