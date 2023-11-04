/* eslint-disable @typescript-eslint/naming-convention */
import hre from "hardhat";
import { Web3FunctionBuilder } from "@gelatonetwork/web3-functions-sdk/builder";

async function main() {
  const chainId = hre.network.config.chainId as number;
 

  // Deploy Web3Function on IPFS
  console.log("Deploying Web3Function on IPFS...");
  const web3Function = "./web3-functions/stable-diffusion-nft/index.ts";
  const cid = await Web3FunctionBuilder.deploy(web3Function);
  console.log(`Web3Function IPFS CID: ${cid}`);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
