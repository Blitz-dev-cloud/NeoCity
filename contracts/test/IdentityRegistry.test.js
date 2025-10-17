const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("IdentityRegistry", function () {
  async function deployIdentityRegistryFixture() {
    const [owner, addr1, addr2, verifier] = await ethers.getSigners();

    const IdentityRegistry = await ethers.getContractFactory(
      "IdentityRegistry"
    );
    const registry = await IdentityRegistry.deploy();

    return { registry, owner, addr1, addr2, verifier };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { registry, owner } = await loadFixture(
        deployIdentityRegistryFixture
      );
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("Should grant admin role to owner", async function () {
      const { registry, owner } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const adminRole = await registry.DEFAULT_ADMIN_ROLE();
      expect(await registry.hasRole(adminRole, owner.address)).to.equal(true);
    });

    it("Should grant verifier role to owner", async function () {
      const { registry, owner } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const verifierRole = await registry.VERIFIER_ROLE();
      expect(await registry.hasRole(verifierRole, owner.address)).to.equal(
        true
      );
    });
  });

  describe("Identity Registration", function () {
    it("Should allow user to register identity", async function () {
      const { registry, addr1 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";
      const didDocument = "ipfs://Qm...";

      await expect(registry.connect(addr1).registerIdentity(did, didDocument))
        .to.emit(registry, "IdentityRegistered")
        .withArgs(
          did,
          addr1.address,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );

      const identity = await registry.identities(did);
      expect(identity.owner).to.equal(addr1.address);
      expect(identity.isActive).to.equal(true);
    });

    it("Should not allow duplicate DID registration", async function () {
      const { registry, addr1, addr2 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";
      const didDocument = "ipfs://Qm...";

      await registry.connect(addr1).registerIdentity(did, didDocument);

      await expect(
        registry.connect(addr2).registerIdentity(did, didDocument)
      ).to.be.revertedWith("DID already exists");
    });

    it("Should not allow empty DID", async function () {
      const { registry, addr1 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      await expect(
        registry.connect(addr1).registerIdentity("", "ipfs://Qm...")
      ).to.be.revertedWith("Invalid DID");
    });

    it("Should track user DIDs", async function () {
      const { registry, addr1 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did1 = "did:neo:user1";
      const did2 = "did:neo:user1-secondary";

      await registry.connect(addr1).registerIdentity(did1, "ipfs://Qm1");
      await registry.connect(addr1).registerIdentity(did2, "ipfs://Qm2");

      const userDIDs = await registry.userDIDs(addr1.address, 0);
      expect(userDIDs).to.equal(did1);
    });
  });

  describe("Identity Updates", function () {
    it("Should allow owner to update identity", async function () {
      const { registry, addr1 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";

      await registry.connect(addr1).registerIdentity(did, "ipfs://Qm1");

      await expect(registry.connect(addr1).updateIdentity(did, "ipfs://Qm2"))
        .to.emit(registry, "IdentityUpdated")
        .withArgs(
          did,
          addr1.address,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );

      const identity = await registry.identities(did);
      expect(identity.didDocument).to.equal("ipfs://Qm2");
    });

    it("Should not allow non-owner to update identity", async function () {
      const { registry, addr1, addr2 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";

      await registry.connect(addr1).registerIdentity(did, "ipfs://Qm1");

      await expect(
        registry.connect(addr2).updateIdentity(did, "ipfs://Qm2")
      ).to.be.revertedWith("Not identity owner");
    });

    it("Should not allow updating revoked identity", async function () {
      const { registry, addr1 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";

      await registry.connect(addr1).registerIdentity(did, "ipfs://Qm1");
      await registry.connect(addr1).revokeIdentity(did);

      await expect(
        registry.connect(addr1).updateIdentity(did, "ipfs://Qm2")
      ).to.be.revertedWith("Identity is revoked");
    });
  });

  describe("Identity Revocation", function () {
    it("Should allow owner to revoke identity", async function () {
      const { registry, addr1 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";

      await registry.connect(addr1).registerIdentity(did, "ipfs://Qm1");

      await expect(registry.connect(addr1).revokeIdentity(did))
        .to.emit(registry, "IdentityRevoked")
        .withArgs(
          did,
          addr1.address,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );

      const identity = await registry.identities(did);
      expect(identity.isActive).to.equal(false);
    });

    it("Should not allow non-owner to revoke identity", async function () {
      const { registry, addr1, addr2 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";

      await registry.connect(addr1).registerIdentity(did, "ipfs://Qm1");

      await expect(
        registry.connect(addr2).revokeIdentity(did)
      ).to.be.revertedWith("Not identity owner");
    });
  });

  describe("Verifiable Credentials", function () {
    it("Should allow verifier to issue credentials", async function () {
      const { registry, owner, addr1 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";
      const credentialId = "cred:kyc:verified";

      await registry.connect(addr1).registerIdentity(did, "ipfs://Qm1");

      await expect(registry.issueCredential(did, credentialId))
        .to.emit(registry, "CredentialIssued")
        .withArgs(
          did,
          credentialId,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );

      expect(await registry.verifiableCredentials(did, credentialId)).to.equal(
        true
      );
    });

    it("Should not allow non-verifier to issue credentials", async function () {
      const { registry, addr1, addr2 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";

      await registry.connect(addr1).registerIdentity(did, "ipfs://Qm1");

      await expect(
        registry.connect(addr2).issueCredential(did, "cred:kyc:verified")
      ).to.be.revertedWithCustomError(
        registry,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("Should allow verifier to revoke credentials", async function () {
      const { registry, owner, addr1 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";
      const credentialId = "cred:kyc:verified";

      await registry.connect(addr1).registerIdentity(did, "ipfs://Qm1");
      await registry.issueCredential(did, credentialId);

      await expect(registry.revokeCredential(did, credentialId))
        .to.emit(registry, "CredentialRevoked")
        .withArgs(
          did,
          credentialId,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );

      expect(await registry.verifiableCredentials(did, credentialId)).to.equal(
        false
      );
    });

    it("Should not issue credential for inactive identity", async function () {
      const { registry, addr1 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";

      await registry.connect(addr1).registerIdentity(did, "ipfs://Qm1");
      await registry.connect(addr1).revokeIdentity(did);

      await expect(
        registry.issueCredential(did, "cred:kyc:verified")
      ).to.be.revertedWith("Identity is not active");
    });
  });

  describe("Identity Verification", function () {
    it("Should verify active identity", async function () {
      const { registry, addr1 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";

      await registry.connect(addr1).registerIdentity(did, "ipfs://Qm1");
      expect(await registry.verifyIdentity(did)).to.equal(true);
    });

    it("Should not verify inactive identity", async function () {
      const { registry, addr1 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";

      await registry.connect(addr1).registerIdentity(did, "ipfs://Qm1");
      await registry.connect(addr1).revokeIdentity(did);

      expect(await registry.verifyIdentity(did)).to.equal(false);
    });

    it("Should not verify non-existent identity", async function () {
      const { registry } = await loadFixture(deployIdentityRegistryFixture);
      expect(await registry.verifyIdentity("did:neo:nonexistent")).to.equal(
        false
      );
    });

    it("Should return correct identity owner", async function () {
      const { registry, addr1 } = await loadFixture(
        deployIdentityRegistryFixture
      );
      const did = "did:neo:user1";

      await registry.connect(addr1).registerIdentity(did, "ipfs://Qm1");
      expect(await registry.getIdentityOwner(did)).to.equal(addr1.address);
    });
  });
});
