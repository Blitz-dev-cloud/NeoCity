const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-network-helpers");

describe("Voting", function () {
  async function deployVotingFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy IdentityRegistry
    const IdentityRegistry = await ethers.getContractFactory(
      "IdentityRegistry"
    );
    const identityRegistry = await IdentityRegistry.deploy();

    // Deploy Voting
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(await identityRegistry.getAddress());

    // Register identities
    const did1 = "did:neo:voter1";
    const did2 = "did:neo:voter2";
    const did3 = "did:neo:voter3";

    await identityRegistry.connect(user1).registerIdentity(did1, "ipfs://Qm1");
    await identityRegistry.connect(user2).registerIdentity(did2, "ipfs://Qm2");
    await identityRegistry.connect(user3).registerIdentity(did3, "ipfs://Qm3");

    return {
      voting,
      identityRegistry,
      owner,
      user1,
      user2,
      user3,
      did1,
      did2,
      did3,
    };
  }

  describe("Deployment", function () {
    it("Should set the correct identity registry", async function () {
      const { voting, identityRegistry } = await loadFixture(
        deployVotingFixture
      );
      expect(await voting.identityRegistry()).to.equal(
        await identityRegistry.getAddress()
      );
    });

    it("Should grant admin role to deployer", async function () {
      const { voting, owner } = await loadFixture(deployVotingFixture);
      const adminRole = await voting.ADMIN_ROLE();
      expect(await voting.hasRole(adminRole, owner.address)).to.equal(true);
    });

    it("Should have correct voting constants", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      expect(await voting.VOTING_PERIOD()).to.equal(7 * 24 * 60 * 60);
      expect(await voting.REVEAL_PERIOD()).to.equal(2 * 24 * 60 * 60);
    });
  });

  describe("Proposal Creation", function () {
    it("Should allow valid DID owner to create proposal", async function () {
      const { voting, user1, did1 } = await loadFixture(deployVotingFixture);
      const title = "Improve City Infrastructure";
      const description = "Proposal to upgrade roads and bridges";

      await expect(
        voting.connect(user1).createProposal(did1, title, description)
      ).to.emit(voting, "ProposalCreated");

      expect(await voting.proposalCount()).to.equal(1);
    });

    it("Should not allow non-DID owner to create proposal", async function () {
      const { voting, user2, did1 } = await loadFixture(deployVotingFixture);

      await expect(
        voting.connect(user2).createProposal(did1, "Title", "Description")
      ).to.be.revertedWith("Not DID owner");
    });

    it("Should not allow inactive DID to create proposal", async function () {
      const { voting, identityRegistry, user1, did1 } = await loadFixture(
        deployVotingFixture
      );

      await identityRegistry.connect(user1).revokeIdentity(did1);

      await expect(
        voting.connect(user1).createProposal(did1, "Title", "Description")
      ).to.be.revertedWith("Invalid or inactive DID");
    });

    it("Should set proposal details correctly", async function () {
      const { voting, user1, did1 } = await loadFixture(deployVotingFixture);
      const title = "Test Proposal";
      const description = "Test Description";

      await voting.connect(user1).createProposal(did1, title, description);

      const proposal = await voting.getProposal(1);
      expect(proposal.title).to.equal(title);
      expect(proposal.description).to.equal(description);
      expect(proposal.proposer).to.equal(user1.address);
      expect(proposal.status).to.equal(1); // Active
    });

    it("Should return correct proposal ID", async function () {
      const { voting, user1, did1 } = await loadFixture(deployVotingFixture);

      const tx = await voting
        .connect(user1)
        .createProposal(did1, "Title", "Description");
      const receipt = await tx.wait();

      expect(await voting.proposalCount()).to.equal(1);
    });
  });

  describe("Vote Commit", function () {
    it("Should allow valid DID owner to commit vote", async function () {
      const { voting, user1, user2, did1, did2 } = await loadFixture(
        deployVotingFixture
      );

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      const vote = true;
      const nonce = 123;
      const commitHash = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [vote, nonce])
      );

      await expect(voting.connect(user2).commitVote(1, did2, commitHash))
        .to.emit(voting, "VoteCommitted")
        .withArgs(1, did2, (await time.latest()) + 1);
    });

    it("Should not allow committing after voting period", async function () {
      const { voting, user1, user2, did1, did2 } = await loadFixture(
        deployVotingFixture
      );

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      // Advance past voting period
      await time.increase(8 * 24 * 60 * 60);

      const commitHash = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [true, 123])
      );

      await expect(
        voting.connect(user2).commitVote(1, did2, commitHash)
      ).to.be.revertedWith("Voting period ended");
    });

    it("Should not allow double voting", async function () {
      const { voting, user1, user2, did1, did2 } = await loadFixture(
        deployVotingFixture
      );

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      const commitHash = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [true, 123])
      );
      await voting.connect(user2).commitVote(1, did2, commitHash);

      await expect(
        voting.connect(user2).commitVote(1, did2, commitHash)
      ).to.be.revertedWith("Already voted");
    });

    it("Should not allow voting on non-existent proposal", async function () {
      const { voting, user1, did1 } = await loadFixture(deployVotingFixture);

      const commitHash = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [true, 123])
      );

      await expect(
        voting.connect(user1).commitVote(999, did1, commitHash)
      ).to.be.revertedWith("Invalid proposal ID");
    });

    it("Should not allow non-DID owner to vote", async function () {
      const { voting, user1, user2, did1, did2 } = await loadFixture(
        deployVotingFixture
      );

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      const commitHash = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [true, 123])
      );

      await expect(
        voting.connect(user1).commitVote(1, did2, commitHash)
      ).to.be.revertedWith("Not DID owner");
    });
  });

  describe("Vote Reveal", function () {
    it("Should allow revealing vote after voting period", async function () {
      const { voting, user1, user2, did1, did2 } = await loadFixture(
        deployVotingFixture
      );

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      const vote = true;
      const nonce = 123;
      const commitHash = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [vote, nonce])
      );

      await voting.connect(user2).commitVote(1, did2, commitHash);

      // Advance past voting period
      await time.increase(8 * 24 * 60 * 60);

      await expect(voting.connect(user2).revealVote(1, did2, vote, nonce))
        .to.emit(voting, "VoteRevealed")
        .withArgs(1, did2, vote, (await time.latest()) + 1);
    });

    it("Should not allow revealing during voting period", async function () {
      const { voting, user1, user2, did1, did2 } = await loadFixture(
        deployVotingFixture
      );

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      const vote = true;
      const nonce = 123;
      const commitHash = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [vote, nonce])
      );

      await voting.connect(user2).commitVote(1, did2, commitHash);

      await expect(
        voting.connect(user2).revealVote(1, did2, vote, nonce)
      ).to.be.revertedWith("Voting period not ended");
    });

    it("Should not allow revealing after reveal period", async function () {
      const { voting, user1, user2, did1, did2 } = await loadFixture(
        deployVotingFixture
      );

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      const vote = true;
      const nonce = 123;
      const commitHash = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [vote, nonce])
      );

      await voting.connect(user2).commitVote(1, did2, commitHash);

      // Advance past voting period and reveal period
      await time.increase(10 * 24 * 60 * 60);

      await expect(
        voting.connect(user2).revealVote(1, did2, vote, nonce)
      ).to.be.revertedWith("Reveal period ended");
    });

    it("Should not allow revealing without commit", async function () {
      const { voting, user1, user2, did1, did2 } = await loadFixture(
        deployVotingFixture
      );

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      await time.increase(8 * 24 * 60 * 60);

      await expect(
        voting.connect(user2).revealVote(1, did2, true, 123)
      ).to.be.revertedWith("No vote committed");
    });

    it("Should not allow revealing with wrong nonce", async function () {
      const { voting, user1, user2, did1, did2 } = await loadFixture(
        deployVotingFixture
      );

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      const vote = true;
      const nonce = 123;
      const wrongNonce = 456;
      const commitHash = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [vote, nonce])
      );

      await voting.connect(user2).commitVote(1, did2, commitHash);
      await time.increase(8 * 24 * 60 * 60);

      await expect(
        voting.connect(user2).revealVote(1, did2, vote, wrongNonce)
      ).to.be.revertedWith("Invalid reveal");
    });

    it("Should count yes votes correctly", async function () {
      const { voting, user1, user2, did1, did2 } = await loadFixture(
        deployVotingFixture
      );

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      const vote = true;
      const nonce = 123;
      const commitHash = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [vote, nonce])
      );

      await voting.connect(user2).commitVote(1, did2, commitHash);
      await time.increase(8 * 24 * 60 * 60);
      await voting.connect(user2).revealVote(1, did2, vote, nonce);

      const proposal = await voting.getProposal(1);
      expect(proposal.yesVotes).to.equal(1);
      expect(proposal.noVotes).to.equal(0);
    });

    it("Should count no votes correctly", async function () {
      const { voting, user1, user2, did1, did2 } = await loadFixture(
        deployVotingFixture
      );

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      const vote = false;
      const nonce = 123;
      const commitHash = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [vote, nonce])
      );

      await voting.connect(user2).commitVote(1, did2, commitHash);
      await time.increase(8 * 24 * 60 * 60);
      await voting.connect(user2).revealVote(1, did2, vote, nonce);

      const proposal = await voting.getProposal(1);
      expect(proposal.yesVotes).to.equal(0);
      expect(proposal.noVotes).to.equal(1);
    });

    it("Should not allow double reveal", async function () {
      const { voting, user1, user2, did1, did2 } = await loadFixture(
        deployVotingFixture
      );

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      const vote = true;
      const nonce = 123;
      const commitHash = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [vote, nonce])
      );

      await voting.connect(user2).commitVote(1, did2, commitHash);
      await time.increase(8 * 24 * 60 * 60);
      await voting.connect(user2).revealVote(1, did2, vote, nonce);

      await expect(
        voting.connect(user2).revealVote(1, did2, vote, nonce)
      ).to.be.revertedWith("Vote already revealed");
    });
  });

  describe("Proposal Execution", function () {
    it("Should mark proposal as passed when yes votes win", async function () {
      const { voting, user1, user2, user3, did1, did2, did3 } =
        await loadFixture(deployVotingFixture);

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      // User2 votes yes
      const vote2 = true;
      const nonce2 = 123;
      const commitHash2 = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [vote2, nonce2])
      );
      await voting.connect(user2).commitVote(1, did2, commitHash2);

      // User3 votes no
      const vote3 = false;
      const nonce3 = 456;
      const commitHash3 = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [vote3, nonce3])
      );
      await voting.connect(user3).commitVote(1, did3, commitHash3);

      await time.increase(8 * 24 * 60 * 60);
      await voting.connect(user2).revealVote(1, did2, vote2, nonce2);
      await voting.connect(user3).revealVote(1, did3, vote3, nonce3);

      await time.increase(3 * 24 * 60 * 60);

      await expect(voting.connect(user1).executeProposal(1))
        .to.emit(voting, "ProposalExecuted")
        .withArgs(1, false, 1, 1); // It's a tie, so it fails

      const proposal = await voting.getProposal(1);
      expect(proposal.status).to.equal(3); // Failed
    });

    it("Should not execute before reveal period ends", async function () {
      const { voting, user1, did1 } = await loadFixture(deployVotingFixture);

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      await time.increase(8 * 24 * 60 * 60);

      await expect(voting.connect(user1).executeProposal(1)).to.be.revertedWith(
        "Reveal period not ended"
      );
    });

    it("Should not execute non-existent proposal", async function () {
      const { voting, user1 } = await loadFixture(deployVotingFixture);

      await expect(
        voting.connect(user1).executeProposal(999)
      ).to.be.revertedWith("Invalid proposal ID");
    });

    it("Should handle proposal with more yes votes", async function () {
      const { voting, user1, user2, user3, did1, did2, did3 } =
        await loadFixture(deployVotingFixture);

      await voting.connect(user1).createProposal(did1, "Title", "Description");

      // Both vote yes
      const vote2 = true;
      const nonce2 = 123;
      const commitHash2 = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [vote2, nonce2])
      );
      await voting.connect(user2).commitVote(1, did2, commitHash2);

      const vote3 = true;
      const nonce3 = 456;
      const commitHash3 = ethers.keccak256(
        ethers.solidityPacked(["bool", "uint256"], [vote3, nonce3])
      );
      await voting.connect(user3).commitVote(1, did3, commitHash3);

      await time.increase(8 * 24 * 60 * 60);
      await voting.connect(user2).revealVote(1, did2, vote2, nonce2);
      await voting.connect(user3).revealVote(1, did3, vote3, nonce3);

      await time.increase(3 * 24 * 60 * 60);
      await voting.connect(user1).executeProposal(1);

      const proposal = await voting.getProposal(1);
      expect(proposal.status).to.equal(2); // Passed
    });
  });

  describe("View Functions", function () {
    it("Should return proposal details", async function () {
      const { voting, user1, did1 } = await loadFixture(deployVotingFixture);
      const title = "Test Proposal";
      const description = "Test Description";

      await voting.connect(user1).createProposal(did1, title, description);

      const proposal = await voting.getProposal(1);
      expect(proposal.id).to.equal(1);
      expect(proposal.title).to.equal(title);
      expect(proposal.description).to.equal(description);
      expect(proposal.proposer).to.equal(user1.address);
    });

    it("Should track proposal count", async function () {
      const { voting, user1, user2, did1, did2 } = await loadFixture(
        deployVotingFixture
      );

      expect(await voting.proposalCount()).to.equal(0);

      await voting.connect(user1).createProposal(did1, "Proposal 1", "Desc 1");
      expect(await voting.proposalCount()).to.equal(1);

      await voting.connect(user2).createProposal(did2, "Proposal 2", "Desc 2");
      expect(await voting.proposalCount()).to.equal(2);
    });
  });
});
