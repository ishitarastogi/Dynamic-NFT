/* eslint-disable @typescript-eslint/naming-convention */
import hre from "hardhat";
import { GelatoOpsSDK, isGelatoOpsSupported, TaskTransaction, Web3Function } from "@gelatonetwork/ops-sdk";
import { Web3FunctionBuilder } from "@gelatonetwork/web3-functions-sdk/builder";
import { Contract } from "ethers";

async function main() {
  const chainId = hre.network.config.chainId as number;
 
  // Init GelatoOpsSDK
  const [signer] = await hre.ethers.getSigners();
  const gelatoOps = new GelatoOpsSDK(chainId, signer);
  const dedicatedMsgSender = await gelatoOps.getDedicatedMsgSender();
  console.log(`Dedicated msg.sender: ${dedicatedMsgSender.address}`);

 
  let iface = (await hre.ethers.getContractFactory("GelatoBotNft")).interface;
  let cid= ""
  let execAbi=""
  let execAddress =""
  let gelatoBotNft = new Contract(execAddress, execAbi, hre.ethers.provider)
 


  // Create Gelato automated ask
  console.log("Creating Task...");
  const { taskId, tx }: TaskTransaction = await gelatoOps.createTask({
    execAddress: gelatoBotNft.address,
    execSelector: gelatoBotNft.interface.getSighash("revealNft(uint256 tokenId, string memory tokenURI)"),
    execAbi,
    name: "Gelato Bot NFT Generator v1.2",
    dedicatedMsgSender: true,
    web3FunctionHash: cid,
    web3FunctionArgs: { nftAddress: gelatoBotNft.address },
  });
  await tx.wait();
  console.log(`Task created, taskId: ${taskId} (tx hash: ${tx.hash})`);
  console.log(`> https://beta.app.gelato.network/task/${taskId}?chainId=${chainId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
