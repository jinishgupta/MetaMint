import hre from "hardhat";
import fs from "fs";

async function main() {
  // Deploy NFTCollection
  const NFTCollection = await hre.ethers.getContractFactory("NFTMarketplace");
  const nft = await NFTCollection.deploy();
  await nft.waitForDeployment();
  console.log("NFTCollection deployed to:", nft.target);
  const nftData = {
    address: nft.target,
    abi: JSON.parse(nft.interface.format("json")),
  };
  fs.writeFileSync('./src/Marketplace.json', JSON.stringify(nftData));

  // Deploy Auction
  const Auction = await hre.ethers.getContractFactory("Auction");
  const auction = await Auction.deploy();
  await auction.waitForDeployment();
  console.log("Auction deployed to:", auction.target);
  const auctionData = {
    address: auction.target,
    abi: JSON.parse(auction.interface.format("json")),
  };
  fs.writeFileSync('./src/Auction.json', JSON.stringify(auctionData));
}

main().catch((error) => {
  console.error(error); 
  process.exitCode = 1;
}); 