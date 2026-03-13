import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance));

  const CollectorsRepublicNFT = await hre.ethers.getContractFactory("CollectorsRepublicNFT");

  const contract = await CollectorsRepublicNFT.deploy(
    deployer.address, // admin
    deployer.address, // minter (relayer)
    250,              // 2.5% platform fee
    deployer.address  // fee recipient
  );

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("\n=================================");
  console.log("CollectorsRepublicNFT deployed to:", address);
  console.log("=================================");
  console.log("\nAdd to .env:");
  console.log(`NFT_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
