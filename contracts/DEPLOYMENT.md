# NeoCity Smart Contracts - Deployment Guide

## Local Deployment on Hardhat Node

This guide will help you deploy and interact with the NeoCity smart contracts on a local Hardhat node.

## Prerequisites

- Node.js installed
- All dependencies installed (`npm install`)
- Contracts compiled successfully

## Quick Start

### Step 1: Start Hardhat Node

Open a terminal and start the local Hardhat node:

```bash
npx hardhat node
```

This will:
- Start a local blockchain at `http://127.0.0.1:8545/`
- Create 20 test accounts with 10,000 ETH each
- Display account addresses and private keys
- Keep running in the foreground (don't close this terminal)

**Keep this terminal open!** The node must keep running for your contracts to work.

### Step 2: Deploy Contracts

Open a **new terminal** (keep the node running) and deploy the contracts:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will:
- Deploy all 8 smart contracts
- Display deployment addresses
- Save addresses to `deployments.json`

Expected output:
```
Starting deployment of NeoCity Smart Contracts...

1. Deploying DeFiToken...
✅ DeFiToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

2. Deploying IdentityRegistry...
✅ IdentityRegistry deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

... (more contracts)

✅ Deployment addresses saved to deployments.json
🎉 All contracts deployed successfully!
```

### Step 3: Setup Test Data (Optional)

Initialize contracts with sample data for testing:

```bash
npx hardhat run scripts/setup-local.js --network localhost
```

This will:
- Distribute tokens to test accounts
- Register test identities
- Setup roles (doctors, resolvers, operators)
- Create sample transactions

### Step 4: Run Interactive Demo (Optional)

See a live demo of the DeFi banking features:

```bash
npx hardhat run scripts/interact.js --network localhost
```

## Deployment Architecture

### Deployment Order

The contracts are deployed in this specific order due to dependencies:

1. **DeFiToken** (Independent)
2. **IdentityRegistry** (Independent)
3. **DeFiBank** (Requires: Token, IdentityRegistry)
4. **Voting** (Requires: IdentityRegistry)
5. **Grievance** (Requires: IdentityRegistry)
6. **EHRRegistry** (Requires: IdentityRegistry)
7. **SupplyChain** (Independent)
8. **TrafficLog** (Independent)

### Contract Addresses

After deployment, addresses are saved in `deployments.json`:

```json
{
  "network": "localhost",
  "chainId": "31337",
  "deployer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "timestamp": "2024-10-17T...",
  "contracts": {
    "DeFiToken": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "IdentityRegistry": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "DeFiBank": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    "Voting": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    "Grievance": "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    "EHRRegistry": "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    "SupplyChain": "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    "TrafficLog": "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
  }
}
```

## Interacting with Contracts

### Method 1: Using Hardhat Console

Start the console connected to your local node:

```bash
npx hardhat console --network localhost
```

Then interact with contracts:

```javascript
// Load deployment info
const fs = require('fs');
const deployment = JSON.parse(fs.readFileSync('deployments.json', 'utf8'));

// Get contract instance
const Token = await ethers.getContractFactory('DeFiToken');
const token = Token.attach(deployment.contracts.DeFiToken);

// Check balance
const [owner] = await ethers.getSigners();
const balance = await token.balanceOf(owner.address);
console.log('Balance:', ethers.formatEther(balance), 'NCT');

// Transfer tokens
const [, user1] = await ethers.getSigners();
await token.transfer(user1.address, ethers.parseEther('100'));
```

### Method 2: Using Scripts

Create custom scripts in the `scripts/` folder and run them:

```bash
npx hardhat run scripts/your-script.js --network localhost
```

### Method 3: Using Frontend

Connect your frontend application to the local node:

```javascript
// In your DApp
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const signer = provider.getSigner();

// Load contract
const tokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // From deployments.json
const token = new ethers.Contract(tokenAddress, TokenABI, signer);

// Interact
const balance = await token.balanceOf(address);
```

## Test Accounts

Hardhat provides 20 test accounts. Here are the first few:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Deployer)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Account #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
...
```

Each account has **10,000 ETH** for testing.

## Environment Configuration

### Network Settings

The local network configuration is in `hardhat.config.js`:

```javascript
networks: {
  localhost: {
    url: "http://127.0.0.1:8545",
    chainId: 31337
  }
}
```

### Using Environment Variables (Optional)

Create a `.env` file for custom settings:

```env
# Local Node
LOCAL_RPC_URL=http://127.0.0.1:8545
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Contract Settings
INITIAL_TOKEN_SUPPLY=1000000
MAX_TOKEN_SUPPLY=10000000
```

## Common Operations

### Restart Deployment

To redeploy (e.g., after code changes):

1. Stop Hardhat node (Ctrl+C)
2. Restart: `npx hardhat node`
3. Deploy again: `npx hardhat run scripts/deploy.js --network localhost`

### Check Deployment Status

View deployed contracts:

```bash
cat deployments.json
```

Or on Windows PowerShell:

```powershell
Get-Content deployments.json
```

### Reset Local Blockchain

The Hardhat node resets automatically when you restart it. All contracts and transactions will be cleared.

## Troubleshooting

### Issue: "Error: could not detect network"

**Solution**: Make sure Hardhat node is running in another terminal.

```bash
# Terminal 1
npx hardhat node

# Terminal 2 (after node is running)
npx hardhat run scripts/deploy.js --network localhost
```

### Issue: "Error: nonce has already been used"

**Solution**: Restart the Hardhat node to reset the blockchain state.

### Issue: "Error: insufficient funds"

**Solution**: Use one of the test accounts provided by Hardhat node, each has 10,000 ETH.

### Issue: Contracts not found after restart

**Solution**: The local blockchain resets when you restart the node. You need to redeploy:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

## Next Steps

### 1. Testing

Run the complete test suite:

```bash
npx hardhat test --network localhost
```

### 2. Gas Estimation

Check gas costs:

```bash
npx hardhat test --network localhost
# Gas reporter is enabled in hardhat.config.js
```

### 3. Contract Verification

For mainnet/testnet deployment, use Etherscan verification:

```bash
npx hardhat verify --network <network-name> <contract-address> <constructor-args>
```

### 4. Frontend Integration

Use the addresses from `deployments.json` in your frontend:

```javascript
import deployments from './deployments.json';
const tokenAddress = deployments.contracts.DeFiToken;
```

## Production Deployment

For testnet or mainnet deployment:

1. Update `hardhat.config.js` with network details
2. Add private keys to `.env` (never commit!)
3. Get testnet ETH from faucets
4. Deploy: `npx hardhat run scripts/deploy.js --network <network-name>`
5. Verify contracts on Etherscan

⚠️ **Security Warning**: Never commit private keys or `.env` files to version control!

## Additional Resources

- **Contract Documentation**: See `QUICK_REFERENCE.md`
- **Test Documentation**: See `TEST_SUMMARY.md`
- **Security Best Practices**: See `IMPROVEMENTS.md`
- **Hardhat Documentation**: https://hardhat.org/docs

## Support

For issues or questions:
1. Check the test files in `test/` for usage examples
2. Review contract source code in `contracts/`
3. Consult Hardhat documentation
4. Check OpenZeppelin documentation for inherited contracts

---

**Happy Deploying! 🚀**
