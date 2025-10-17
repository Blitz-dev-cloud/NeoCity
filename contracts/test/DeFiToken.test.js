const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("DeFiToken", function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const DeFiToken = await ethers.getContractFactory("DeFiToken");
    const token = await DeFiToken.deploy();

    return { token, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should have the correct name and symbol", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.name()).to.equal("NeoToken");
      expect(await token.symbol()).to.equal("NEO");
    });

    it("Should mint initial supply to owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      const initialSupply = ethers.parseEther("100000000");
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should set the correct max supply", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      const maxSupply = ethers.parseEther("1000000000");
      expect(await token.MAX_SUPPLY()).to.equal(maxSupply);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const mintAmount = ethers.parseEther("1000");

      await expect(token.mint(addr1.address, mintAmount))
        .to.emit(token, "TokensMinted")
        .withArgs(addr1.address, mintAmount);

      expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);
      const mintAmount = ethers.parseEther("1000");

      await expect(
        token.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should not allow minting beyond max supply", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);
      const excessAmount = ethers.parseEther("900000001");

      await expect(token.mint(addr1.address, excessAmount)).to.be.revertedWith(
        "Exceeds max supply"
      );
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their tokens", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      const burnAmount = ethers.parseEther("1000");
      const initialBalance = await token.balanceOf(owner.address);

      await expect(token.burn(burnAmount))
        .to.emit(token, "TokensBurned")
        .withArgs(owner.address, burnAmount);

      expect(await token.balanceOf(owner.address)).to.equal(
        initialBalance - burnAmount
      );
    });

    it("Should not allow burning more than balance", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);
      const burnAmount = ethers.parseEther("1000");

      await expect(
        token.connect(addr1).burn(burnAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      await token.pause();
      expect(await token.paused()).to.equal(true);
    });

    it("Should allow owner to unpause", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      await token.pause();
      await token.unpause();
      expect(await token.paused()).to.equal(false);
    });

    it("Should not allow non-owner to pause", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);
      await expect(token.connect(addr1).pause()).to.be.revertedWithCustomError(
        token,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should prevent transfers when paused", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      await token.pause();

      await expect(
        token.transfer(addr1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { token, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      const transferAmount = ethers.parseEther("50");

      await token.transfer(addr1.address, ethers.parseEther("100"));
      await token.connect(addr1).transfer(addr2.address, transferAmount);

      expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { token, addr1, owner } = await loadFixture(deployTokenFixture);

      await expect(
        token.connect(addr1).transfer(owner.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });
  });
});
