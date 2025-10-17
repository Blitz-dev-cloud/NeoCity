const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-network-helpers");

describe("TrafficLog", function () {
  async function deployTrafficLogFixture() {
    const [owner, operator1, operator2, unauthorized] =
      await ethers.getSigners();

    const TrafficLog = await ethers.getContractFactory("TrafficLog");
    const trafficLog = await TrafficLog.deploy();

    // Add traffic operator
    await trafficLog.addTrafficOperator(operator1.address);

    return { trafficLog, owner, operator1, operator2, unauthorized };
  }

  describe("Deployment", function () {
    it("Should grant admin role to deployer", async function () {
      const { trafficLog, owner } = await loadFixture(deployTrafficLogFixture);
      const adminRole = await trafficLog.TRAFFIC_ADMIN_ROLE();
      expect(await trafficLog.hasRole(adminRole, owner.address)).to.equal(true);
    });

    it("Should grant operator role to deployer", async function () {
      const { trafficLog, owner } = await loadFixture(deployTrafficLogFixture);
      const operatorRole = await trafficLog.TRAFFIC_OPERATOR_ROLE();
      expect(await trafficLog.hasRole(operatorRole, owner.address)).to.equal(
        true
      );
    });
  });

  describe("Operator Management", function () {
    it("Should allow admin to add traffic operator", async function () {
      const { trafficLog, operator2 } = await loadFixture(
        deployTrafficLogFixture
      );
      const operatorRole = await trafficLog.TRAFFIC_OPERATOR_ROLE();

      await trafficLog.addTrafficOperator(operator2.address);
      expect(
        await trafficLog.hasRole(operatorRole, operator2.address)
      ).to.equal(true);
    });

    it("Should not allow non-admin to add operator", async function () {
      const { trafficLog, operator1, operator2 } = await loadFixture(
        deployTrafficLogFixture
      );

      await expect(
        trafficLog.connect(operator1).addTrafficOperator(operator2.address)
      ).to.be.revertedWithCustomError(
        trafficLog,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("Should allow admin to remove traffic operator", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );
      const operatorRole = await trafficLog.TRAFFIC_OPERATOR_ROLE();

      await trafficLog.removeTrafficOperator(operator1.address);
      expect(
        await trafficLog.hasRole(operatorRole, operator1.address)
      ).to.equal(false);
    });

    it("Should not allow non-admin to remove operator", async function () {
      const { trafficLog, operator1, operator2 } = await loadFixture(
        deployTrafficLogFixture
      );

      await trafficLog.addTrafficOperator(operator2.address);

      await expect(
        trafficLog.connect(operator1).removeTrafficOperator(operator2.address)
      ).to.be.revertedWithCustomError(
        trafficLog,
        "AccessControlUnauthorizedAccount"
      );
    });
  });

  describe("Log Traffic Data", function () {
    it("Should allow operator to log traffic data", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );
      const location = "Main Street & 5th Ave";
      const congestionLevel = 2; // High
      const actionTaken = 1; // SignalAdjustment
      const description = "Heavy traffic detected";
      const predictionData = "QmPrediction123";
      const isEmergency = false;

      await expect(
        trafficLog
          .connect(operator1)
          .logTrafficData(
            location,
            congestionLevel,
            actionTaken,
            description,
            predictionData,
            isEmergency
          )
      )
        .to.emit(trafficLog, "TrafficLogged")
        .withArgs(
          1,
          location,
          congestionLevel,
          actionTaken,
          operator1.address,
          (await time.latest()) + 1
        );

      expect(await trafficLog.logCount()).to.equal(1);
    });

    it("Should allow admin to log traffic data", async function () {
      const { trafficLog, owner } = await loadFixture(deployTrafficLogFixture);

      await expect(
        trafficLog
          .connect(owner)
          .logTrafficData("Location", 1, 0, "Desc", "QmData", false)
      ).to.emit(trafficLog, "TrafficLogged");
    });

    it("Should not allow unauthorized user to log data", async function () {
      const { trafficLog, unauthorized } = await loadFixture(
        deployTrafficLogFixture
      );

      await expect(
        trafficLog
          .connect(unauthorized)
          .logTrafficData("Location", 1, 0, "Desc", "QmData", false)
      ).to.be.revertedWith("Unauthorized: Not traffic personnel");
    });

    it("Should not allow empty location", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );

      await expect(
        trafficLog
          .connect(operator1)
          .logTrafficData("", 1, 0, "Desc", "QmData", false)
      ).to.be.revertedWith("Invalid location");
    });

    it("Should emit emergency event for emergency logs", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );
      const location = "Highway 101";

      await expect(
        trafficLog
          .connect(operator1)
          .logTrafficData(location, 3, 3, "Emergency", "QmData", true)
      )
        .to.emit(trafficLog, "EmergencyLogged")
        .withArgs(1, location, operator1.address, (await time.latest()) + 1);
    });

    it("Should track logs by location", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );
      const location = "Main Street";

      await trafficLog
        .connect(operator1)
        .logTrafficData(location, 1, 0, "Desc1", "QmData1", false);
      await trafficLog
        .connect(operator1)
        .logTrafficData(location, 2, 1, "Desc2", "QmData2", false);

      const locationLogs = await trafficLog.getLocationLogs(location);
      expect(locationLogs.length).to.equal(2);
      expect(locationLogs[0]).to.equal(1);
      expect(locationLogs[1]).to.equal(2);
    });

    it("Should track logs by operator", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );

      await trafficLog
        .connect(operator1)
        .logTrafficData("Location1", 1, 0, "Desc1", "QmData1", false);
      await trafficLog
        .connect(operator1)
        .logTrafficData("Location2", 2, 1, "Desc2", "QmData2", false);

      const operatorLogs = await trafficLog.getOperatorLogs(operator1.address);
      expect(operatorLogs.length).to.equal(2);
    });

    it("Should store all traffic data correctly", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );
      const location = "Test Location";
      const congestionLevel = 2;
      const actionTaken = 1;
      const description = "Test Description";
      const predictionData = "QmTest";
      const isEmergency = true;

      await trafficLog
        .connect(operator1)
        .logTrafficData(
          location,
          congestionLevel,
          actionTaken,
          description,
          predictionData,
          isEmergency
        );

      const entry = await trafficLog.getTrafficEntry(1);
      expect(entry.location).to.equal(location);
      expect(entry.congestionLevel).to.equal(congestionLevel);
      expect(entry.actionTaken).to.equal(actionTaken);
      expect(entry.operator).to.equal(operator1.address);
      expect(entry.description).to.equal(description);
      expect(entry.predictionData).to.equal(predictionData);
      expect(entry.isEmergency).to.equal(isEmergency);
    });

    it("Should return correct log ID", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );

      const tx = await trafficLog
        .connect(operator1)
        .logTrafficData("Location", 1, 0, "Desc", "QmData", false);
      const receipt = await tx.wait();

      expect(await trafficLog.logCount()).to.equal(1);
    });
  });

  describe("Congestion Levels", function () {
    it("Should handle all congestion levels", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );

      // Low
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc1", 0, 0, "Low", "QmData1", false);
      // Medium
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc2", 1, 0, "Medium", "QmData2", false);
      // High
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc3", 2, 0, "High", "QmData3", false);
      // Critical
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc4", 3, 0, "Critical", "QmData4", false);

      const entry1 = await trafficLog.getTrafficEntry(1);
      const entry4 = await trafficLog.getTrafficEntry(4);

      expect(entry1.congestionLevel).to.equal(0);
      expect(entry4.congestionLevel).to.equal(3);
    });
  });

  describe("Action Types", function () {
    it("Should handle all action types", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );

      // None
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc1", 0, 0, "None", "QmData", false);
      // SignalAdjustment
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc2", 1, 1, "Signal", "QmData", false);
      // RouteRedirection
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc3", 2, 2, "Route", "QmData", false);
      // EmergencyResponse
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc4", 3, 3, "Emergency", "QmData", false);
      // MaintenanceScheduled
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc5", 1, 4, "Maintenance", "QmData", false);

      const entry3 = await trafficLog.getTrafficEntry(3);
      expect(entry3.actionTaken).to.equal(2);
    });
  });

  describe("Get Traffic Entry", function () {
    it("Should return traffic entry details", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );

      await trafficLog
        .connect(operator1)
        .logTrafficData(
          "Test Location",
          2,
          1,
          "Test Description",
          "QmTest",
          false
        );

      const entry = await trafficLog.getTrafficEntry(1);
      expect(entry.location).to.equal("Test Location");
      expect(entry.congestionLevel).to.equal(2);
      expect(entry.actionTaken).to.equal(1);
      expect(entry.operator).to.equal(operator1.address);
    });

    it("Should not return invalid log ID", async function () {
      const { trafficLog } = await loadFixture(deployTrafficLogFixture);

      await expect(trafficLog.getTrafficEntry(999)).to.be.revertedWith(
        "Invalid log ID"
      );
    });

    it("Should not return zero log ID", async function () {
      const { trafficLog } = await loadFixture(deployTrafficLogFixture);

      await expect(trafficLog.getTrafficEntry(0)).to.be.revertedWith(
        "Invalid log ID"
      );
    });
  });

  describe("Get Location Logs", function () {
    it("Should return all logs for a location", async function () {
      const { trafficLog, operator1, owner } = await loadFixture(
        deployTrafficLogFixture
      );
      const location = "Main Street";

      await trafficLog
        .connect(operator1)
        .logTrafficData(location, 1, 0, "Desc1", "QmData1", false);
      await trafficLog
        .connect(owner)
        .logTrafficData(location, 2, 1, "Desc2", "QmData2", false);
      await trafficLog
        .connect(operator1)
        .logTrafficData("Other Location", 1, 0, "Desc3", "QmData3", false);

      const locationLogs = await trafficLog.getLocationLogs(location);
      expect(locationLogs.length).to.equal(2);
      expect(locationLogs[0]).to.equal(1);
      expect(locationLogs[1]).to.equal(2);
    });

    it("Should return empty array for location with no logs", async function () {
      const { trafficLog } = await loadFixture(deployTrafficLogFixture);

      const locationLogs = await trafficLog.getLocationLogs(
        "Nonexistent Location"
      );
      expect(locationLogs.length).to.equal(0);
    });
  });

  describe("Get Operator Logs", function () {
    it("Should return all logs for an operator", async function () {
      const { trafficLog, operator1, operator2 } = await loadFixture(
        deployTrafficLogFixture
      );
      await trafficLog.addTrafficOperator(operator2.address);

      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc1", 1, 0, "Desc1", "QmData1", false);
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc2", 2, 1, "Desc2", "QmData2", false);
      await trafficLog
        .connect(operator2)
        .logTrafficData("Loc3", 1, 0, "Desc3", "QmData3", false);

      const operatorLogs = await trafficLog.getOperatorLogs(operator1.address);
      expect(operatorLogs.length).to.equal(2);
    });

    it("Should return empty array for operator with no logs", async function () {
      const { trafficLog, operator2 } = await loadFixture(
        deployTrafficLogFixture
      );

      const operatorLogs = await trafficLog.getOperatorLogs(operator2.address);
      expect(operatorLogs.length).to.equal(0);
    });
  });

  describe("Get Recent Logs", function () {
    it("Should return most recent logs", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );

      for (let i = 1; i <= 5; i++) {
        await trafficLog
          .connect(operator1)
          .logTrafficData(`Loc${i}`, 1, 0, `Desc${i}`, "QmData", false);
      }

      const recentLogs = await trafficLog.getRecentLogs(3);
      expect(recentLogs.length).to.equal(3);
      expect(recentLogs[0]).to.equal(5); // Most recent
      expect(recentLogs[1]).to.equal(4);
      expect(recentLogs[2]).to.equal(3);
    });

    it("Should return all logs if count exceeds total", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );

      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc1", 1, 0, "Desc1", "QmData", false);
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc2", 2, 1, "Desc2", "QmData", false);

      const recentLogs = await trafficLog.getRecentLogs(10);
      expect(recentLogs.length).to.equal(2);
    });

    it("Should not allow zero count", async function () {
      const { trafficLog } = await loadFixture(deployTrafficLogFixture);

      await expect(trafficLog.getRecentLogs(0)).to.be.revertedWith(
        "Count must be greater than 0"
      );
    });
  });

  describe("Get Logs By Time Range", function () {
    it("Should return logs within time range", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );

      const startTime = await time.latest();

      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc1", 1, 0, "Desc1", "QmData", false);
      await time.increase(3600); // 1 hour
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc2", 2, 1, "Desc2", "QmData", false);
      await time.increase(3600); // 1 hour
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc3", 3, 2, "Desc3", "QmData", false);

      const endTime = await time.latest();

      const logs = await trafficLog.getLogsByTimeRange(startTime, endTime);
      expect(logs.length).to.equal(3);
    });

    it("Should return only logs matching criteria", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );

      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc1", 1, 0, "Desc1", "QmData", false);

      const startTime = await time.latest();
      await time.increase(100);

      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc2", 2, 1, "Desc2", "QmData", false);

      const endTime = await time.latest();
      await time.increase(100);

      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc3", 3, 2, "Desc3", "QmData", false);

      const logs = await trafficLog.getLogsByTimeRange(startTime, endTime);
      expect(logs.length).to.equal(2); // Both log 1 and log 2 are within the time range
      expect(logs[0]).to.equal(1);
      expect(logs[1]).to.equal(2);
    });

    it("Should not allow invalid time range", async function () {
      const { trafficLog } = await loadFixture(deployTrafficLogFixture);

      await expect(trafficLog.getLogsByTimeRange(1000, 500)).to.be.revertedWith(
        "Invalid time range"
      );
    });
  });

  describe("Get Emergency Logs", function () {
    it("Should return only emergency logs", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );

      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc1", 1, 0, "Normal", "QmData", false);
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc2", 3, 3, "Emergency1", "QmData", true);
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc3", 2, 1, "Normal2", "QmData", false);
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc4", 3, 3, "Emergency2", "QmData", true);

      const emergencyLogs = await trafficLog.getEmergencyLogs();
      expect(emergencyLogs.length).to.equal(2);
      expect(emergencyLogs[0]).to.equal(2);
      expect(emergencyLogs[1]).to.equal(4);
    });

    it("Should return empty array when no emergencies", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );

      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc1", 1, 0, "Normal", "QmData", false);
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc2", 2, 1, "Normal2", "QmData", false);

      const emergencyLogs = await trafficLog.getEmergencyLogs();
      expect(emergencyLogs.length).to.equal(0);
    });
  });

  describe("Complex Scenarios", function () {
    it("Should handle high volume of logs", async function () {
      const { trafficLog, operator1 } = await loadFixture(
        deployTrafficLogFixture
      );

      for (let i = 1; i <= 20; i++) {
        await trafficLog
          .connect(operator1)
          .logTrafficData(
            `Location ${i}`,
            i % 4,
            i % 5,
            `Description ${i}`,
            `QmData${i}`,
            i % 5 === 0
          );
      }

      expect(await trafficLog.logCount()).to.equal(20);

      const emergencyLogs = await trafficLog.getEmergencyLogs();
      expect(emergencyLogs.length).to.equal(4); // Every 5th log
    });

    it("Should handle multiple operators logging simultaneously", async function () {
      const { trafficLog, operator1, operator2 } = await loadFixture(
        deployTrafficLogFixture
      );
      await trafficLog.addTrafficOperator(operator2.address);

      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc1", 1, 0, "Op1 Log1", "QmData", false);
      await trafficLog
        .connect(operator2)
        .logTrafficData("Loc2", 2, 1, "Op2 Log1", "QmData", false);
      await trafficLog
        .connect(operator1)
        .logTrafficData("Loc3", 1, 0, "Op1 Log2", "QmData", false);

      const op1Logs = await trafficLog.getOperatorLogs(operator1.address);
      const op2Logs = await trafficLog.getOperatorLogs(operator2.address);

      expect(op1Logs.length).to.equal(2);
      expect(op2Logs.length).to.equal(1);
    });
  });
});
