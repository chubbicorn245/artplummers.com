import type { ReactElement } from "react";
import { act, render } from "@testing-library/react";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { connect } from "wagmi/actions";
import { mainnet } from "wagmi/chains";
import { mock } from "wagmi/connectors";
import {
  decodeFunctionData,
  encodeEventTopics,
  encodeFunctionResult,
  zeroAddress,
  type Chain,
} from "viem";
import { artPlumberAbi } from "@/lib/abi/art-plumber";
import { robinhoodTestnet } from "@/lib/chains";

/** The wallet that minted tokens 1 and 2 on testnet — an OG. */
export const TEST_ACCOUNT = "0x1b1077Bb5c92B83b645faa421D71C91b702e9fA2";

const TX_HASH =
  "0x466c8175a0a5b5932d74412a4f32a6853547b43e658e506f8c48a673dad9085e";
const BLOCK_HASH = `0x${"1".repeat(64)}`;
const VOUCHER = `0x${"ab".repeat(65)}`;

type HarnessOptions = {
  /** Chain the wallet is connected to. Defaults to the mint chain. */
  chain?: Chain;
  /** What priceFor returns, in wei. */
  price?: bigint;
  /** Whether /api/voucher issues a voucher (OG) or 403s. */
  og?: boolean;
  /** Traits every minted token reports, as tokenURI attributes. */
  attributes?: Array<{ trait_type: string; value: string }>;
  /** Make tokenURI return something undecodable, to test degradation. */
  brokenTokenUri?: boolean;
};

const DEFAULT_ATTRIBUTES = [
  { trait_type: "Plungers", value: "Hand Only" },
  { trait_type: "Held Plunger Sucker", value: "Sky" },
  { trait_type: "Suit", value: "Purple" },
  { trait_type: "Boots", value: "Midnight" },
  { trait_type: "Suckers Match", value: "No" },
  { trait_type: "Sticks Match", value: "No" },
  { trait_type: "Uniform Match", value: "No" },
];

/** A 1x1 SVG, shaped like the contract's data URI so <img> gets a real src. */
const SVG_DATA_URI = `data:image/svg+xml;base64,${btoa(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>'
)}`;

/**
 * A real wagmi config over a faked `fetch`.
 *
 * The fake sits at the fetch layer rather than being a viem transport
 * because wagmi's mock connector does not use the config's transport — it
 * posts to `chain.rpcUrls.default.http[0]` directly. Faking fetch catches
 * the connector, the config transport, and the app's own /api/voucher call
 * in one place, so nothing about wagmi or react-query is stubbed and the
 * tests exercise the hook, cache and query-key behaviour that ships.
 */
export function createHarness({
  chain,
  price = BigInt(0),
  og = false,
  attributes = DEFAULT_ATTRIBUTES,
  brokenTokenUri = false,
}: HarnessOptions = {}) {
  const connectedChain = chain ?? robinhoodTestnet;
  const calls = { priceFor: 0, mint: 0, voucher: 0, tokenURI: 0 };
  let priceForResult = price;
  /** Ids the pending mint created, derived from the transaction it sent. */
  let mintedIds: bigint[] = [];
  let nextId = BigInt(1);

  function tokenUriFor(id: bigint) {
    if (brokenTokenUri) return "https://example.com/not-on-chain.json";
    return `data:application/json;base64,${btoa(
      JSON.stringify({
        name: `Art Plumber #${id}`,
        description: "test",
        image: SVG_DATA_URI,
        attributes,
      })
    )}`;
  }

  /** Every mint emits Transfer from the zero address; that is how the UI
   *  learns which ids it just got. */
  function transferLog(id: bigint, index: number) {
    return {
      address: process.env.NEXT_PUBLIC_ART_PLUMBER_ADDRESS,
      topics: encodeEventTopics({
        abi: artPlumberAbi,
        eventName: "Transfer",
        args: { from: zeroAddress, to: TEST_ACCOUNT, id },
      }),
      data: "0x",
      blockNumber: "0x1",
      blockHash: BLOCK_HASH,
      transactionHash: TX_HASH,
      transactionIndex: "0x0",
      logIndex: `0x${index.toString(16)}`,
      removed: false,
    };
  }

  const receipt = {
    transactionHash: TX_HASH,
    transactionIndex: "0x0",
    blockHash: BLOCK_HASH,
    blockNumber: "0x1",
    from: TEST_ACCOUNT,
    to: null,
    contractAddress: null,
    cumulativeGasUsed: "0x5208",
    gasUsed: "0x5208",
    effectiveGasPrice: "0x1",
    logs: [],
    logsBloom: `0x${"0".repeat(512)}`,
    status: "0x1",
    type: "0x2",
  };

  function rpc(method: string, params: unknown): unknown {
    switch (method) {
      case "eth_chainId":
        return `0x${connectedChain.id.toString(16)}`;
      case "eth_accounts":
      case "eth_requestAccounts":
        return [TEST_ACCOUNT];
      case "eth_blockNumber":
        return "0x1";
      case "eth_gasPrice":
      case "eth_maxPriorityFeePerGas":
        return "0x1";
      case "eth_estimateGas":
        return "0x5208";
      case "eth_getBlockByNumber":
      case "eth_getBlockByHash":
        return { number: "0x1", hash: BLOCK_HASH, baseFeePerGas: "0x1", timestamp: "0x1" };
      case "eth_call": {
        const [tx] = params as [{ data: `0x${string}` }];
        const { functionName } = decodeFunctionData({ abi: artPlumberAbi, data: tx.data });
        const decoded = decodeFunctionData({ abi: artPlumberAbi, data: tx.data });
        if (functionName === "priceFor") {
          calls.priceFor++;
          return encodeFunctionResult({
            abi: artPlumberAbi,
            functionName: "priceFor",
            result: priceForResult,
          });
        }
        if (functionName === "tokenURI") {
          calls.tokenURI++;
          const [id] = decoded.args as [bigint];
          return encodeFunctionResult({
            abi: artPlumberAbi,
            functionName: "tokenURI",
            result: tokenUriFor(id),
          });
        }
        throw new Error(`unexpected call: ${functionName}`);
      }
      case "eth_sendTransaction": {
        calls.mint++;
        const [tx] = params as [{ data: `0x${string}` }];
        const { args } = decodeFunctionData({ abi: artPlumberAbi, data: tx.data });
        const quantity = Number((args as [bigint, string])[0]);
        mintedIds = Array.from({ length: quantity }, () => nextId++);
        return TX_HASH;
      }
      case "eth_getTransactionReceipt":
        return { ...receipt, logs: mintedIds.map(transferLog) };
      case "eth_getTransactionByHash":
        return { hash: TX_HASH, blockHash: BLOCK_HASH, blockNumber: "0x1", type: "0x2" };
      default:
        throw new Error(`unhandled RPC method: ${method}`);
    }
  }

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fetchStub = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url.includes("/api/voucher")) {
      calls.voucher++;
      return og
        ? json({ address: TEST_ACCOUNT, signature: VOUCHER })
        : json({ error: "This wallet does not qualify for the free mint" }, 403);
    }

    const payload = JSON.parse(String(init?.body ?? "{}"));
    const handle = (r: { id?: number; method: string; params?: unknown }) => {
      try {
        return { jsonrpc: "2.0", id: r.id ?? 1, result: rpc(r.method, r.params) };
      } catch (e) {
        return {
          jsonrpc: "2.0",
          id: r.id ?? 1,
          error: { code: -32000, message: (e as Error).message },
        };
      }
    };
    return json(Array.isArray(payload) ? payload.map(handle) : handle(payload));
  });

  const config = createConfig({
    // The connected chain must be first: the mock connector joins chains[0].
    chains: [
      connectedChain,
      connectedChain.id === mainnet.id ? robinhoodTestnet : mainnet,
    ],
    connectors: [mock({ accounts: [TEST_ACCOUNT] })],
    transports: { [mainnet.id]: http(), [robinhoodTestnet.id]: http() },
    pollingInterval: 10,
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  function wrap(ui: ReactElement) {
    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </WagmiProvider>
    );
  }

  return {
    config,
    calls,
    /** Change what priceFor returns, e.g. after a mint spends the allowance. */
    setPrice(next: bigint) {
      priceForResult = next;
    },
    /**
     * Render, then connect — the order the real app sees. Connecting before
     * render leaves the hooks subscribed after the state changed, so they
     * never observe it and report `disconnected`.
     */
    async renderConnected(ui: ReactElement) {
      vi.stubGlobal("fetch", fetchStub);
      const result = render(wrap(ui));
      await act(async () => {
        await connect(config, { connector: config.connectors[0] });
      });
      return result;
    },
    /** Render without connecting a wallet. */
    renderDisconnected(ui: ReactElement) {
      vi.stubGlobal("fetch", fetchStub);
      return render(wrap(ui));
    },
  };
}
