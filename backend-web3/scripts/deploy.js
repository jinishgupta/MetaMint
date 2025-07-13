import hre from "hardhat";

async function main() {
  // Deploy NFTCollection
  const NFTCollection = await hre.ethers.getContractFactory("NFTMarketplace");
  const nft = await NFTCollection.deploy();
  await nft.waitForDeployment();
  console.log("NFTCollection deployed to:", nft.target);

  // Deploy Auction
//   const Auction = await hre.ethers.getContractFactory("Auction");
//   const auction = await Auction.deploy();
//   await auction.waitForDeployment();
//   console.log("Auction deployed to:", auction.target);
  }

main().catch((error) => {
  console.error(error); 
  process.exitCode = 1;
}); 