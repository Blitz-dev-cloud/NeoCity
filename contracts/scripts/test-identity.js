const { ethers } = require("hardhat");

async function main() {
  console.log("Testing IdentityRegistry contract...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH\n"
  );

  // Get contract address
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  console.log("IdentityRegistry address:", contractAddress);

  // Get contract
  const IdentityRegistry = await ethers.getContractAt(
    "IdentityRegistry",
    contractAddress
  );

  // Test data
  const did = `did:neocity:${deployer.address.toLowerCase()}`;
  const didDocument = JSON.stringify({
    "@context": "https://www.w3.org/ns/did/v1",
    id: did,
    name: "Test User",
    dateOfBirth: "1990-01-01",
    idNumber: "12345",
    created: new Date().toISOString(),
  });

  console.log("\nAttempting to register identity...");
  console.log("DID:", did);
  console.log("DID Document:", didDocument);

  try {
    // Try to register
    const tx = await IdentityRegistry.registerIdentity(did, didDocument);
    console.log("\n✅ Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());

    // Check if registered
    const identity = await IdentityRegistry.identities(did);
    console.log("\n✅ Identity registered successfully!");
    console.log("Owner:", identity.owner);
    console.log("Active:", identity.isActive);
    console.log(
      "Created at:",
      new Date(Number(identity.createdAt) * 1000).toISOString()
    );
  } catch (error) {
    console.log("\n❌ Error:", error.message);
    if (error.data) {
      console.log("Error data:", error.data);
    }
    if (error.reason) {
      console.log("Revert reason:", error.reason);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
