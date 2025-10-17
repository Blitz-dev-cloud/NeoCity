const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Grievance", function () {
  async function deployGrievanceFixture() {
    const [owner, user1, user2, resolver, admin] = await ethers.getSigners();

    // Deploy IdentityRegistry
    const IdentityRegistry = await ethers.getContractFactory(
      "IdentityRegistry"
    );
    const identityRegistry = await IdentityRegistry.deploy();

    // Deploy Grievance
    const Grievance = await ethers.getContractFactory("Grievance");
    const grievance = await Grievance.deploy(
      await identityRegistry.getAddress()
    );

    // Register identities
    const did1 = "did:neo:user1";
    const did2 = "did:neo:user2";
    await identityRegistry.connect(user1).registerIdentity(did1, "ipfs://Qm1");
    await identityRegistry.connect(user2).registerIdentity(did2, "ipfs://Qm2");

    // Grant resolver role
    const resolverRole = await grievance.RESOLVER_ROLE();
    await grievance.grantRole(resolverRole, resolver.address);

    return {
      grievance,
      identityRegistry,
      owner,
      user1,
      user2,
      resolver,
      admin,
      did1,
      did2,
    };
  }

  describe("Deployment", function () {
    it("Should set the correct identity registry", async function () {
      const { grievance, identityRegistry } = await loadFixture(
        deployGrievanceFixture
      );
      expect(await grievance.identityRegistry()).to.equal(
        await identityRegistry.getAddress()
      );
    });

    it("Should grant admin and resolver roles to deployer", async function () {
      const { grievance, owner } = await loadFixture(deployGrievanceFixture);
      const adminRole = await grievance.ADMIN_ROLE();
      const resolverRole = await grievance.RESOLVER_ROLE();

      expect(await grievance.hasRole(adminRole, owner.address)).to.equal(true);
      expect(await grievance.hasRole(resolverRole, owner.address)).to.equal(
        true
      );
    });
  });

  describe("File Grievance", function () {
    it("Should allow valid DID owner to file grievance", async function () {
      const { grievance, user1, did1 } = await loadFixture(
        deployGrievanceFixture
      );
      const title = "Pothole on Main Street";
      const ipfsHash = "QmTest123";

      await expect(
        grievance.connect(user1).fileGrievance(did1, title, ipfsHash)
      ).to.emit(grievance, "GrievanceFiled");

      expect(await grievance.grievanceCount()).to.equal(1);
    });

    it("Should not allow filing with empty title", async function () {
      const { grievance, user1, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await expect(
        grievance.connect(user1).fileGrievance(did1, "", "QmTest123")
      ).to.be.revertedWith("Empty title");
    });

    it("Should not allow filing with empty IPFS hash", async function () {
      const { grievance, user1, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await expect(
        grievance.connect(user1).fileGrievance(did1, "Title", "")
      ).to.be.revertedWith("Empty IPFS hash");
    });

    it("Should not allow non-DID owner to file grievance", async function () {
      const { grievance, user2, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await expect(
        grievance.connect(user2).fileGrievance(did1, "Title", "QmTest123")
      ).to.be.revertedWith("Not DID owner");
    });

    it("Should not allow filing with invalid DID", async function () {
      const { grievance, user1 } = await loadFixture(deployGrievanceFixture);

      await expect(
        grievance
          .connect(user1)
          .fileGrievance("did:neo:invalid", "Title", "QmTest123")
      ).to.be.revertedWith("Invalid DID");
    });

    it("Should track user grievances", async function () {
      const { grievance, user1, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance
        .connect(user1)
        .fileGrievance(did1, "Grievance 1", "QmTest1");
      await grievance
        .connect(user1)
        .fileGrievance(did1, "Grievance 2", "QmTest2");

      const userGrievances = await grievance
        .connect(user1)
        .getUserGrievances(did1);
      expect(userGrievances.length).to.equal(2);
      expect(userGrievances[0]).to.equal(1);
      expect(userGrievances[1]).to.equal(2);
    });

    it("Should set correct initial status", async function () {
      const { grievance, user1, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");

      const record = await grievance.grievances(1);
      expect(record.status).to.equal(0); // Filed
    });

    it("Should return grievance ID", async function () {
      const { grievance, user1, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      const tx = await grievance
        .connect(user1)
        .fileGrievance(did1, "Title", "QmTest123");
      const receipt = await tx.wait();

      expect(await grievance.grievanceCount()).to.equal(1);
    });
  });

  describe("Assign Grievance", function () {
    it("Should allow admin to assign grievance to resolver", async function () {
      const { grievance, user1, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");

      await expect(grievance.assignGrievance(1, resolver.address))
        .to.emit(grievance, "GrievanceAssigned")
        .withArgs(
          1,
          resolver.address,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );

      const record = await grievance.grievances(1);
      expect(record.resolver).to.equal(resolver.address);
      expect(record.status).to.equal(1); // UnderReview
    });

    it("Should not allow non-admin to assign grievance", async function () {
      const { grievance, user1, user2, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");

      await expect(
        grievance.connect(user2).assignGrievance(1, resolver.address)
      ).to.be.revertedWithCustomError(
        grievance,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("Should not allow assigning to non-resolver", async function () {
      const { grievance, user1, user2, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");

      await expect(
        grievance.assignGrievance(1, user2.address)
      ).to.be.revertedWith("Invalid resolver");
    });

    it("Should not allow reassigning grievance", async function () {
      const { grievance, user1, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");
      await grievance.assignGrievance(1, resolver.address);

      await expect(
        grievance.assignGrievance(1, resolver.address)
      ).to.be.revertedWith("Already assigned");
    });

    it("Should not assign non-existent grievance", async function () {
      const { grievance, resolver } = await loadFixture(deployGrievanceFixture);

      await expect(
        grievance.assignGrievance(999, resolver.address)
      ).to.be.revertedWith("Grievance does not exist");
    });

    it("Should not assign grievance with wrong status", async function () {
      const { grievance, user1, resolver, did1, owner } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");
      await grievance.assignGrievance(1, resolver.address);

      const resolverRole = await grievance.RESOLVER_ROLE();
      await grievance.grantRole(resolverRole, owner.address);

      await expect(
        grievance.assignGrievance(1, owner.address)
      ).to.be.revertedWith("Already assigned");
    });
  });

  describe("Update Grievance Status", function () {
    it("Should allow resolver to update status", async function () {
      const { grievance, user1, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");
      await grievance.assignGrievance(1, resolver.address);

      await expect(grievance.connect(resolver).updateGrievanceStatus(1, 2)) // Resolved
        .to.emit(grievance, "GrievanceStatusUpdated")
        .withArgs(
          1,
          2,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );
    });

    it("Should allow admin to update status", async function () {
      const { grievance, owner, user1, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");
      await grievance.assignGrievance(1, resolver.address);

      await expect(
        grievance.connect(owner).updateGrievanceStatus(1, 2)
      ).to.emit(grievance, "GrievanceStatusUpdated");
    });

    it("Should not allow unauthorized user to update status", async function () {
      const { grievance, user1, user2, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");
      await grievance.assignGrievance(1, resolver.address);

      await expect(
        grievance.connect(user2).updateGrievanceStatus(1, 2)
      ).to.be.revertedWith("Unauthorized");
    });

    it("Should not allow updating to same status", async function () {
      const { grievance, user1, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");
      await grievance.assignGrievance(1, resolver.address);

      await expect(
        grievance.connect(resolver).updateGrievanceStatus(1, 1) // Same status
      ).to.be.revertedWith("Status unchanged");
    });

    it("Should not allow invalid status transitions", async function () {
      const { grievance, user1, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");

      await expect(
        grievance.connect(resolver).updateGrievanceStatus(1, 2) // Filed to Resolved
      ).to.be.revertedWith("Invalid status transition");
    });
  });

  describe("Resolve Grievance", function () {
    it("Should allow resolver to resolve grievance", async function () {
      const { grievance, user1, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );
      const resolutionHash = "QmResolution123";

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");
      await grievance.assignGrievance(1, resolver.address);

      await expect(
        grievance.connect(resolver).resolveGrievance(1, resolutionHash)
      )
        .to.emit(grievance, "GrievanceResolved")
        .withArgs(
          1,
          resolutionHash,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );

      const record = await grievance.grievances(1);
      expect(record.status).to.equal(2); // Resolved
      expect(record.resolutionIpfsHash).to.equal(resolutionHash);
    });

    it("Should allow admin to resolve grievance", async function () {
      const { grievance, owner, user1, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");
      await grievance.assignGrievance(1, resolver.address);

      await expect(
        grievance.connect(owner).resolveGrievance(1, "QmResolution123")
      ).to.emit(grievance, "GrievanceResolved");
    });

    it("Should not allow unauthorized user to resolve", async function () {
      const { grievance, user1, user2, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");
      await grievance.assignGrievance(1, resolver.address);

      await expect(
        grievance.connect(user2).resolveGrievance(1, "QmResolution123")
      ).to.be.revertedWith("Unauthorized");
    });

    it("Should not allow empty resolution hash", async function () {
      const { grievance, user1, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");
      await grievance.assignGrievance(1, resolver.address);

      await expect(
        grievance.connect(resolver).resolveGrievance(1, "")
      ).to.be.revertedWith("Empty resolution IPFS hash");
    });

    it("Should not resolve grievance with wrong status", async function () {
      const { grievance, user1, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");

      await expect(
        grievance.connect(resolver).resolveGrievance(1, "QmResolution123")
      ).to.be.revertedWith("Invalid status");
    });
  });

  describe("Get Grievance", function () {
    it("Should allow complainant to get their grievance", async function () {
      const { grievance, user1, did1 } = await loadFixture(
        deployGrievanceFixture
      );
      const title = "Test Grievance";

      await grievance.connect(user1).fileGrievance(did1, title, "QmTest123");

      const result = await grievance.connect(user1).getGrievance(1);
      expect(result.complainantDID).to.equal(did1);
      expect(result.title).to.equal(title);
      expect(result.status).to.equal(0); // Filed
    });

    it("Should allow resolver to get grievance", async function () {
      const { grievance, user1, resolver, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");
      await grievance.assignGrievance(1, resolver.address);

      const result = await grievance.connect(resolver).getGrievance(1);
      expect(result.complainantDID).to.equal(did1);
    });

    it("Should allow admin to get grievance", async function () {
      const { grievance, owner, user1, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");

      const result = await grievance.connect(owner).getGrievance(1);
      expect(result.complainantDID).to.equal(did1);
    });

    it("Should not allow unauthorized user to get grievance", async function () {
      const { grievance, user1, user2, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");

      await expect(grievance.connect(user2).getGrievance(1)).to.be.revertedWith(
        "Unauthorized"
      );
    });
  });

  describe("Get User Grievances", function () {
    it("Should return all user grievances", async function () {
      const { grievance, user1, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance
        .connect(user1)
        .fileGrievance(did1, "Grievance 1", "QmTest1");
      await grievance
        .connect(user1)
        .fileGrievance(did1, "Grievance 2", "QmTest2");
      await grievance
        .connect(user1)
        .fileGrievance(did1, "Grievance 3", "QmTest3");

      const userGrievances = await grievance
        .connect(user1)
        .getUserGrievances(did1);
      expect(userGrievances.length).to.equal(3);
    });

    it("Should not allow non-owner to get user grievances", async function () {
      const { grievance, user1, user2, did1 } = await loadFixture(
        deployGrievanceFixture
      );

      await grievance.connect(user1).fileGrievance(did1, "Title", "QmTest123");

      await expect(
        grievance.connect(user2).getUserGrievances(did1)
      ).to.be.revertedWith("Not DID owner");
    });
  });
});
