import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
// Note: @fhevm/hardhat-plugin disabled due to ethers v5/v6 conflict
// For full FHE testing, deploy to Sepolia testnet instead
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            viaIR: true,
        },
    },
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
            chainId: 11155111,
        },
        hardhat: {
            chainId: 31337,
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
};

export default config;
