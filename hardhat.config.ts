import { HardhatUserConfig } from "hardhat/config";

// PLUGINS
import "@gelatonetwork/web3-functions-sdk/hardhat-plugin";

import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "@nomiclabs/hardhat-etherscan";
import { resolve } from "path";
import * as glob from "glob";
require("hardhat-contract-sizer");

// Process Env Variables
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ALCHEMY_ID = process.env.ALCHEMY_ID;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;

glob.sync("./tasks/**/*.ts").forEach(function (file: any) {
  require(resolve(file));
});

const config: HardhatUserConfig = {
  defaultNetwork: "mumbai",

  // web3 functions
  w3f: {
    rootDir: "./src/web3-functions",
    debug: false,
    networks: ["polygon", "mumbai"], //(multiChainProvider) injects provider for these networks
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY ?? "",
      polygon: POLYGONSCAN_API_KEY ?? "",
      polygonMumbai: POLYGONSCAN_API_KEY ?? "",
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      forking: {
        url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_ID}`,
        // blockNumber: 7704180
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    goerli: {
      chainId: 5,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_ID}`,
    },
    matic: {
      url: "https://polygon-rpc.com",
      gasPrice: 10000000000,
      accounts:
        process.env["PRIVATE_KEY"] !== undefined
          ? [process.env["PRIVATE_KEY"]]
          : [],
    },
    polygon: {
      chainId: 137,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
    },
    avax: {
      chainId: 43114,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      url: `https://api.avax.network/ext/bc/C/rpc`,
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_ID}`,

      chainId: 80001,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },

  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    ],
  },
};

export default config;
