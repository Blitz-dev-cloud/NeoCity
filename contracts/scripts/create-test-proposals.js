const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🗳️  Creating test proposals...\n");

  const [deployer] = await ethers.getSigners();

  // Read deployment addresses
  const deploymentsPath = path.join(__dirname, "../deployments.json");
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));

  const votingAddress = deployments.contracts.Voting;
  console.log(`Using Voting at: ${votingAddress}\n`);

  const Voting = await ethers.getContractAt("Voting", votingAddress);

  const proposals = [
    {
      did: "did:neocity:0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      title: "Increase Public Transport Budget",
      description:
        "Proposal to allocate additional 5M NEO tokens for public transport infrastructure improvements including new bus routes and metro expansion.",
    },
    {
      did: "did:neocity:0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      title: "Green Energy Initiative",
      description:
        "Install solar panels on all government buildings and provide subsidies for residential solar installations. Estimated cost: 3M NEO.",
    },
    {
      did: "did:neocity:0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      title: "Community Park Development",
      description:
        "Create 3 new community parks in underserved neighborhoods with playgrounds, sports facilities, and green spaces.",
    },
  ];

  for (const proposal of proposals) {
    try {
      console.log(`📝 Creating: ${proposal.title}`);
      const tx = await Voting.createProposal(
        proposal.did,
        proposal.title,
        proposal.description
      );
      await tx.wait();
      console.log(`✅ Created successfully\n`);
    } catch (error) {
      console.log(`❌ Error:`, error.message, "\n");
    }
  }

  // Get total count
  const count = await Voting.proposalCount();
  console.log(`\n✅ Total proposals: ${count.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
