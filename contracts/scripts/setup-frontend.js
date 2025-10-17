// Script to set up Next.js 15 frontend with Wagmi + Viem
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Setting up Next.js 15 + Wagmi + Viem for NeoCity...\n");

  const frontendDir = path.join(__dirname, "../../frontend");
  
  // Check if frontend exists
  if (!fs.existsSync(frontendDir)) {
    console.error("❌ Frontend directory not found!");
    console.log("Please create Next.js app first:");
    console.log("  cd ..");
    console.log("  npx create-next-app@latest frontend");
    return;
  }

  console.log("✅ Frontend directory found");
  console.log("📁 Location:", frontendDir, "\n");

  // Create directory structure
  const dirs = [
    "src/contracts",
    "src/lib",
    "src/hooks",
    "src/components/layout",
    "src/components/ui",
    "src/components/banking",
    "src/components/identity",
    "src/components/voting",
    "src/app/banking",
    "src/app/identity",
    "src/app/voting",
    "src/app/grievances",
    "src/app/healthcare",
    "src/app/supply-chain",
    "src/app/traffic"
  ];

  console.log("Creating directory structure...");
  for (const dir of dirs) {
    const fullPath = path.join(frontendDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✅ Created ${dir}`);
    } else {
      console.log(`  ⏭️  ${dir} already exists`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("COPYING CONTRACT ABIs");
  console.log("=".repeat(70) + "\n");

  // Copy contract ABIs
  const artifactsDir = path.join(__dirname, "../artifacts/contracts");
  const contractsDir = path.join(frontendDir, "src/contracts");

  const contracts = [
    "DeFiToken",
    "IdentityRegistry",
    "DeFiBank",
    "Voting",
    "Grievance",
    "EHRRegistry",
    "SupplyChain",
    "TrafficLog"
  ];

  for (const contract of contracts) {
    const artifactPath = path.join(artifactsDir, `${contract}.sol`, `${contract}.json`);
    
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      
      // Create TypeScript file with ABI
      const tsContent = `export const ${contract}ABI = ${JSON.stringify(artifact.abi, null, 2)} as const;\n`;
      const targetPath = path.join(contractsDir, `${contract}.ts`);
      fs.writeFileSync(targetPath, tsContent);
      
      console.log(`✅ Copied ${contract}.ts`);
    } else {
      console.log(`⚠️  ${contract} artifact not found`);
    }
  }

  // Copy deployment addresses
  const deploymentsPath = path.join(__dirname, "../deployments.json");
  if (fs.existsSync(deploymentsPath)) {
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
    
    const addressesContent = `export const contractAddresses = ${JSON.stringify(deployments.contracts, null, 2)} as const;

export const deploymentInfo = ${JSON.stringify({
      network: deployments.network,
      chainId: deployments.chainId,
      deployer: deployments.deployer,
      timestamp: deployments.timestamp
    }, null, 2)} as const;

export type ContractName = keyof typeof contractAddresses;
`;
    
    const targetPath = path.join(contractsDir, "addresses.ts");
    fs.writeFileSync(targetPath, addressesContent);
    console.log(`✅ Created addresses.ts\n`);
  }

  console.log("=".repeat(70));
  console.log("✨ Setup Complete!");
  console.log("=".repeat(70) + "\n");

  console.log("Next steps:");
  console.log("  1. cd ../frontend");
  console.log("  2. Review the generated files in src/");
  console.log("  3. Run: npm run dev");
  console.log("  4. Open: http://localhost:3000\n");

  console.log("Files created:");
  console.log("  📄 src/contracts/*.ts - Contract ABIs");
  console.log("  📄 src/contracts/addresses.ts - Deployed addresses");
  console.log("  📁 src/components/ - Component folders");
  console.log("  📁 src/app/ - Page routes\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
