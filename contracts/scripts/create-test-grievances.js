const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("📋 Creating test grievances...\n");

  const [deployer, user1] = await ethers.getSigners();

  // Read deployment addresses
  const deploymentsPath = path.join(__dirname, "../deployments.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));

  const grievanceAddress = deployments.contracts.Grievance;
  console.log(`Using Grievance at: ${grievanceAddress}\n`);

  const Grievance = await ethers.getContractAt("Grievance", grievanceAddress);

  const grievances = [
    {
      signer: deployer,
      did: "did:neocity:0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      title: "Street Light Not Working",
      ipfsHash: "QmTestHash1234567890StreetLight",
    },
    {
      signer: user1,
      did: "did:neocity:0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      title: "Pothole on Main Street",
      ipfsHash: "QmTestHash1234567890Pothole",
    },
    {
      signer: deployer,
      did: "did:neocity:0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      title: "Noise Complaint - Construction Site",
      ipfsHash: "QmTestHash1234567890Noise",
    },
  ];

  for (const grievance of grievances) {
    try {
      console.log(`📝 Filing: ${grievance.title}`);
      const tx = await Grievance.connect(grievance.signer).fileGrievance(
        grievance.did,
        grievance.title,
        grievance.ipfsHash
      );
      await tx.wait();
      console.log(`✅ Filed successfully\n`);
    } catch (error) {
      console.log(`❌ Error:`, error.message, "\n");
    }
  }

  console.log("\n✅ Test grievances created!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
