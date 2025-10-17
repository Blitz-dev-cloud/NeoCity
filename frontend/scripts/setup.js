const fs = require("fs");
const path = require("path");

console.log("🚀 NeoCity Frontend Setup Script\n");

// Paths
const contractsDir = path.join(__dirname, "../../contracts");
const artifactsDir = path.join(contractsDir, "artifacts/contracts");
const deploymentsFile = path.join(contractsDir, "deployments.json");
const frontendContractsDir = path.join(__dirname, "../src/contracts");

// Contract names
const contracts = [
  "DeFiToken",
  "IdentityRegistry",
  "DeFiBank",
  "Voting",
  "Grievance",
  "EHRRegistry",
  "SupplyChain",
  "TrafficLog",
];

// Step 1: Check if contracts directory exists
if (!fs.existsSync(contractsDir)) {
  console.error("❌ Contracts directory not found!");
  console.log(
    "   Please make sure you're running this from the frontend directory"
  );
  process.exit(1);
}

console.log("✓ Contracts directory found");

// Step 2: Check if artifacts exist
if (!fs.existsSync(artifactsDir)) {
  console.error("❌ Contract artifacts not found!");
  console.log("   Please compile contracts first:");
  console.log("   cd ../contracts && npx hardhat compile");
  process.exit(1);
}

console.log("✓ Contract artifacts found");

// Step 3: Create frontend contracts directory
if (!fs.existsSync(frontendContractsDir)) {
  fs.mkdirSync(frontendContractsDir, { recursive: true });
  console.log("✓ Created frontend contracts directory");
} else {
  console.log("✓ Frontend contracts directory exists");
}

// Step 4: Copy ABIs
console.log("\n📦 Copying contract ABIs...");
let copiedCount = 0;

contracts.forEach((contractName) => {
  const artifactPath = path.join(
    artifactsDir,
    `${contractName}.sol`,
    `${contractName}.json`
  );
  const destinationPath = path.join(
    frontendContractsDir,
    `${contractName}.json`
  );

  if (fs.existsSync(artifactPath)) {
    fs.copyFileSync(artifactPath, destinationPath);
    console.log(`  ✓ ${contractName}.json`);
    copiedCount++;
  } else {
    console.log(`  ⚠ ${contractName}.json not found`);
  }
});

console.log(`\n✓ Copied ${copiedCount}/${contracts.length} ABIs`);

// Step 5: Check deployments
if (!fs.existsSync(deploymentsFile)) {
  console.log("\n⚠ deployments.json not found");
  console.log("  Run deployment script first:");
  console.log(
    "  cd ../contracts && npx hardhat run scripts/deploy.js --network localhost"
  );
} else {
  const deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
  console.log("\n📍 Contract Addresses:");
  console.log(`   Network: ${deployments.network}`);
  console.log(`   Chain ID: ${deployments.chainId}`);
  console.log("   Contracts:");

  Object.entries(deployments.contracts).forEach(([name, address]) => {
    console.log(`     ${name}: ${address}`);
  });

  // Step 6: Generate/Update addresses.ts
  const addressesContent = `export const contractAddresses = {
${Object.entries(deployments.contracts)
  .map(([name, address]) => `  ${name}: "${address}" as \`0x\${string}\`,`)
  .join("\n")}
} as const;

export type ContractName = keyof typeof contractAddresses;
`;

  const addressesPath = path.join(frontendContractsDir, "addresses.ts");
  fs.writeFileSync(addressesPath, addressesContent);
  console.log("\n✓ Updated addresses.ts");
}

// Step 7: Final instructions
console.log("\n✅ Setup complete!\n");
console.log("Next steps:");
console.log("  1. Make sure Hardhat node is running:");
console.log("     cd ../contracts && npx hardhat node");
console.log("\n  2. Deploy contracts (if not already deployed):");
console.log(
  "     cd ../contracts && npx hardhat run scripts/deploy.js --network localhost"
);
console.log("\n  3. Update WalletConnect Project ID in src/config/wagmi.ts");
console.log("\n  4. Start the development server:");
console.log("     npm run dev");
console.log("\n  5. Connect your wallet to Hardhat Local network");
console.log("     Network: Hardhat Local");
console.log("     RPC URL: http://127.0.0.1:8545");
console.log("     Chain ID: 31337");
console.log("     Currency: ETH\n");
