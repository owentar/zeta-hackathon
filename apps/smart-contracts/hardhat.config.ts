import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    zetaTestnet: {
      url: "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
      chainId: 7001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    zetaMainnet: {
      url: "https://zetachain-evm.blockpi.network/v1/rpc/public",
      chainId: 7000,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  // etherscan: {
  //   apiKey: {
  //     zetaTestnet: process.env.ZETASCAN_API_KEY || "",
  //     zetaMainnet: process.env.ZETASCAN_API_KEY || "",
  //   },
  //   customChains: [
  //     {
  //       network: "zetaTestnet",
  //       chainId: 7001,
  //       urls: {
  //         apiURL: "https://explorer.zetachain.com/api",
  //         browserURL: "https://explorer.zetachain.com",
  //       },
  //     },
  //     {
  //       network: "zetaMainnet",
  //       chainId: 7000,
  //       urls: {
  //         apiURL: "https://explorer.zetachain.com/api",
  //         browserURL: "https://explorer.zetachain.com",
  //       },
  //     },
  //   ],
  // },
};

export default config;
