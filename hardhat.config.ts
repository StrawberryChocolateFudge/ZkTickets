import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-contract-sizer";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

import "./tasks/deploy";
import "./tasks/deployAirdrop";
import "./tasks/zkpVerifierTestnet";

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  networks: {
    donau: {
      url: process.env.BTT_DONAU_TESTNET_API || "",
      accounts:
        process.env.KEY_DONAU !== undefined ? [process.env.KEY_DONAU] : [],
    },
    // zktron: {
    //   url: process.env.ZKTRON || "",
    //   accounts:
    //     process.env.KEY_DONAU !== undefined ? [process.env.KEY_DONAU] : [],
    // },
    // mumbai: {
    //   url: process.env.MUMBAI || "",
    //   accounts:
    //     process.env.KEY_DONAU !== undefined ? [process.env.KEY_DONAU] : [],
    // },
    // nile: {
    //   url: process.env.NILE || "",
    //   accounts:
    //     process.env.KEY_DONAU !== undefined ? [process.env.KEY_DONAU] : [],
    // }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 40
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  }
};

export default config;
