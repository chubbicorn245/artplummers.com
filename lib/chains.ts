import { defineChain } from "viem";

/**
 * Robinhood Chain testnet — an Arbitrum Orbit L2 using ETH for gas, where
 * ArtPlumber is deployed. Faucet: https://faucet.testnet.chain.robinhood.com
 *
 * Note prevrandao is a constant on Arbitrum-lineage chains, so a token's mint
 * seed reduces to keccak256(minter, tokenId) — see the contract's README on
 * why that is a deliberate part of the hunt rather than a bug.
 */
export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.testnet.chain.robinhood.com",
    },
  },
  testnet: true,
});

/**
 * Robinhood Chain mainnet. Same Arbitrum Orbit lineage as the testnet, so
 * the same prevrandao caveat applies: a token's mint seed reduces to
 * keccak256(minter, tokenId) and is precomputable. The contract's README
 * treats that as part of the hunt rather than a bug — worth re-reading
 * before real money rides on the odds.
 *
 * The explorer is Blockscout behind Cloudflare, which challenges automated
 * requests; that affects tooling like `forge verify-contract`, not links.
 */
export const robinhoodMainnet = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://robinhoodchain.blockscout.com",
    },
  },
});
