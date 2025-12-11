const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔧 Setting up roles for NeoCity contracts...\n");

  const [deployer, user1, user2, user3] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("User 1:", user1.address);
  console.log("User 2:", user2.address);
  console.log("User 3:", user3.address);

  // Read deployment addresses
  const deploymentsPath = path.join(__dirname, "../deployments.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));

  const ehrAddress = deployments.contracts.EHRRegistry;
  const supplyChainAddress = deployments.contracts.SupplyChain;

  console.log(`\nUsing EHRRegistry at: ${ehrAddress}`);
  console.log(`Using SupplyChain at: ${supplyChainAddress}`);

  // Get contracts
  const EHRRegistry = await ethers.getContractAt("EHRRegistry", ehrAddress);
  const SupplyChain = await ethers.getContractAt(
    "SupplyChain",
    supplyChainAddress
  );

  console.log("\n📋 Setting up EHRRegistry roles...");

  // Authorize deployer as doctor
  try {
    const tx1 = await EHRRegistry.authorizeDoctor(deployer.address);
    await tx1.wait();
    console.log("✅ Deployer authorized as DOCTOR");
  } catch (e) {
    console.log("⏭️  Deployer already authorized as DOCTOR");
  }

  // Authorize user1 as doctor
  try {
    const tx2 = await EHRRegistry.authorizeDoctor(user1.address);
    await tx2.wait();
    console.log("✅ User1 authorized as DOCTOR");
  } catch (e) {
    console.log("⏭️  User1 already authorized as DOCTOR");
  }

  console.log("\n📦 Setting up SupplyChain roles...");

  // Register deployer as farmer
  try {
    const tx3 = await SupplyChain.registerFarmer(deployer.address);
    await tx3.wait();
    console.log("✅ Deployer registered as FARMER");
  } catch (e) {
    console.log("⏭️  Deployer already registered as FARMER");
  }

  // Register user1 as vendor
  try {
    const tx4 = await SupplyChain.registerVendor(user1.address);
    await tx4.wait();
    console.log("✅ User1 registered as VENDOR");
  } catch (e) {
    console.log("⏭️  User1 already registered as VENDOR");
  }

  // Register user2 as farmer
  try {
    const tx5 = await SupplyChain.registerFarmer(user2.address);
    await tx5.wait();
    console.log("✅ User2 registered as FARMER");
  } catch (e) {
    console.log("⏭️  User2 already registered as FARMER");
  }

  console.log("\n✅ Role setup complete!");
  console.log("\n📝 Summary:");
  console.log("- EHR Doctors:", deployer.address, user1.address);
  console.log("- Supply Chain Farmers:", deployer.address, user2.address);
  console.log("- Supply Chain Vendors:", user1.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
