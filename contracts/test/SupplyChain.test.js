const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("SupplyChain", function () {
  async function deploySupplyChainFixture() {
    const [owner, farmer, vendor, auditor, buyer] = await ethers.getSigners();

    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();

    // Register roles
    await supplyChain.registerFarmer(farmer.address);
    await supplyChain.registerVendor(vendor.address);
    await supplyChain.grantRole(
      await supplyChain.AUDITOR_ROLE(),
      auditor.address
    );

    return { supplyChain, owner, farmer, vendor, auditor, buyer };
  }

  describe("Deployment", function () {
    it("Should grant admin role to deployer", async function () {
      const { supplyChain, owner } = await loadFixture(
        deploySupplyChainFixture
      );
      const adminRole = await supplyChain.DEFAULT_ADMIN_ROLE();
      expect(await supplyChain.hasRole(adminRole, owner.address)).to.equal(
        true
      );
    });

    it("Should grant auditor role to deployer", async function () {
      const { supplyChain, owner } = await loadFixture(
        deploySupplyChainFixture
      );
      const auditorRole = await supplyChain.AUDITOR_ROLE();
      expect(await supplyChain.hasRole(auditorRole, owner.address)).to.equal(
        true
      );
    });
  });

  describe("Role Registration", function () {
    it("Should allow admin to register farmer", async function () {
      const { supplyChain, buyer } = await loadFixture(
        deploySupplyChainFixture
      );
      const farmerRole = await supplyChain.FARMER_ROLE();

      await supplyChain.registerFarmer(buyer.address);
      expect(await supplyChain.hasRole(farmerRole, buyer.address)).to.equal(
        true
      );
    });

    it("Should allow admin to register vendor", async function () {
      const { supplyChain, buyer } = await loadFixture(
        deploySupplyChainFixture
      );
      const vendorRole = await supplyChain.VENDOR_ROLE();

      await supplyChain.registerVendor(buyer.address);
      expect(await supplyChain.hasRole(vendorRole, buyer.address)).to.equal(
        true
      );
    });

    it("Should not allow non-admin to register farmer", async function () {
      const { supplyChain, farmer, buyer } = await loadFixture(
        deploySupplyChainFixture
      );

      await expect(
        supplyChain.connect(farmer).registerFarmer(buyer.address)
      ).to.be.revertedWithCustomError(
        supplyChain,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("Should not allow non-admin to register vendor", async function () {
      const { supplyChain, vendor, buyer } = await loadFixture(
        deploySupplyChainFixture
      );

      await expect(
        supplyChain.connect(vendor).registerVendor(buyer.address)
      ).to.be.revertedWithCustomError(
        supplyChain,
        "AccessControlUnauthorizedAccount"
      );
    });
  });

  describe("Batch Registration", function () {
    it("Should allow farmer to register batch", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";
      const productName = "Organic Tomatoes";
      const ipfsHash = "QmBatch123";
      const quantity = 1000;
      const location = "Farm A";

      await expect(
        supplyChain
          .connect(farmer)
          .registerBatch(batchId, productName, ipfsHash, quantity, location)
      )
        .to.emit(supplyChain, "BatchRegistered")
        .withArgs(batchId, farmer.address, productName, quantity);

      const batch = await supplyChain.getBatch(batchId);
      expect(batch.productName).to.equal(productName);
      expect(batch.owner).to.equal(farmer.address);
      expect(batch.quantity).to.equal(quantity);
    });

    it("Should allow vendor to register batch", async function () {
      const { supplyChain, vendor } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH002";

      await expect(
        supplyChain
          .connect(vendor)
          .registerBatch(batchId, "Product", "QmHash", 500, "Location")
      ).to.emit(supplyChain, "BatchRegistered");
    });

    it("Should not allow unauthorized user to register batch", async function () {
      const { supplyChain, buyer } = await loadFixture(
        deploySupplyChainFixture
      );

      await expect(
        supplyChain
          .connect(buyer)
          .registerBatch("BATCH003", "Product", "QmHash", 100, "Location")
      ).to.be.revertedWith("Unauthorized");
    });

    it("Should not allow duplicate batch ID", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await expect(
        supplyChain
          .connect(farmer)
          .registerBatch(batchId, "Product2", "QmHash2", 200, "Location2")
      ).to.be.revertedWith("Batch already exists");
    });

    it("Should not allow empty batch ID", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );

      await expect(
        supplyChain
          .connect(farmer)
          .registerBatch("", "Product", "QmHash", 100, "Location")
      ).to.be.revertedWith("Invalid batch ID");
    });

    it("Should not allow zero quantity", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );

      await expect(
        supplyChain
          .connect(farmer)
          .registerBatch("BATCH001", "Product", "QmHash", 0, "Location")
      ).to.be.revertedWith("Invalid quantity");
    });

    it("Should initialize ownership history", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      const history = await supplyChain.getOwnershipHistory(batchId);
      expect(history.length).to.equal(1);
      expect(history[0]).to.equal(farmer.address);
    });

    it("Should track owner batches", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );

      await supplyChain
        .connect(farmer)
        .registerBatch("BATCH001", "Product1", "QmHash1", 100, "Location");
      await supplyChain
        .connect(farmer)
        .registerBatch("BATCH002", "Product2", "QmHash2", 200, "Location");

      const ownerBatches = await supplyChain.getOwnerBatches(farmer.address);
      expect(ownerBatches.length).to.equal(2);
    });
  });

  describe("Ownership Transfer", function () {
    it("Should allow owner to transfer batch ownership", async function () {
      const { supplyChain, farmer, vendor } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await expect(
        supplyChain.connect(farmer).transferOwnership(batchId, vendor.address)
      )
        .to.emit(supplyChain, "OwnershipTransferred")
        .withArgs(
          batchId,
          farmer.address,
          vendor.address,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );

      const batch = await supplyChain.getBatch(batchId);
      expect(batch.owner).to.equal(vendor.address);
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      const { supplyChain, farmer, vendor, buyer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await expect(
        supplyChain.connect(buyer).transferOwnership(batchId, vendor.address)
      ).to.be.revertedWith("Not batch owner");
    });

    it("Should not allow transfer to zero address", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await expect(
        supplyChain
          .connect(farmer)
          .transferOwnership(batchId, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid new owner");
    });

    it("Should not allow transfer to current owner", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await expect(
        supplyChain.connect(farmer).transferOwnership(batchId, farmer.address)
      ).to.be.revertedWith("Already owner");
    });

    it("Should update ownership history", async function () {
      const { supplyChain, farmer, vendor, buyer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");
      await supplyChain.registerVendor(buyer.address);

      await supplyChain
        .connect(farmer)
        .transferOwnership(batchId, vendor.address);
      await supplyChain
        .connect(vendor)
        .transferOwnership(batchId, buyer.address);

      const history = await supplyChain.getOwnershipHistory(batchId);
      expect(history.length).to.equal(3);
      expect(history[0]).to.equal(farmer.address);
      expect(history[1]).to.equal(vendor.address);
      expect(history[2]).to.equal(buyer.address);
    });
  });

  describe("Batch Status Update", function () {
    it("Should allow owner to update batch status", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await expect(supplyChain.connect(farmer).updateBatchStatus(batchId, 1)) // InTransit
        .to.emit(supplyChain, "BatchStatusUpdated")
        .withArgs(
          batchId,
          1,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );

      const batch = await supplyChain.getBatch(batchId);
      expect(batch.status).to.equal(1);
    });

    it("Should not allow non-owner to update status", async function () {
      const { supplyChain, farmer, buyer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await expect(
        supplyChain.connect(buyer).updateBatchStatus(batchId, 1)
      ).to.be.revertedWith("Not batch owner");
    });

    it("Should not allow updating to same status", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await expect(
        supplyChain.connect(farmer).updateBatchStatus(batchId, 0) // Created (same as current)
      ).to.be.revertedWith("Status unchanged");
    });

    it("Should handle all status types", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await supplyChain.connect(farmer).updateBatchStatus(batchId, 1); // InTransit
      await supplyChain.connect(farmer).updateBatchStatus(batchId, 2); // Delivered
      await supplyChain.connect(farmer).updateBatchStatus(batchId, 3); // Sold

      const batch = await supplyChain.getBatch(batchId);
      expect(batch.status).to.equal(3);
    });
  });

  describe("Location Update", function () {
    it("Should allow owner to update location", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";
      const newLocation = "Warehouse B";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Farm A");
      await supplyChain
        .connect(farmer)
        .updateBatchLocation(batchId, newLocation);

      const batch = await supplyChain.getBatch(batchId);
      expect(batch.location).to.equal(newLocation);
    });

    it("Should not allow non-owner to update location", async function () {
      const { supplyChain, farmer, buyer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await expect(
        supplyChain.connect(buyer).updateBatchLocation(batchId, "New Location")
      ).to.be.revertedWith("Not batch owner");
    });

    it("Should not allow empty location", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await expect(
        supplyChain.connect(farmer).updateBatchLocation(batchId, "")
      ).to.be.revertedWith("Invalid location");
    });
  });

  describe("Audit", function () {
    it("Should allow auditor to conduct audit", async function () {
      const { supplyChain, farmer, auditor } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";
      const findings = "All quality checks passed";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await expect(
        supplyChain.connect(auditor).conductAudit(batchId, findings, true)
      )
        .to.emit(supplyChain, "AuditCompleted")
        .withArgs(
          batchId,
          auditor.address,
          true,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1)
        );

      const auditHistory = await supplyChain.getAuditHistory(batchId);
      expect(auditHistory.length).to.equal(1);
      expect(auditHistory[0].passed).to.equal(true);
      expect(auditHistory[0].findings).to.equal(findings);
    });

    it("Should not allow non-auditor to conduct audit", async function () {
      const { supplyChain, farmer, buyer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await expect(
        supplyChain.connect(buyer).conductAudit(batchId, "Findings", true)
      ).to.be.revertedWithCustomError(
        supplyChain,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("Should track multiple audits", async function () {
      const { supplyChain, farmer, auditor, owner } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");

      await supplyChain
        .connect(auditor)
        .conductAudit(batchId, "First audit", true);
      await supplyChain
        .connect(owner)
        .conductAudit(batchId, "Second audit", false);

      const auditHistory = await supplyChain.getAuditHistory(batchId);
      expect(auditHistory.length).to.equal(2);
      expect(auditHistory[0].passed).to.equal(true);
      expect(auditHistory[1].passed).to.equal(false);
    });
  });

  describe("View Functions", function () {
    it("Should return complete batch information", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";
      const productName = "Test Product";
      const ipfsHash = "QmTest";
      const quantity = 500;
      const location = "Test Location";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, productName, ipfsHash, quantity, location);

      const batch = await supplyChain.getBatch(batchId);
      expect(batch.productName).to.equal(productName);
      expect(batch.owner).to.equal(farmer.address);
      expect(batch.ipfsHash).to.equal(ipfsHash);
      expect(batch.status).to.equal(0); // Created
      expect(batch.quantity).to.equal(quantity);
      expect(batch.location).to.equal(location);
    });

    it("Should return ownership history", async function () {
      const { supplyChain, farmer, vendor } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");
      await supplyChain
        .connect(farmer)
        .transferOwnership(batchId, vendor.address);

      const history = await supplyChain.getOwnershipHistory(batchId);
      expect(history.length).to.equal(2);
    });

    it("Should return audit history", async function () {
      const { supplyChain, farmer, auditor } = await loadFixture(
        deploySupplyChainFixture
      );
      const batchId = "BATCH001";

      await supplyChain
        .connect(farmer)
        .registerBatch(batchId, "Product", "QmHash", 100, "Location");
      await supplyChain.connect(auditor).conductAudit(batchId, "Audit 1", true);

      const auditHistory = await supplyChain.getAuditHistory(batchId);
      expect(auditHistory.length).to.equal(1);
    });

    it("Should return owner batches", async function () {
      const { supplyChain, farmer } = await loadFixture(
        deploySupplyChainFixture
      );

      await supplyChain
        .connect(farmer)
        .registerBatch("BATCH001", "Product1", "QmHash1", 100, "Location");
      await supplyChain
        .connect(farmer)
        .registerBatch("BATCH002", "Product2", "QmHash2", 200, "Location");

      const ownerBatches = await supplyChain.getOwnerBatches(farmer.address);
      expect(ownerBatches.length).to.equal(2);
      expect(ownerBatches[0]).to.equal("BATCH001");
      expect(ownerBatches[1]).to.equal("BATCH002");
    });

    it("Should not return non-existent batch", async function () {
      const { supplyChain } = await loadFixture(deploySupplyChainFixture);

      await expect(supplyChain.getBatch("NONEXISTENT")).to.be.revertedWith(
        "Batch does not exist"
      );
    });
  });
});
