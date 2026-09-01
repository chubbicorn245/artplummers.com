import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { robinhoodMainnet, robinhoodTestnet } from "@/lib/chains";

/**
 * Two chains, on purpose. Eligibility is a fact about Ethereum mainnet
 * history, while the mint itself happens on Robinhood Chain — so the app
 * reads from one and writes to the other, and the mint button prompts a
 * network switch when the wallet is on the wrong one.
 */
export const config = createConfig({
  chains: [mainnet, robinhoodTestnet, robinhoodMainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [robinhoodTestnet.id]: http(),
    [robinhoodMainnet.id]: http(),
  },
  ssr: true,
});
