# NeoCity Smart Contracts - Quick Reference Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run all tests
npx hardhat test

# Run tests with gas report
REPORT_GAS=true npx hardhat test
```

## 📁 Project Structure

```
contracts/
├── contracts/           # Smart contracts
├── test/               # Test files
├── artifacts/          # Compiled contracts
├── cache/             # Build cache
├── hardhat.config.js  # Hardhat configuration
└── package.json       # Dependencies
```

## 🧪 Test Commands

```bash
# All tests
npx hardhat test

# Individual contract tests
npx hardhat test test/DeFiToken.test.js
npx hardhat test test/IdentityRegistry.test.js
npx hardhat test test/DeFiBank.test.js
npx hardhat test test/Voting.test.js
npx hardhat test test/Grievance.test.js
npx hardhat test test/EHRRegistry.test.js
npx hardhat test test/SupplyChain.test.js
npx hardhat test test/TrafficLog.test.js

# Coverage report
npx hardhat coverage

# Gas report
REPORT_GAS=true npx hardhat test
```

## 📊 Contract Summary

| Contract             | Purpose            | Key Features                                          |
| -------------------- | ------------------ | ----------------------------------------------------- |
| **DeFiToken**        | Platform token     | ERC20, Mintable, Burnable, Pausable                   |
| **IdentityRegistry** | Digital identity   | DID management, Verifiable credentials                |
| **DeFiBank**         | DeFi banking       | Deposits, Loans, Interest calculation                 |
| **Voting**           | Governance         | Commit-reveal, Time-locked, DID-based                 |
| **Grievance**        | Citizen services   | Filing, Assignment, Resolution tracking               |
| **EHRRegistry**      | Healthcare         | Medical records, Access control, Doctor authorization |
| **SupplyChain**      | Traceability       | Batch tracking, Ownership history, Audits             |
| **TrafficLog**       | Traffic management | Congestion tracking, Emergency logging                |

## 🔑 Key Contract Interactions

### DeFiToken Flow

```
Owner → mint(to, amount) → User receives tokens
User → burn(amount) → Tokens destroyed
Owner → pause() → Transfers blocked
```

### Identity Flow

```
User → registerIdentity(did, doc) → Identity created
Verifier → issueCredential(did, cred) → Credential issued
Anyone → verifyIdentity(did) → Check if valid
```

### DeFiBank Flow

```
User → deposit(amount) → Tokens staked
User → requestLoan(amount, collateral) → Loan requested
Owner → approveLoan(borrower, id) → Loan approved
User → repayLoan(id) → Loan repaid + collateral returned
```

### Voting Flow

```
User → createProposal(did, title, desc) → Proposal created
Voter → commitVote(id, did, hash) → Vote committed (hidden)
[Wait for voting period to end]
Voter → revealVote(id, did, vote, nonce) → Vote revealed
Anyone → executeProposal(id) → Proposal executed
```

### Grievance Flow

```
Citizen → fileGrievance(did, title, ipfs) → Grievance filed
Admin → assignGrievance(id, resolver) → Assigned to resolver
Resolver → updateGrievanceStatus(id, status) → Status updated
Resolver → resolveGrievance(id, resolution) → Resolved
```

### EHR Flow

```
Admin → authorizeDoctor(address) → Doctor authorized
Patient → uploadRecord(did, ipfs, type) → Record uploaded
Patient → grantAccess(did, doctor, duration, perms) → Access granted
Doctor → getPatientRecords(did) → View records
Patient → revokeAccess(did, doctor) → Access revoked
```

### SupplyChain Flow

```
Admin → registerFarmer/Vendor(address) → Role granted
Farmer → registerBatch(id, name, ipfs, qty, loc) → Batch created
Owner → transferOwnership(id, newOwner) → Ownership transferred
Owner → updateBatchStatus(id, status) → Status updated
Auditor → conductAudit(id, findings, passed) → Audit recorded
```

### TrafficLog Flow

```
Admin → addTrafficOperator(address) → Operator added
Operator → logTrafficData(loc, level, action, desc...) → Log created
Anyone → getTrafficEntry(id) → View entry
Anyone → getLocationLogs(location) → Get logs by location
Anyone → getEmergencyLogs() → Get emergency logs
```

## 🧩 Common Test Patterns

### Setup Fixture

```javascript
async function deployFixture() {
  const [owner, user1] = await ethers.getSigners();
  const Contract = await ethers.getContractFactory("Contract");
  const contract = await Contract.deploy();
  return { contract, owner, user1 };
}
```

### Test Success Case

```javascript
it("Should perform action successfully", async function () {
  const { contract, user1 } = await loadFixture(deployFixture);

  await expect(contract.connect(user1).method(params))
    .to.emit(contract, "EventName")
    .withArgs(expectedArgs);

  expect(await contract.getter()).to.equal(expectedValue);
});
```

### Test Failure Case

```javascript
it("Should revert with error", async function () {
  const { contract, user1 } = await loadFixture(deployFixture);

  await expect(
    contract.connect(user1).method(invalidParams)
  ).to.be.revertedWith("Error message");
});
```

### Time Manipulation

```javascript
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// Advance time
await time.increase(3600); // 1 hour in seconds

// Get current time
const currentTime = await time.latest();
```

## 📝 Solidity Version

All contracts use: **^0.8.19**

## 🔐 Access Control Roles

| Contract         | Roles                                                         |
| ---------------- | ------------------------------------------------------------- |
| IdentityRegistry | DEFAULT_ADMIN_ROLE, VERIFIER_ROLE                             |
| Voting           | DEFAULT_ADMIN_ROLE, ADMIN_ROLE                                |
| Grievance        | DEFAULT_ADMIN_ROLE, ADMIN_ROLE, RESOLVER_ROLE                 |
| EHRRegistry      | DEFAULT_ADMIN_ROLE, ADMIN_ROLE, DOCTOR_ROLE                   |
| SupplyChain      | DEFAULT_ADMIN_ROLE, FARMER_ROLE, VENDOR_ROLE, AUDITOR_ROLE    |
| TrafficLog       | DEFAULT_ADMIN_ROLE, TRAFFIC_ADMIN_ROLE, TRAFFIC_OPERATOR_ROLE |

## 🎯 Test Coverage Goals

- **Statements**: >95%
- **Branches**: >90%
- **Functions**: >95%
- **Lines**: >95%

## ⚡ Gas Optimization Tips

1. Use `calldata` for read-only parameters
2. Pack storage variables
3. Use `uint256` instead of smaller uints (in most cases)
4. Cache storage variables in memory
5. Use events instead of storing data on-chain
6. Minimize array operations

## 🐛 Debugging Tips

```bash
# Run specific test with console logs
npx hardhat test test/DeFiToken.test.js

# Use console.log in Solidity
import "hardhat/console.sol";
console.log("Debug:", value);

# Check transaction details
const tx = await contract.method();
const receipt = await tx.wait();
console.log("Gas used:", receipt.gasUsed.toString());
```

## 📊 Expected Gas Costs

| Operation         | Estimated Gas |
| ----------------- | ------------- |
| Token mint        | ~50,000       |
| Identity register | ~200,000      |
| Deposit tokens    | ~100,000      |
| Request loan      | ~300,000      |
| Create proposal   | ~400,000      |
| File grievance    | ~300,000      |
| Upload EHR        | ~400,000      |
| Register batch    | ~300,000      |
| Log traffic       | ~200,000      |

## 🔍 Useful Commands

```bash
# Clean build artifacts
npx hardhat clean

# Recompile everything
npx hardhat clean && npx hardhat compile

# List accounts
npx hardhat accounts

# Start local node
npx hardhat node

# Check contract size
npx hardhat size-contracts
```

## 📚 Resources

- [Hardhat Docs](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethers.js Docs](https://docs.ethers.org/)
- [Solidity Docs](https://docs.soliditylang.org/)

## 🎓 Best Practices Checklist

- [ ] All functions have proper access control
- [ ] All state changes emit events
- [ ] Input validation on all external functions
- [ ] Reentrancy guards on value transfers
- [ ] Tests cover success and failure cases
- [ ] Tests include edge cases
- [ ] Gas optimization considered
- [ ] Documentation is up to date

## 🚨 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Coverage >90%
- [ ] Gas costs optimized
- [ ] Security audit completed
- [ ] Testnet deployment successful
- [ ] Documentation complete
- [ ] Emergency pause mechanisms tested
- [ ] Upgrade strategy defined (if applicable)

---

**Need help? Check the detailed test README at `test/README.md` or improvements doc at `IMPROVEMENTS.md`**
