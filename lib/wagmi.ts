import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { robinhoodMainnet, robinhoodTestnet } from "@/lib/chains";
import { mintChain } from "@/lib/contract";

/**
 * Optional keyed RPC for the chain we mint on. The public endpoint works;
 * a keyed one is steadier under load. Applied only to the configured mint
 * chain — it names one endpoint, and pointing the other Robinhood chain at
 * it would send requests to the wrong network.
 */
const robinhoodRpc = process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL || undefined;

function robinhoodTransport(chainId: number) {
  return http(chainId === mintChain.id ? robinhoodRpc : undefined);
}

/**
 * Three chains, on purpose. Eligibility is a fact about Ethereum mainnet
 * history, while the mint happens on Robinhood — so the app reads from one
 * and writes to the other, and the mint button prompts a network switch when
 * the wallet is on the wrong one. Both Robinhood chains are registered so
 * NEXT_PUBLIC_MINT_CHAIN_ID can select either without a code change.
 */
export const config = createConfig({
  chains: [mainnet, robinhoodTestnet, robinhoodMainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [robinhoodTestnet.id]: robinhoodTransport(robinhoodTestnet.id),
    [robinhoodMainnet.id]: robinhoodTransport(robinhoodMainnet.id),
  },
  ssr: true,
});
