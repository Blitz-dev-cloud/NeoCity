const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔧 Registering DIDs for test accounts...\n");

  const [deployer, user1, user2] = await ethers.getSigners();

  // Read deployment addresses
  const deploymentsPath = path.join(__dirname, "../deployments.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const identityRegistryAddress = deployments.contracts.IdentityRegistry;

  console.log(`Using IdentityRegistry at: ${identityRegistryAddress}\n`);

  const IdentityRegistry = await ethers.getContractAt(
    "IdentityRegistry",
    identityRegistryAddress
  );

  const accounts = [
    { signer: deployer, name: "Deployer", address: deployer.address },
    { signer: user1, name: "User1", address: user1.address },
    { signer: user2, name: "User2", address: user2.address },
  ];

  for (const account of accounts) {
    const did = `did:neocity:${account.address.toLowerCase()}`;
    const didDocument = JSON.stringify({
      "@context": "https://www.w3.org/ns/did/v1",
      id: did,
      name: account.name,
      dateOfBirth: "1990-01-01",
      idNumber: `ID-${account.name}`,
      created: new Date().toISOString(),
    });

    try {
      // Try to register
      const tx = await IdentityRegistry.connect(
        account.signer
      ).registerIdentity(did, didDocument);
      await tx.wait();
      console.log(`✅ ${account.name} registered with DID: ${did}`);
    } catch (error) {
      if (error.message.includes("DID already exists")) {
        console.log(`⏭️  ${account.name} already has DID: ${did}`);
      } else {
        console.log(`❌ Error registering ${account.name}:`, error.message);
      }
    }
  }

  console.log("\n✅ DID registration complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
