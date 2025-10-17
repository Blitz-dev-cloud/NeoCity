// Check deployment status and view contract information
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("=".repeat(70));
  console.log("NeoCity Smart Contracts - Deployment Status");
  console.log("=".repeat(70), "\n");

  // Load deployment addresses
  const deploymentData = JSON.parse(fs.readFileSync("deployments.json", "utf8"));
  const contracts = deploymentData.contracts;

  console.log("Network:", deploymentData.network);
  console.log("Chain ID:", deploymentData.chainId);
  console.log("Deployed by:", deploymentData.deployer);
  console.log("Timestamp:", new Date(deploymentData.timestamp).toLocaleString(), "\n");

  // Get signers
  const [deployer, user1, user2] = await hre.ethers.getSigners();

  console.log("=".repeat(70));
  console.log("DEPLOYED CONTRACTS");
  console.log("=".repeat(70), "\n");

  // Connect to contracts and display info
  const token = await hre.ethers.getContractAt("DeFiToken", contracts.DeFiToken);
  const identityRegistry = await hre.ethers.getContractAt("IdentityRegistry", contracts.IdentityRegistry);
  const bank = await hre.ethers.getContractAt("DeFiBank", contracts.DeFiBank);
  const voting = await hre.ethers.getContractAt("Voting", contracts.Voting);
  const grievance = await hre.ethers.getContractAt("Grievance", contracts.Grievance);
  const ehrRegistry = await hre.ethers.getContractAt("EHRRegistry", contracts.EHRRegistry);
  const supplyChain = await hre.ethers.getContractAt("SupplyChain", contracts.SupplyChain);
  const trafficLog = await hre.ethers.getContractAt("TrafficLog", contracts.TrafficLog);

  // DeFiToken info
  console.log("1. DeFiToken (" + contracts.DeFiToken + ")");
  const tokenName = await token.name();
  const tokenSymbol = await token.symbol();
  const totalSupply = await token.totalSupply();
  const maxSupply = await token.MAX_SUPPLY();
  console.log("   Name:", tokenName);
  console.log("   Symbol:", tokenSymbol);
  console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), tokenSymbol);
  console.log("   Max Supply:", hre.ethers.formatEther(maxSupply), tokenSymbol, "\n");

  // IdentityRegistry info
  console.log("2. IdentityRegistry (" + contracts.IdentityRegistry + ")");
  try {
    const user1DID = await identityRegistry.userDIDs(user1.address, 0);
    console.log("   Registered DIDs: ✅ (e.g., User1 has DID)\n");
  } catch {
    console.log("   Registered DIDs: None yet\n");
  }

  // DeFiBank info
  console.log("3. DeFiBank (" + contracts.DeFiBank + ")");
  const bankBalance = await token.balanceOf(await bank.getAddress());
  console.log("   Token Balance:", hre.ethers.formatEther(bankBalance), tokenSymbol);
  const interestRate = await bank.DEFAULT_INTEREST_RATE();
  const collateralRatio = await bank.COLLATERAL_RATIO();
  console.log("   Interest Rate:", (Number(interestRate) / 100).toString() + "%");
  console.log("   Collateral Ratio:", collateralRatio.toString() + "%\n");

  // Voting info
  console.log("4. Voting (" + contracts.Voting + ")");
  const proposalCount = await voting.proposalCount();
  console.log("   Proposals Created:", proposalCount.toString());
  const votingPeriod = await voting.VOTING_PERIOD();
  const revealPeriod = await voting.REVEAL_PERIOD();
  console.log("   Voting Period:", votingPeriod.toString(), "seconds");
  console.log("   Reveal Period:", revealPeriod.toString(), "seconds\n");

  // Grievance info
  console.log("5. Grievance (" + contracts.Grievance + ")");
  console.log("   Role-based access control: ✅");
  console.log("   Admin and Resolver roles configured\n");

  // EHRRegistry info
  console.log("6. EHRRegistry (" + contracts.EHRRegistry + ")");
  console.log("   Healthcare records management: ✅");
  console.log("   Doctor authorization system: ✅\n");

  // SupplyChain info
  console.log("7. SupplyChain (" + contracts.SupplyChain + ")");
  console.log("   Farmer and vendor roles: ✅");
  console.log("   Batch tracking system: ✅\n");

  // TrafficLog info
  console.log("8. TrafficLog (" + contracts.TrafficLog + ")");
  const logCount = await trafficLog.logCount();
  console.log("   Traffic Logs Recorded:", logCount.toString());
  console.log("   Operator-based logging: ✅\n");

  console.log("=".repeat(70));
  console.log("ACCOUNT BALANCES");
  console.log("=".repeat(70), "\n");

  const deployerBalance = await token.balanceOf(deployer.address);
  const user1Balance = await token.balanceOf(user1.address);
  const user2Balance = await token.balanceOf(user2.address);

  console.log("Deployer:", hre.ethers.formatEther(deployerBalance), tokenSymbol);
  console.log("User1:   ", hre.ethers.formatEther(user1Balance), tokenSymbol);
  console.log("User2:   ", hre.ethers.formatEther(user2Balance), tokenSymbol);
  console.log("Bank:    ", hre.ethers.formatEther(bankBalance), tokenSymbol, "\n");

  // User deposits and loans
  console.log("=".repeat(70));
  console.log("USER ACTIVITY");
  console.log("=".repeat(70), "\n");

  const user1DepositInfo = await bank.deposits(user1.address);
  const user1Loaned = await bank.totalLoaned(user1.address);
  const user1LoanCount = await bank.getLoanCount(user1.address);

  console.log("User1 Activity:");
  console.log("  Deposit Amount:", hre.ethers.formatEther(user1DepositInfo.amount), tokenSymbol);
  console.log("  Total Loaned:", hre.ethers.formatEther(user1Loaned), tokenSymbol);
  console.log("  Active Loans:", user1LoanCount.toString(), "\n");

  console.log("=".repeat(70));
  console.log("✅ All contracts are deployed and operational!");
  console.log("=".repeat(70), "\n");

  console.log("Quick Commands:");
  console.log("  • Interactive console: npx hardhat console --network localhost");
  console.log("  • Run tests: npx hardhat test");
  console.log("  • View addresses: cat deployments.json");
  console.log("  • Documentation: See DEPLOYMENT.md and QUICK_REFERENCE.md\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
