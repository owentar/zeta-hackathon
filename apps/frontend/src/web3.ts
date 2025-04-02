import { Chain, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const zetaMainnetChain: Chain = {
  id: 7000,
  name: "ZetaChain",
  iconUrl: "https://hub.zetachain.com/img/logos/zetachain-logo.svg",
  iconBackground: "transparent",
  nativeCurrency: { name: "ZetaChain Coin", symbol: "ZETA", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://zetachain-evm.blockpi.network/v1/rpc/public"] },
    public: { http: ["https://zetachain-evm.blockpi.network/v1/rpc/public"] },
  },
  blockExplorers: {
    default: { name: "ZetaScan", url: "https://explorer.zetachain.com/" },
  },
};

const zetaTestnetChain: Chain = {
  id: 7001,
  name: "ZetaChain Testnet",
  iconUrl: "https://hub.zetachain.com/img/logos/zetachain-logo.svg",
  iconBackground: "transparent",
  nativeCurrency: {
    name: "ZetaChain Testnet Coin",
    symbol: "ZETA",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://zetachain-athens-evm.blockpi.network/v1/rpc/public"],
    },
    public: {
      http: ["https://zetachain-athens-evm.blockpi.network/v1/rpc/public"],
    },
  },
  blockExplorers: {
    default: {
      name: "ZetaScan",
      url: "https://athens.explorer.zetachain.com/",
    },
  },
};

export const config = getDefaultConfig({
  appName: "Age Lens",
  projectId: "ff927c008da36b5ffada567c6eaf5f95",
  chains: [zetaMainnetChain, zetaTestnetChain],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
