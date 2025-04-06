import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    zetaTestnet: {
      url:
        process.env.ZETA_TESTNET_RPC_URL ||
        "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
      chainId: 7001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    zetaMainnet: {
      url:
        process.env.ZETA_MAINNET_RPC_URL ||
        "https://zetachain-evm.blockpi.network/v1/rpc/public",
      chainId: 7000,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
    alwaysGenerateOverloads: true,
    discriminateTypes: true,
    dontOverrideCompile: false,
    externalArtifacts: ["externalArtifacts/*.json"],
  },
  etherscan: {
    apiKey: {
      zetaTestnet: "empty",
      zetaMainnet: "empty",
    },
    customChains: [
      {
        network: "zetaTestnet",
        chainId: 7001,
        urls: {
          apiURL: "https://zetachain-testnet.blockscout.com/api",
          browserURL: "https://zetachain-testnet.blockscout.com",
        },
      },
      {
        network: "zetaMainnet",
        chainId: 7000,
        urls: {
          apiURL: "https://explorer.zetachain.com/api",
          browserURL: "https://explorer.zetachain.com",
        },
      },
    ],
  },
};

export default config;
