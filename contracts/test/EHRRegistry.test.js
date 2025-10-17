const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-network-helpers");

describe("EHRRegistry", function () {
  async function deployEHRFixture() {
    const [owner, patient, doctor, doctor2, unauthorized] =
      await ethers.getSigners();

    // Deploy IdentityRegistry
    const IdentityRegistry = await ethers.getContractFactory(
      "IdentityRegistry"
    );
    const identityRegistry = await IdentityRegistry.deploy();

    // Deploy EHRRegistry
    const EHRRegistry = await ethers.getContractFactory("EHRRegistry");
    const ehr = await EHRRegistry.deploy(await identityRegistry.getAddress());

    // Register patient identity
    const patientDID = "did:neo:patient1";
    await identityRegistry
      .connect(patient)
      .registerIdentity(patientDID, "ipfs://QmPatient");

    // Authorize doctors
    await ehr.authorizeDoctor(doctor.address);

    return {
      ehr,
      identityRegistry,
      owner,
      patient,
      doctor,
      doctor2,
      unauthorized,
      patientDID,
    };
  }

  describe("Deployment", function () {
    it("Should set the correct identity registry", async function () {
      const { ehr, identityRegistry } = await loadFixture(deployEHRFixture);
      expect(await ehr.identityRegistry()).to.equal(
        await identityRegistry.getAddress()
      );
    });

    it("Should grant admin role to deployer", async function () {
      const { ehr, owner } = await loadFixture(deployEHRFixture);
      const adminRole = await ehr.ADMIN_ROLE();
      expect(await ehr.hasRole(adminRole, owner.address)).to.equal(true);
    });
  });

  describe("Doctor Authorization", function () {
    it("Should allow admin to authorize doctor", async function () {
      const { ehr, doctor2 } = await loadFixture(deployEHRFixture);

      await expect(ehr.authorizeDoctor(doctor2.address))
        .to.emit(ehr, "DoctorAuthorized")
        .withArgs(doctor2.address, (await time.latest()) + 1);

      expect(await ehr.authorizedDoctors(doctor2.address)).to.equal(true);
    });

    it("Should grant doctor role when authorizing", async function () {
      const { ehr, doctor2 } = await loadFixture(deployEHRFixture);
      const doctorRole = await ehr.DOCTOR_ROLE();

      await ehr.authorizeDoctor(doctor2.address);
      expect(await ehr.hasRole(doctorRole, doctor2.address)).to.equal(true);
    });

    it("Should not allow non-admin to authorize doctor", async function () {
      const { ehr, unauthorized, doctor2 } = await loadFixture(
        deployEHRFixture
      );

      await expect(
        ehr.connect(unauthorized).authorizeDoctor(doctor2.address)
      ).to.be.revertedWithCustomError(ehr, "AccessControlUnauthorizedAccount");
    });

    it("Should allow admin to deauthorize doctor", async function () {
      const { ehr, doctor } = await loadFixture(deployEHRFixture);

      await expect(ehr.deauthorizeDoctor(doctor.address))
        .to.emit(ehr, "DoctorDeauthorized")
        .withArgs(doctor.address, (await time.latest()) + 1);

      expect(await ehr.authorizedDoctors(doctor.address)).to.equal(false);
    });

    it("Should revoke doctor role when deauthorizing", async function () {
      const { ehr, doctor } = await loadFixture(deployEHRFixture);
      const doctorRole = await ehr.DOCTOR_ROLE();

      await ehr.deauthorizeDoctor(doctor.address);
      expect(await ehr.hasRole(doctorRole, doctor.address)).to.equal(false);
    });
  });

  describe("Upload Records", function () {
    it("Should allow patient to upload their own record", async function () {
      const { ehr, patient, patientDID } = await loadFixture(deployEHRFixture);
      const ipfsHash = "QmMedicalRecord123";
      const recordType = "Blood Test";

      await expect(
        ehr.connect(patient).uploadRecord(patientDID, ipfsHash, recordType)
      )
        .to.emit(ehr, "RecordUploaded")
        .withArgs(
          patientDID,
          patient.address,
          ipfsHash,
          recordType,
          (await time.latest()) + 1
        );

      const recordCount = await ehr.getRecordCount(patientDID);
      expect(recordCount).to.equal(1);
    });

    it("Should allow authorized doctor to upload record", async function () {
      const { ehr, patient, doctor, patientDID } = await loadFixture(
        deployEHRFixture
      );

      // Grant access to doctor
      await ehr
        .connect(patient)
        .grantAccess(patientDID, doctor.address, 3600, "read,write");

      const ipfsHash = "QmMedicalRecord123";
      const recordType = "X-Ray";

      await expect(
        ehr.connect(doctor).uploadRecord(patientDID, ipfsHash, recordType)
      ).to.emit(ehr, "RecordUploaded");

      const recordCount = await ehr.getRecordCount(patientDID);
      expect(recordCount).to.equal(1);
    });

    it("Should not allow unauthorized user to upload record", async function () {
      const { ehr, unauthorized, patientDID } = await loadFixture(
        deployEHRFixture
      );

      await expect(
        ehr.connect(unauthorized).uploadRecord(patientDID, "QmHash", "Test")
      ).to.be.revertedWith("Unauthorized access");
    });

    it("Should not allow upload with empty IPFS hash", async function () {
      const { ehr, patient, patientDID } = await loadFixture(deployEHRFixture);

      await expect(
        ehr.connect(patient).uploadRecord(patientDID, "", "Test")
      ).to.be.revertedWith("Invalid IPFS hash");
    });

    it("Should not allow upload with empty record type", async function () {
      const { ehr, patient, patientDID } = await loadFixture(deployEHRFixture);

      await expect(
        ehr.connect(patient).uploadRecord(patientDID, "QmHash", "")
      ).to.be.revertedWith("Invalid record type");
    });

    it("Should not allow doctor with expired access to upload", async function () {
      const { ehr, patient, doctor, patientDID } = await loadFixture(
        deployEHRFixture
      );

      // Grant short-term access
      await ehr
        .connect(patient)
        .grantAccess(patientDID, doctor.address, 1, "read,write");

      // Wait for access to expire
      await time.increase(2);

      await expect(
        ehr.connect(doctor).uploadRecord(patientDID, "QmHash", "Test")
      ).to.be.revertedWith("Unauthorized access");
    });
  });

  describe("Access Management", function () {
    it("Should allow patient to grant access to doctor", async function () {
      const { ehr, patient, doctor, patientDID } = await loadFixture(
        deployEHRFixture
      );
      const duration = 3600;
      const permissions = "read,write";

      await expect(
        ehr
          .connect(patient)
          .grantAccess(patientDID, doctor.address, duration, permissions)
      ).to.emit(ehr, "AccessGranted");

      const hasAccessResult = await ehr.hasAccess(patientDID, doctor.address);
      expect(hasAccessResult).to.equal(true);
    });

    it("Should not allow granting access to unauthorized doctor", async function () {
      const { ehr, patient, unauthorized, patientDID } = await loadFixture(
        deployEHRFixture
      );

      await expect(
        ehr
          .connect(patient)
          .grantAccess(patientDID, unauthorized.address, 3600, "read")
      ).to.be.revertedWith("Doctor not authorized");
    });

    it("Should not allow granting access with zero duration", async function () {
      const { ehr, patient, doctor, patientDID } = await loadFixture(
        deployEHRFixture
      );

      await expect(
        ehr.connect(patient).grantAccess(patientDID, doctor.address, 0, "read")
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should not allow non-patient to grant access", async function () {
      const { ehr, unauthorized, doctor, patientDID } = await loadFixture(
        deployEHRFixture
      );

      await expect(
        ehr
          .connect(unauthorized)
          .grantAccess(patientDID, doctor.address, 3600, "read")
      ).to.be.revertedWith("Not patient");
    });

    it("Should allow patient to revoke access", async function () {
      const { ehr, patient, doctor, patientDID } = await loadFixture(
        deployEHRFixture
      );

      await ehr
        .connect(patient)
        .grantAccess(patientDID, doctor.address, 3600, "read");

      await expect(
        ehr.connect(patient).revokeAccess(patientDID, doctor.address)
      )
        .to.emit(ehr, "AccessRevoked")
        .withArgs(patientDID, doctor.address, (await time.latest()) + 1);

      const hasAccessResult = await ehr.hasAccess(patientDID, doctor.address);
      expect(hasAccessResult).to.equal(false);
    });

    it("Should not allow revoking access that was not granted", async function () {
      const { ehr, patient, doctor, patientDID } = await loadFixture(
        deployEHRFixture
      );

      await expect(
        ehr.connect(patient).revokeAccess(patientDID, doctor.address)
      ).to.be.revertedWith("Access not granted");
    });

    it("Should check access expiry correctly", async function () {
      const { ehr, patient, doctor, patientDID } = await loadFixture(
        deployEHRFixture
      );

      await ehr
        .connect(patient)
        .grantAccess(patientDID, doctor.address, 10, "read");

      expect(await ehr.hasAccess(patientDID, doctor.address)).to.equal(true);

      await time.increase(11);

      expect(await ehr.hasAccess(patientDID, doctor.address)).to.equal(false);
    });
  });

  describe("Get Patient Records", function () {
    it("Should allow patient to get their own records", async function () {
      const { ehr, patient, patientDID } = await loadFixture(deployEHRFixture);

      await ehr.connect(patient).uploadRecord(patientDID, "QmHash1", "Type1");
      await ehr.connect(patient).uploadRecord(patientDID, "QmHash2", "Type2");

      const records = await ehr.connect(patient).getPatientRecords(patientDID);
      expect(records.length).to.equal(2);
      expect(records[0].ipfsHash).to.equal("QmHash1");
      expect(records[1].ipfsHash).to.equal("QmHash2");
    });

    it("Should allow authorized doctor to get patient records", async function () {
      const { ehr, patient, doctor, patientDID } = await loadFixture(
        deployEHRFixture
      );

      await ehr.connect(patient).uploadRecord(patientDID, "QmHash1", "Type1");
      await ehr
        .connect(patient)
        .grantAccess(patientDID, doctor.address, 3600, "read");

      const records = await ehr.connect(doctor).getPatientRecords(patientDID);
      expect(records.length).to.equal(1);
    });

    it("Should not allow unauthorized user to get patient records", async function () {
      const { ehr, patient, unauthorized, patientDID } = await loadFixture(
        deployEHRFixture
      );

      await ehr.connect(patient).uploadRecord(patientDID, "QmHash1", "Type1");

      await expect(
        ehr.connect(unauthorized).getPatientRecords(patientDID)
      ).to.be.revertedWith("Unauthorized access");
    });

    it("Should not allow doctor with expired access to get records", async function () {
      const { ehr, patient, doctor, patientDID } = await loadFixture(
        deployEHRFixture
      );

      await ehr.connect(patient).uploadRecord(patientDID, "QmHash1", "Type1");
      await ehr
        .connect(patient)
        .grantAccess(patientDID, doctor.address, 1, "read");

      await time.increase(2);

      await expect(
        ehr.connect(doctor).getPatientRecords(patientDID)
      ).to.be.revertedWith("Unauthorized access");
    });
  });

  describe("View Functions", function () {
    it("Should return correct record count", async function () {
      const { ehr, patient, patientDID } = await loadFixture(deployEHRFixture);

      expect(await ehr.getRecordCount(patientDID)).to.equal(0);

      await ehr.connect(patient).uploadRecord(patientDID, "QmHash1", "Type1");
      expect(await ehr.getRecordCount(patientDID)).to.equal(1);

      await ehr.connect(patient).uploadRecord(patientDID, "QmHash2", "Type2");
      expect(await ehr.getRecordCount(patientDID)).to.equal(2);
    });

    it("Should return correct access status", async function () {
      const { ehr, patient, doctor, patientDID } = await loadFixture(
        deployEHRFixture
      );

      expect(await ehr.hasAccess(patientDID, doctor.address)).to.equal(false);

      await ehr
        .connect(patient)
        .grantAccess(patientDID, doctor.address, 3600, "read");
      expect(await ehr.hasAccess(patientDID, doctor.address)).to.equal(true);

      await ehr.connect(patient).revokeAccess(patientDID, doctor.address);
      expect(await ehr.hasAccess(patientDID, doctor.address)).to.equal(false);
    });
  });

  describe("Multiple Records Management", function () {
    it("Should handle multiple records for same patient", async function () {
      const { ehr, patient, patientDID } = await loadFixture(deployEHRFixture);

      for (let i = 1; i <= 5; i++) {
        await ehr
          .connect(patient)
          .uploadRecord(patientDID, `QmHash${i}`, `Type${i}`);
      }

      const records = await ehr.connect(patient).getPatientRecords(patientDID);
      expect(records.length).to.equal(5);
    });

    it("Should track uploader for each record", async function () {
      const { ehr, patient, doctor, patientDID } = await loadFixture(
        deployEHRFixture
      );

      await ehr.connect(patient).uploadRecord(patientDID, "QmHash1", "Type1");
      await ehr
        .connect(patient)
        .grantAccess(patientDID, doctor.address, 3600, "read,write");
      await ehr.connect(doctor).uploadRecord(patientDID, "QmHash2", "Type2");

      const records = await ehr.connect(patient).getPatientRecords(patientDID);
      expect(records[0].uploader).to.equal(patient.address);
      expect(records[1].uploader).to.equal(doctor.address);
    });
  });
});
