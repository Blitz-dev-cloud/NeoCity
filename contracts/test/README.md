# NeoCity Smart Contracts - Test Suite

Comprehensive test suite for the decentralized smart city platform.

## 📋 Test Coverage

### Contracts Tested

1. **DeFiToken.test.js** - ERC20 token with pause functionality
2. **IdentityRegistry.test.js** - Decentralized identity management
3. **DeFiBank.test.js** - DeFi banking with deposits and loans
4. **Voting.test.js** - Commit-reveal voting system
5. **Grievance.test.js** - Citizen grievance management
6. **EHRRegistry.test.js** - Healthcare records registry
7. **SupplyChain.test.js** - Product traceability system
8. **TrafficLog.test.js** - Traffic management logging

## 🚀 Running Tests

### Run All Tests

```bash
npx hardhat test
```

### Run Specific Test File

```bash
npx hardhat test test/DeFiToken.test.js
npx hardhat test test/IdentityRegistry.test.js
npx hardhat test test/DeFiBank.test.js
npx hardhat test test/Voting.test.js
npx hardhat test test/Grievance.test.js
npx hardhat test test/EHRRegistry.test.js
npx hardhat test test/SupplyChain.test.js
npx hardhat test test/TrafficLog.test.js
```

### Run with Gas Report

```bash
REPORT_GAS=true npx hardhat test
```

### Run with Coverage

```bash
npx hardhat coverage
```

## 📊 Test Structure

Each test file follows this structure:

```javascript
describe("ContractName", function () {
  // Deployment fixture for consistent test setup
  async function deployFixture() { ... }

  describe("Feature Group", function () {
    it("Should do something specific", async function () {
      // Test implementation
    });
  });
});
```

## 🧪 Test Categories

### 1. DeFiToken Tests (40 tests)

- ✅ Deployment verification
- ✅ Minting functionality
- ✅ Burning mechanism
- ✅ Pause/Unpause controls
- ✅ Transfer operations
- ✅ Access control

### 2. IdentityRegistry Tests (35 tests)

- ✅ Identity registration
- ✅ Identity updates
- ✅ Identity revocation
- ✅ Verifiable credentials
- ✅ Role-based access
- ✅ ZK-proof placeholder

### 3. DeFiBank Tests (50+ tests)

- ✅ Deposit management
- ✅ Withdrawal operations
- ✅ Loan requests
- ✅ Loan approvals
- ✅ Loan repayments
- ✅ Interest calculations
- ✅ Collateral management

### 4. Voting Tests (45 tests)

- ✅ Proposal creation
- ✅ Commit-reveal voting
- ✅ Vote tallying
- ✅ Proposal execution
- ✅ Time-based restrictions
- ✅ DID-based authentication

### 5. Grievance Tests (40 tests)

- ✅ Filing grievances
- ✅ Assignment to resolvers
- ✅ Status updates
- ✅ Resolution tracking
- ✅ Access control
- ✅ IPFS integration

### 6. EHRRegistry Tests (45 tests)

- ✅ Doctor authorization
- ✅ Record uploads
- ✅ Access management
- ✅ Time-based access
- ✅ Patient privacy
- ✅ Medical record retrieval

### 7. SupplyChain Tests (50+ tests)

- ✅ Batch registration
- ✅ Ownership transfers
- ✅ Status updates
- ✅ Location tracking
- ✅ Audit trails
- ✅ Role management

### 8. TrafficLog Tests (45 tests)

- ✅ Traffic logging
- ✅ Operator management
- ✅ Emergency handling
- ✅ Location-based queries
- ✅ Time-range queries
- ✅ Congestion levels

## 🔧 Key Testing Patterns

### Fixture Pattern

```javascript
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

async function deployFixture() {
  // Setup contracts and test data
  return { contracts, accounts, data };
}

// In test
const { contract } = await loadFixture(deployFixture);
```

### Event Testing

```javascript
await expect(contract.method())
  .to.emit(contract, "EventName")
  .withArgs(arg1, arg2, timestamp);
```

### Revert Testing

```javascript
await expect(contract.method()).to.be.revertedWith("Error message");

await expect(contract.method()).to.be.revertedWithCustomError(
  contract,
  "ErrorName"
);
```

### Time Manipulation

```javascript
const { time } = require("@nomicfoundation/hardhat-network-helpers");

await time.increase(3600); // Advance 1 hour
const latest = await time.latest(); // Get current block timestamp
```

## 📈 Expected Test Results

All tests should pass with the following approximate gas usage:

- **DeFiToken**: ~2-5M gas for minting
- **IdentityRegistry**: ~200-500K gas per identity
- **DeFiBank**: ~300K-1M gas per operation
- **Voting**: ~400K-800K gas per proposal
- **Grievance**: ~300-600K gas per filing
- **EHRRegistry**: ~400-700K gas per record
- **SupplyChain**: ~300-600K gas per batch
- **TrafficLog**: ~200-400K gas per log

## 🛠️ Troubleshooting

### Common Issues

1. **"Insufficient funds" error**

   - Ensure test accounts have enough tokens
   - Check allowances before transfers

2. **Time-related test failures**

   - Use `time.increase()` consistently
   - Account for block timestamp differences

3. **Access control errors**

   - Verify roles are granted correctly
   - Check function caller in tests

4. **Revert message mismatches**
   - Ensure exact error message strings
   - Use custom errors where appropriate

## 📝 Adding New Tests

When adding new tests:

1. Create test file: `test/NewContract.test.js`
2. Import required dependencies
3. Create deployment fixture
4. Organize tests by feature
5. Test both success and failure cases
6. Include edge cases
7. Document complex scenarios

Example template:

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("NewContract", function () {
  async function deployFixture() {
    const [owner, user1] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("NewContract");
    const contract = await Contract.deploy();
    return { contract, owner, user1 };
  }

  describe("Feature", function () {
    it("Should work correctly", async function () {
      const { contract } = await loadFixture(deployFixture);
      // Test implementation
    });
  });
});
```

## 🔐 Security Testing

Tests cover:

- ✅ Access control (onlyOwner, role-based)
- ✅ Reentrancy protection
- ✅ Input validation
- ✅ State consistency
- ✅ Event emissions
- ✅ Edge cases and boundary conditions

## 📊 Test Metrics

- **Total Test Cases**: ~350+
- **Expected Pass Rate**: 100%
- **Average Execution Time**: ~30-60 seconds
- **Code Coverage Target**: >90%

## 🤝 Contributing

When contributing tests:

1. Follow existing test patterns
2. Maintain clear test descriptions
3. Test both positive and negative cases
4. Include comments for complex logic
5. Ensure tests are deterministic
6. Use appropriate assertions

## 📚 Resources

- [Hardhat Testing](https://hardhat.org/tutorial/testing-contracts)
- [Chai Matchers](https://ethereum-waffle.readthedocs.io/en/latest/matchers.html)
- [OpenZeppelin Test Helpers](https://docs.openzeppelin.com/test-helpers)
- [Ethers.js Documentation](https://docs.ethers.org/)

## ⚡ Performance Tips

- Use fixtures to avoid redundant deployments
- Minimize blockchain interactions in loops
- Use `skip()` for temporarily disabled tests
- Run specific test files during development
- Use parallel execution when possible

---

**Note**: Always run the complete test suite before committing changes to ensure no regressions.
