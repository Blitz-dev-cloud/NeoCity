// Setup script to initialize contracts with test data on local network
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Setting up NeoCity contracts with test data...\n");

  // Load deployment addresses
  const deploymentData = JSON.parse(fs.readFileSync("deployments.json", "utf8"));
  const contracts = deploymentData.contracts;

  // Get signers
  const [deployer, user1, user2, doctor, resolver, operator] = await hre.ethers.getSigners();
  
  console.log("Using accounts:");
  console.log("  Deployer:", deployer.address);
  console.log("  User1:", user1.address);
  console.log("  User2:", user2.address);
  console.log("  Doctor:", doctor.address);
  console.log("  Resolver:", resolver.address);
  console.log("  Operator:", operator.address, "\n");

  // Connect to deployed contracts
  const token = await hre.ethers.getContractAt("DeFiToken", contracts.DeFiToken);
  const identityRegistry = await hre.ethers.getContractAt("IdentityRegistry", contracts.IdentityRegistry);
  const bank = await hre.ethers.getContractAt("DeFiBank", contracts.DeFiBank);
  const voting = await hre.ethers.getContractAt("Voting", contracts.Voting);
  const grievance = await hre.ethers.getContractAt("Grievance", contracts.Grievance);
  const ehrRegistry = await hre.ethers.getContractAt("EHRRegistry", contracts.EHRRegistry);
  const supplyChain = await hre.ethers.getContractAt("SupplyChain", contracts.SupplyChain);
  const trafficLog = await hre.ethers.getContractAt("TrafficLog", contracts.TrafficLog);

  console.log("=".repeat(70));
  console.log("SETTING UP TEST DATA");
  console.log("=".repeat(70), "\n");

  // 1. Setup DeFiToken - Distribute tokens
  console.log("1. Distributing DeFiTokens...");
  await token.transfer(user1.address, hre.ethers.parseEther("10000"));
  await token.transfer(user2.address, hre.ethers.parseEther("10000"));
  await token.transfer(await bank.getAddress(), hre.ethers.parseEther("100000"));
  console.log("✅ Tokens distributed to test accounts\n");

  // 2. Setup IdentityRegistry - Register DIDs
  console.log("2. Registering identities...");
  try {
    await identityRegistry.connect(user1).registerIdentity(
      "did:neocity:user1",
      "QmUser1DataHash"
    );
    await identityRegistry.connect(user2).registerIdentity(
      "did:neocity:user2",
      "QmUser2DataHash"
    );
    await identityRegistry.connect(doctor).registerIdentity(
      "did:neocity:doctor1",
      "QmDoctorDataHash"
    );
    console.log("✅ DIDs registered for users and doctor\n");
  } catch (error) {
    if (error.message.includes("DID already exists")) {
      console.log("⚠️  DIDs already registered (skipping)\n");
    } else {
      throw error;
    }
  }

  // 3. Setup EHRRegistry - Authorize doctor
  console.log("3. Setting up EHR system...");
  try {
    await ehrRegistry.authorizeDoctor(doctor.address);
    console.log("✅ Doctor authorized in EHR system\n");
  } catch (error) {
    if (error.message.includes("Doctor already authorized")) {
      console.log("⚠️  Doctor already authorized (skipping)\n");
    } else {
      throw error;
    }
  }

  // 4. Setup Grievance - Add resolver role
  console.log("4. Setting up grievance system...");
  const resolverRole = await grievance.RESOLVER_ROLE();
  await grievance.grantRole(resolverRole, resolver.address);
  console.log("✅ Resolver role granted\n");

  // 5. Setup SupplyChain - Register participants
  console.log("5. Setting up supply chain...");
  await supplyChain.registerFarmer(user1.address);
  await supplyChain.registerVendor(user2.address);
  console.log("✅ Farmer and vendor registered\n");

  // 6. Setup TrafficLog - Add operator
  console.log("6. Setting up traffic management...");
  await trafficLog.addTrafficOperator(operator.address);
  console.log("✅ Traffic operator added\n");

  // 7. Create sample data
  console.log("7. Creating sample data...");
  
  // Create a voting proposal
  await voting.connect(user1).createProposal(
    "did:neocity:user1",
    "Upgrade City Infrastructure",
    "Proposal to upgrade the city's smart infrastructure with new IoT sensors"
  );
  console.log("   - Voting proposal created");

  // Register a supply chain batch
  await supplyChain.connect(user1).registerBatch(
    "BATCH001",
    "Organic Vegetables",
    "QmBatchData123",
    1000,
    "Local Farm, NeoCity"
  );
  console.log("   - Supply chain batch registered");

  // Log traffic data
  await trafficLog.connect(operator).logTrafficData(
    "Main Street & 5th Ave",
    2, // Medium congestion
    0, // No action
    "Normal traffic flow",
    "QmTrafficData123",
    false // Not emergency
  );
  console.log("   - Traffic data logged");

  console.log("✅ Sample data created\n");

  // Display account balances
  console.log("=".repeat(70));
  console.log("ACCOUNT BALANCES");
  console.log("=".repeat(70));
  const user1Balance = await token.balanceOf(user1.address);
  const user2Balance = await token.balanceOf(user2.address);
  const bankBalance = await token.balanceOf(await bank.getAddress());
  
  console.log("User1:", hre.ethers.formatEther(user1Balance), "NCT");
  console.log("User2:", hre.ethers.formatEther(user2Balance), "NCT");
  console.log("Bank:", hre.ethers.formatEther(bankBalance), "NCT");
  console.log();

  console.log("=".repeat(70));
  console.log("🎉 Local setup complete! Your NeoCity contracts are ready to use.");
  console.log("=".repeat(70), "\n");

  console.log("Next steps:");
  console.log("  1. Interact with contracts using the console: npx hardhat console --network localhost");
  console.log("  2. View deployment addresses in: deployments.json");
  console.log("  3. Check contract documentation in: QUICK_REFERENCE.md\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
