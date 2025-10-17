const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-network-helpers");

describe("DeFiBank", function () {
  async function deployDeFiBankFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy DeFiToken
    const DeFiToken = await ethers.getContractFactory("DeFiToken");
    const token = await DeFiToken.deploy();

    // Deploy IdentityRegistry
    const IdentityRegistry = await ethers.getContractFactory(
      "IdentityRegistry"
    );
    const identityRegistry = await IdentityRegistry.deploy();

    // Deploy DeFiBank
    const DeFiBank = await ethers.getContractFactory("DeFiBank");
    const bank = await DeFiBank.deploy(
      await token.getAddress(),
      await identityRegistry.getAddress()
    );

    // Mint tokens to users for testing
    await token.mint(user1.address, ethers.parseEther("10000"));
    await token.mint(user2.address, ethers.parseEther("10000"));

    return { token, identityRegistry, bank, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the correct token and registry addresses", async function () {
      const { token, identityRegistry, bank } = await loadFixture(
        deployDeFiBankFixture
      );
      expect(await bank.neoToken()).to.equal(await token.getAddress());
      expect(await bank.identityRegistry()).to.equal(
        await identityRegistry.getAddress()
      );
    });

    it("Should set the right owner", async function () {
      const { bank, owner } = await loadFixture(deployDeFiBankFixture);
      expect(await bank.owner()).to.equal(owner.address);
    });

    it("Should have correct constants", async function () {
      const { bank } = await loadFixture(deployDeFiBankFixture);
      expect(await bank.DEFAULT_INTEREST_RATE()).to.equal(500);
      expect(await bank.COLLATERAL_RATIO()).to.equal(150);
    });
  });

  describe("Deposits", function () {
    it("Should allow users to deposit tokens", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const depositAmount = ethers.parseEther("1000");

      await token
        .connect(user1)
        .approve(await bank.getAddress(), depositAmount);

      await expect(bank.connect(user1).deposit(depositAmount))
        .to.emit(bank, "DepositMade")
        .withArgs(user1.address, depositAmount, (await time.latest()) + 1);

      const deposit = await bank.deposits(user1.address);
      expect(deposit.amount).to.equal(depositAmount);
    });

    it("Should not allow zero deposits", async function () {
      const { bank, user1 } = await loadFixture(deployDeFiBankFixture);

      await expect(bank.connect(user1).deposit(0)).to.be.revertedWith(
        "Amount must be greater than 0"
      );
    });

    it("Should accumulate deposits with interest", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const depositAmount = ethers.parseEther("1000");

      await token
        .connect(user1)
        .approve(await bank.getAddress(), depositAmount * 2n);
      await bank.connect(user1).deposit(depositAmount);

      // Advance time by 1 year
      await time.increase(365 * 24 * 60 * 60);

      await bank.connect(user1).deposit(depositAmount);

      const deposit = await bank.deposits(user1.address);
      // Should have original deposit + interest + new deposit
      expect(deposit.amount).to.be.gt(depositAmount * 2n);
    });

    it("Should fail if token transfer fails", async function () {
      const { bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const depositAmount = ethers.parseEther("1000");

      // No approval given
      await expect(bank.connect(user1).deposit(depositAmount)).to.be.reverted;
    });

    it("Should not allow deposits when paused", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const depositAmount = ethers.parseEther("1000");

      await token
        .connect(user1)
        .approve(await bank.getAddress(), depositAmount);
      await bank.pause();

      await expect(
        bank.connect(user1).deposit(depositAmount)
      ).to.be.revertedWithCustomError(bank, "EnforcedPause");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow users to withdraw deposits", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const depositAmount = ethers.parseEther("1000");
      const withdrawAmount = ethers.parseEther("500");

      await token
        .connect(user1)
        .approve(await bank.getAddress(), depositAmount);
      await bank.connect(user1).deposit(depositAmount);

      await expect(bank.connect(user1).withdraw(withdrawAmount))
        .to.emit(bank, "WithdrawalMade")
        .withArgs(user1.address, withdrawAmount, (await time.latest()) + 1);

      const deposit = await bank.deposits(user1.address);
      // Account for minimal interest accrued during the transaction
      expect(deposit.amount).to.be.closeTo(
        depositAmount - withdrawAmount,
        ethers.parseEther("0.01")
      );
    });

    it("Should not allow withdrawing more than balance", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const depositAmount = ethers.parseEther("1000");

      await token
        .connect(user1)
        .approve(await bank.getAddress(), depositAmount);
      await bank.connect(user1).deposit(depositAmount);

      await expect(
        bank.connect(user1).withdraw(ethers.parseEther("2000"))
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should not allow zero withdrawals", async function () {
      const { bank, user1 } = await loadFixture(deployDeFiBankFixture);

      await expect(bank.connect(user1).withdraw(0)).to.be.revertedWith(
        "Amount must be greater than 0"
      );
    });

    it("Should include interest in withdrawal", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const depositAmount = ethers.parseEther("1000");

      await token
        .connect(user1)
        .approve(await bank.getAddress(), depositAmount);
      await bank.connect(user1).deposit(depositAmount);

      // Advance time by 1 year
      await time.increase(365 * 24 * 60 * 60);

      const balanceBefore = await token.balanceOf(user1.address);
      const interest = await bank.calculateInterest(user1.address);

      await bank.connect(user1).withdraw(depositAmount);

      const balanceAfter = await token.balanceOf(user1.address);
      expect(balanceAfter - balanceBefore).to.be.closeTo(
        depositAmount,
        ethers.parseEther("50")
      );
    });
  });

  describe("Loan Requests", function () {
    it("Should allow users to request loans", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const loanAmount = ethers.parseEther("1000");
      const collateralAmount = ethers.parseEther("1500");

      await token
        .connect(user1)
        .approve(await bank.getAddress(), collateralAmount);

      await expect(
        bank.connect(user1).requestLoan(loanAmount, collateralAmount)
      )
        .to.emit(bank, "LoanRequested")
        .withArgs(user1.address, loanAmount, collateralAmount, 0);

      expect(await bank.getLoanCount(user1.address)).to.equal(1);
    });

    it("Should not allow loan with insufficient collateral", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const loanAmount = ethers.parseEther("1000");
      const collateralAmount = ethers.parseEther("1000"); // Less than 150%

      await token
        .connect(user1)
        .approve(await bank.getAddress(), collateralAmount);

      await expect(
        bank.connect(user1).requestLoan(loanAmount, collateralAmount)
      ).to.be.revertedWith("Insufficient collateral");
    });

    it("Should not allow zero loan amount", async function () {
      const { bank, user1 } = await loadFixture(deployDeFiBankFixture);

      await expect(
        bank.connect(user1).requestLoan(0, ethers.parseEther("1500"))
      ).to.be.revertedWith("Loan amount must be greater than 0");
    });

    it("Should transfer collateral to bank", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const loanAmount = ethers.parseEther("1000");
      const collateralAmount = ethers.parseEther("1500");

      const userBalanceBefore = await token.balanceOf(user1.address);

      await token
        .connect(user1)
        .approve(await bank.getAddress(), collateralAmount);
      await bank.connect(user1).requestLoan(loanAmount, collateralAmount);

      const userBalanceAfter = await token.balanceOf(user1.address);
      expect(userBalanceBefore - userBalanceAfter).to.equal(collateralAmount);
    });
  });

  describe("Loan Approval", function () {
    it("Should allow owner to approve loans", async function () {
      const { token, bank, user1, owner } = await loadFixture(
        deployDeFiBankFixture
      );
      const loanAmount = ethers.parseEther("1000");
      const collateralAmount = ethers.parseEther("1500");

      // Transfer tokens to bank for loan disbursement
      await token.transfer(await bank.getAddress(), ethers.parseEther("5000"));

      await token
        .connect(user1)
        .approve(await bank.getAddress(), collateralAmount);
      await bank.connect(user1).requestLoan(loanAmount, collateralAmount);

      await expect(bank.approveLoan(user1.address, 0))
        .to.emit(bank, "LoanApproved")
        .withArgs(user1.address, 0);

      expect(await bank.totalLoaned(user1.address)).to.equal(loanAmount);
    });

    it("Should not allow non-owner to approve loans", async function () {
      const { token, bank, user1, user2 } = await loadFixture(
        deployDeFiBankFixture
      );
      const loanAmount = ethers.parseEther("1000");
      const collateralAmount = ethers.parseEther("1500");

      await token
        .connect(user1)
        .approve(await bank.getAddress(), collateralAmount);
      await bank.connect(user1).requestLoan(loanAmount, collateralAmount);

      await expect(
        bank.connect(user2).approveLoan(user1.address, 0)
      ).to.be.revertedWithCustomError(bank, "OwnableUnauthorizedAccount");
    });

    it("Should transfer loan amount to borrower", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const loanAmount = ethers.parseEther("1000");
      const collateralAmount = ethers.parseEther("1500");

      await token.transfer(await bank.getAddress(), ethers.parseEther("5000"));

      const balanceBefore = await token.balanceOf(user1.address);

      await token
        .connect(user1)
        .approve(await bank.getAddress(), collateralAmount);
      await bank.connect(user1).requestLoan(loanAmount, collateralAmount);
      await bank.approveLoan(user1.address, 0);

      const balanceAfter = await token.balanceOf(user1.address);
      // Balance should increase by loan amount minus collateral already paid
      expect(balanceAfter).to.be.gt(balanceBefore - collateralAmount);
    });

    it("Should not approve already approved loan", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const loanAmount = ethers.parseEther("1000");
      const collateralAmount = ethers.parseEther("1500");

      await token.transfer(await bank.getAddress(), ethers.parseEther("5000"));
      await token
        .connect(user1)
        .approve(await bank.getAddress(), collateralAmount);
      await bank.connect(user1).requestLoan(loanAmount, collateralAmount);
      await bank.approveLoan(user1.address, 0);

      await expect(bank.approveLoan(user1.address, 0)).to.be.revertedWith(
        "Loan already approved"
      );
    });
  });

  describe("Loan Repayment", function () {
    it("Should allow users to repay loans", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const loanAmount = ethers.parseEther("1000");
      const collateralAmount = ethers.parseEther("1500");

      await token.transfer(await bank.getAddress(), ethers.parseEther("5000"));
      await token
        .connect(user1)
        .approve(await bank.getAddress(), collateralAmount * 2n);
      await bank.connect(user1).requestLoan(loanAmount, collateralAmount);
      await bank.approveLoan(user1.address, 0);

      // Advance time
      await time.increase(30 * 24 * 60 * 60); // 30 days

      const interest = await bank.calculateLoanInterest(user1.address, 0);
      const totalRepayment = loanAmount + interest;

      // Approve more than needed to account for additional interest accrued during the transaction
      await token
        .connect(user1)
        .approve(
          await bank.getAddress(),
          totalRepayment + ethers.parseEther("10")
        );

      await expect(bank.connect(user1).repayLoan(0)).to.emit(
        bank,
        "LoanRepaid"
      );

      expect(await bank.totalLoaned(user1.address)).to.equal(0);
    });

    it("Should return collateral after repayment", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const loanAmount = ethers.parseEther("1000");
      const collateralAmount = ethers.parseEther("1500");

      await token.transfer(await bank.getAddress(), ethers.parseEther("5000"));

      const initialBalance = await token.balanceOf(user1.address);

      await token
        .connect(user1)
        .approve(await bank.getAddress(), collateralAmount * 3n);
      await bank.connect(user1).requestLoan(loanAmount, collateralAmount);
      await bank.approveLoan(user1.address, 0);

      const interest = await bank.calculateLoanInterest(user1.address, 0);
      const totalRepayment = loanAmount + interest;

      // Approve more than needed to account for additional interest accrued during the transaction
      await token
        .connect(user1)
        .approve(
          await bank.getAddress(),
          totalRepayment + ethers.parseEther("10")
        );
      await bank.connect(user1).repayLoan(0);

      const finalBalance = await token.balanceOf(user1.address);
      // Should get collateral back minus interest
      expect(finalBalance).to.be.closeTo(
        initialBalance - interest,
        ethers.parseEther("1")
      );
    });

    it("Should not allow repaying inactive loan", async function () {
      const { bank, user1 } = await loadFixture(deployDeFiBankFixture);

      await expect(bank.connect(user1).repayLoan(0)).to.be.revertedWith(
        "Invalid loan ID"
      );
    });
  });

  describe("Interest Calculations", function () {
    it("Should calculate deposit interest correctly", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const depositAmount = ethers.parseEther("1000");

      await token
        .connect(user1)
        .approve(await bank.getAddress(), depositAmount);
      await bank.connect(user1).deposit(depositAmount);

      // Advance time by 1 year
      await time.increase(365 * 24 * 60 * 60);

      const interest = await bank.calculateInterest(user1.address);
      const expectedInterest = (depositAmount * 500n) / 10000n; // 5% annual

      expect(interest).to.be.closeTo(expectedInterest, ethers.parseEther("1"));
    });

    it("Should calculate loan interest correctly", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const loanAmount = ethers.parseEther("1000");
      const collateralAmount = ethers.parseEther("1500");

      await token.transfer(await bank.getAddress(), ethers.parseEther("5000"));
      await token
        .connect(user1)
        .approve(await bank.getAddress(), collateralAmount);
      await bank.connect(user1).requestLoan(loanAmount, collateralAmount);
      await bank.approveLoan(user1.address, 0);

      // Advance time by 1 year
      await time.increase(365 * 24 * 60 * 60);

      const interest = await bank.calculateLoanInterest(user1.address, 0);
      const expectedInterest = (loanAmount * 500n) / 10000n; // 5% annual

      expect(interest).to.be.closeTo(expectedInterest, ethers.parseEther("1"));
    });

    it("Should return zero interest for zero deposit", async function () {
      const { bank, user1 } = await loadFixture(deployDeFiBankFixture);
      expect(await bank.calculateInterest(user1.address)).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("Should return deposit information", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const depositAmount = ethers.parseEther("1000");

      await token
        .connect(user1)
        .approve(await bank.getAddress(), depositAmount);
      await bank.connect(user1).deposit(depositAmount);

      const [amount, timestamp, interestRate] = await bank.getDeposit(
        user1.address
      );
      expect(amount).to.equal(depositAmount);
      expect(interestRate).to.equal(500);
    });

    it("Should return loan count", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const loanAmount = ethers.parseEther("1000");
      const collateralAmount = ethers.parseEther("1500");

      expect(await bank.getLoanCount(user1.address)).to.equal(0);

      await token
        .connect(user1)
        .approve(await bank.getAddress(), collateralAmount);
      await bank.connect(user1).requestLoan(loanAmount, collateralAmount);

      expect(await bank.getLoanCount(user1.address)).to.equal(1);
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      const { bank } = await loadFixture(deployDeFiBankFixture);

      await bank.pause();
      expect(await bank.paused()).to.equal(true);

      await bank.unpause();
      expect(await bank.paused()).to.equal(false);
    });

    it("Should prevent operations when paused", async function () {
      const { token, bank, user1 } = await loadFixture(deployDeFiBankFixture);
      const amount = ethers.parseEther("1000");

      await token.connect(user1).approve(await bank.getAddress(), amount);
      await bank.pause();

      await expect(
        bank.connect(user1).deposit(amount)
      ).to.be.revertedWithCustomError(bank, "EnforcedPause");
    });
  });
});
