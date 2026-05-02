import { network } from "hardhat";

const { ethers } = await network.create();

async function main() {
  console.log("Deploying CredentialSBT to Sepolia...");

  // Lấy deployer account từ private key trong .env
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Kiểm tra balance trước khi deploy
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy contract
  const factory = await ethers.getContractFactory("CredentialSBT");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ CredentialSBT deployed to:", address);
  console.log("📋 Save this address — your teammate needs it for the frontend!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});