// Interactive script to demonstrate contract functionality
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("NeoCity Smart Contracts - Interactive Demo\n");

  // Load deployment addresses
  const deploymentData = JSON.parse(fs.readFileSync("deployments.json", "utf8"));
  const contracts = deploymentData.contracts;

  // Get signers
  const [deployer, user1, user2] = await hre.ethers.getSigners();

  // Connect to contracts
  const token = await hre.ethers.getContractAt("DeFiToken", contracts.DeFiToken);
  const identityRegistry = await hre.ethers.getContractAt("IdentityRegistry", contracts.IdentityRegistry);
  const bank = await hre.ethers.getContractAt("DeFiBank", contracts.DeFiBank);

  console.log("=".repeat(70));
  console.log("DEMONSTRATION: DeFi Banking Flow");
  console.log("=".repeat(70), "\n");

  // 1. Check initial balances
  console.log("1. Initial Token Balances:");
  const initialBalance = await token.balanceOf(user1.address);
  console.log("   User1:", hre.ethers.formatEther(initialBalance), "NCT\n");

  // 2. Make a deposit
  console.log("2. User1 deposits 1000 NCT to the bank...");
  const depositAmount = hre.ethers.parseEther("1000");
  await token.connect(user1).approve(await bank.getAddress(), depositAmount);
  await bank.connect(user1).deposit(depositAmount);
  
  const depositInfo = await bank.deposits(user1.address);
  console.log("   ✅ Deposit successful!");
  console.log("   Amount:", hre.ethers.formatEther(depositInfo.amount), "NCT");
  console.log("   Timestamp:", new Date(Number(depositInfo.timestamp) * 1000).toLocaleString(), "\n");

  // 3. Check updated balance
  const balanceAfterDeposit = await token.balanceOf(user1.address);
  console.log("3. Updated Token Balance:");
  console.log("   User1:", hre.ethers.formatEther(balanceAfterDeposit), "NCT\n");

  // 4. Request a loan
  console.log("4. User1 requests a loan of 500 NCT with 750 NCT collateral...");
  const loanAmount = hre.ethers.parseEther("500");
  const collateralAmount = hre.ethers.parseEther("750");
  
  await token.connect(user1).approve(await bank.getAddress(), collateralAmount);
  await bank.connect(user1).requestLoan(loanAmount, collateralAmount);
  console.log("   ✅ Loan requested!\n");

  // 5. Approve loan (as owner)
  console.log("5. Bank owner approves the loan...");
  await bank.approveLoan(user1.address, 0);
  console.log("   ✅ Loan approved and funds transferred!\n");

  // 6. Check loan info
  const loanCount = await bank.getLoanCount(user1.address);
  console.log("6. Loan Details:");
  console.log("   Total loans:", loanCount.toString());
  
  // Get loan info directly from the loans mapping (it's a public array)
  // Note: We access it as loans(address, index) for public array mappings
  try {
    // The loans mapping returns individual loan properties
    const loan = await bank.loans(user1.address, 0);
    console.log("   Loan Amount:", hre.ethers.formatEther(loan.amount), "NCT");
    console.log("   Collateral:", hre.ethers.formatEther(loan.collateral), "NCT");
    console.log("   Start Time:", new Date(Number(loan.timestamp) * 1000).toLocaleString());
    console.log("   Active:", loan.isActive);
    console.log("   Approved:", loan.isApproved, "\n");
  } catch (error) {
    console.log("   (Loan details not available via public mapping)\n");
  }

  // 7. Calculate interest (simulated after some time)
  const interest = await bank.calculateLoanInterest(user1.address, 0);
  console.log("7. Current Interest:");
  console.log("   Interest accrued:", hre.ethers.formatEther(interest), "NCT\n");

  // 8. Final balances
  console.log("8. Final Status:");
  const finalBalance = await token.balanceOf(user1.address);
  const totalDeposited = await bank.totalDeposited(user1.address);
  const totalLoaned = await bank.totalLoaned(user1.address);
  
  console.log("   Token Balance:", hre.ethers.formatEther(finalBalance), "NCT");
  console.log("   Total Deposited:", hre.ethers.formatEther(totalDeposited), "NCT");
  console.log("   Total Loaned:", hre.ethers.formatEther(totalLoaned), "NCT");

  console.log("\n" + "=".repeat(70));
  console.log("🎉 Demo Complete!");
  console.log("=".repeat(70), "\n");

  console.log("Try these commands to explore more:");
  console.log("  - View all contracts: cat deployments.json");
  console.log("  - Open console: npx hardhat console --network localhost");
  console.log("  - Run tests: npx hardhat test\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
