import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  const [signer] = await hre.ethers.getSigners();
  let nonce = await signer.getTransactionCount();

  // Deploying NFT contract
  const nftFactory = await hre.ethers.getContractFactory("GelatoNft", signer);
  console.log("Deploying contract....");
  const nft = await nftFactory.deploy(
    "0x2e4d6bec6cd616f71274fae0fbfaceb5188b55c2"
  );
  console.log("Contract deployed to:", nft.address);

  await nft.deployed();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
