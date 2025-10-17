// Deploy script for NeoCity Smart Contracts
const hre = require("hardhat");

async function main() {
  console.log("Starting deployment of NeoCity Smart Contracts...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "wei\n");

  // 1. Deploy DeFiToken
  console.log("1. Deploying DeFiToken...");
  const DeFiToken = await hre.ethers.getContractFactory("DeFiToken");
  const token = await DeFiToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  const initialSupply = await token.balanceOf(deployer.address);
  const maxSupply = await token.MAX_SUPPLY();
  console.log("✅ DeFiToken deployed to:", tokenAddress);
  console.log("   Initial Supply:", hre.ethers.formatEther(initialSupply), "NEO");
  console.log("   Max Supply:", hre.ethers.formatEther(maxSupply), "NEO\n");

  // 2. Deploy IdentityRegistry
  console.log("2. Deploying IdentityRegistry...");
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();
  console.log("✅ IdentityRegistry deployed to:", identityRegistryAddress, "\n");

  // 3. Deploy DeFiBank
  console.log("3. Deploying DeFiBank...");
  const DeFiBank = await hre.ethers.getContractFactory("DeFiBank");
  const bank = await DeFiBank.deploy(tokenAddress, identityRegistryAddress);
  await bank.waitForDeployment();
  const bankAddress = await bank.getAddress();
  console.log("✅ DeFiBank deployed to:", bankAddress);
  console.log("   Token Address:", tokenAddress);
  console.log("   Identity Registry:", identityRegistryAddress, "\n");

  // 4. Deploy Voting
  console.log("4. Deploying Voting...");
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(identityRegistryAddress);
  await voting.waitForDeployment();
  const votingAddress = await voting.getAddress();
  console.log("✅ Voting deployed to:", votingAddress);
  console.log("   Identity Registry:", identityRegistryAddress, "\n");

  // 5. Deploy Grievance
  console.log("5. Deploying Grievance...");
  const Grievance = await hre.ethers.getContractFactory("Grievance");
  const grievance = await Grievance.deploy(identityRegistryAddress);
  await grievance.waitForDeployment();
  const grievanceAddress = await grievance.getAddress();
  console.log("✅ Grievance deployed to:", grievanceAddress);
  console.log("   Identity Registry:", identityRegistryAddress, "\n");

  // 6. Deploy EHRRegistry
  console.log("6. Deploying EHRRegistry...");
  const EHRRegistry = await hre.ethers.getContractFactory("EHRRegistry");
  const ehrRegistry = await EHRRegistry.deploy(identityRegistryAddress);
  await ehrRegistry.waitForDeployment();
  const ehrRegistryAddress = await ehrRegistry.getAddress();
  console.log("✅ EHRRegistry deployed to:", ehrRegistryAddress);
  console.log("   Identity Registry:", identityRegistryAddress, "\n");

  // 7. Deploy SupplyChain
  console.log("7. Deploying SupplyChain...");
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment();
  const supplyChainAddress = await supplyChain.getAddress();
  console.log("✅ SupplyChain deployed to:", supplyChainAddress, "\n");

  // 8. Deploy TrafficLog
  console.log("8. Deploying TrafficLog...");
  const TrafficLog = await hre.ethers.getContractFactory("TrafficLog");
  const trafficLog = await TrafficLog.deploy();
  await trafficLog.waitForDeployment();
  const trafficLogAddress = await trafficLog.getAddress();
  console.log("✅ TrafficLog deployed to:", trafficLogAddress, "\n");

  // Summary
  console.log("=".repeat(70));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(70));
  console.log("\nCore Infrastructure:");
  console.log("-------------------");
  console.log("DeFiToken:          ", tokenAddress);
  console.log("IdentityRegistry:   ", identityRegistryAddress);
  console.log("\nFinancial Services:");
  console.log("-------------------");
  console.log("DeFiBank:           ", bankAddress);
  console.log("\nGovernance:");
  console.log("-----------");
  console.log("Voting:             ", votingAddress);
  console.log("Grievance:          ", grievanceAddress);
  console.log("\nPublic Services:");
  console.log("----------------");
  console.log("EHRRegistry:        ", ehrRegistryAddress);
  console.log("SupplyChain:        ", supplyChainAddress);
  console.log("TrafficLog:         ", trafficLogAddress);
  console.log("\n" + "=".repeat(70));

  // Save deployment addresses to file
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      DeFiToken: tokenAddress,
      IdentityRegistry: identityRegistryAddress,
      DeFiBank: bankAddress,
      Voting: votingAddress,
      Grievance: grievanceAddress,
      EHRRegistry: ehrRegistryAddress,
      SupplyChain: supplyChainAddress,
      TrafficLog: trafficLogAddress,
    },
  };

  fs.writeFileSync(
    "deployments.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n✅ Deployment addresses saved to deployments.json");

  console.log("\n🎉 All contracts deployed successfully!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
