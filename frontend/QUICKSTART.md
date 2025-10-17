# 🚀 NeoCity Frontend - Quick Start Guide

## Prerequisites Checklist

- [x] Node.js installed (v18 or higher)
- [x] MetaMask or another Web3 wallet
- [x] Hardhat local network running
- [x] Smart contracts deployed

## 1. Start Hardhat Network

Open a terminal in the contracts directory:

```bash
cd contracts
npx hardhat node
```

Keep this terminal running. You should see:

- Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
- List of accounts with private keys

## 2. Deploy Smart Contracts

In a new terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

You should see deployment addresses for all 8 contracts.

## 3. Setup Frontend

```bash
cd frontend
npm run setup
```

This script will:

- ✓ Copy contract ABIs from compiled artifacts
- ✓ Update contract addresses
- ✓ Verify all files are in place

## 4. Configure WalletConnect (Optional but Recommended)

1. Go to https://cloud.walletconnect.com
2. Create a free account
3. Create a new project
4. Copy your Project ID
5. Update `src/config/wagmi.ts`:
   ```typescript
   projectId: "your_project_id_here";
   ```

## 5. Add Hardhat Network to MetaMask

1. Open MetaMask
2. Click network dropdown → Add Network
3. Enter these details:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
4. Save

## 6. Import Test Account

Import one of the Hardhat test accounts to MetaMask:

1. Copy a private key from the Hardhat node terminal
2. MetaMask → Account Menu → Import Account
3. Paste private key
4. You should have 10,000 ETH

## 7. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 8. Connect Wallet & Test

1. Click "Connect Wallet" in header
2. Select MetaMask
3. Approve connection
4. Switch to Hardhat Local network if needed

## 🎯 Testing Features

### Test DeFi Banking

1. Navigate to "DeFi Banking"
2. Mint some NEO tokens (if contract has mint function)
3. Approve tokens for DeFiBank contract
4. Deposit an amount
5. Check your balance updates

### Test Identity Registry

1. Navigate to "Identity"
2. Fill in registration form:
   - Name: John Doe
   - DOB: 01/01/1990
   - ID: ABC123
3. Submit registration
4. Status should show "Pending"

### Test Voting

1. Navigate to "Voting"
2. Create a new proposal:
   - Description: "Improve city parks"
   - Duration: 7 days
3. Submit proposal
4. Vote on your own proposal

## 🔧 Troubleshooting

### "Cannot connect to network"

```bash
# Restart Hardhat node
cd contracts
npx hardhat node
```

### "Contract not found"

```bash
# Redeploy contracts
cd contracts
npx hardhat run scripts/deploy.js --network localhost

# Sync frontend
cd ../frontend
npm run sync-contracts
```

### "Transaction failed"

- Make sure you're on Hardhat Local network (31337)
- Check you have ETH for gas
- Verify contract addresses are correct

### "ABIs not found"

```bash
# Recompile contracts
cd contracts
npx hardhat compile

# Sync ABIs
cd ../frontend
npm run sync-contracts
```

## 📱 UI Overview

### Dashboard

- View balances, deposits, proposals
- Quick actions for common tasks
- Identity verification status

### DeFi Banking

- Deposit funds and earn interest
- Withdraw with accumulated interest
- Request loans with collateral

### Voting

- Create governance proposals
- Vote on active proposals
- View proposal history

### Identity

- Register your identity
- View verification status
- Manage personal information

## 🎨 Color Scheme

- **Blue**: Primary actions (deposits, main features)
- **Green**: Success states (verified, deposited)
- **Purple**: Governance (voting)
- **Orange**: Identity & warnings
- **Red**: Errors & critical actions

## 📊 Key Metrics

Monitor these in the dashboard:

- **Wallet Balance**: Your NEO token balance
- **Bank Deposit**: Funds in DeFi Bank
- **Active Proposals**: Number of votes available
- **Identity Status**: Verification state

## 🔄 Restarting from Scratch

If you need to reset everything:

```bash
# 1. Stop Hardhat node (Ctrl+C)

# 2. Clear node cache
cd contracts
rm -rf cache artifacts

# 3. Recompile
npx hardhat compile

# 4. Restart node
npx hardhat node

# 5. In new terminal, redeploy
npx hardhat run scripts/deploy.js --network localhost

# 6. Sync frontend
cd ../frontend
npm run sync-contracts

# 7. Restart frontend
npm run dev
```

## 📝 Important Notes

1. **Test Network Only**: This setup uses Hardhat local network. All data resets when node restarts.

2. **Private Keys**: Never share or commit private keys from test accounts.

3. **Gas**: All transactions require ETH for gas. Test accounts have 10,000 ETH.

4. **Contract State**: Hardhat state is not persistent. Restart = fresh state.

5. **Browser Refresh**: MetaMask may need page refresh after network changes.

## ✅ Success Checklist

After setup, verify:

- [ ] Hardhat node running on port 8545
- [ ] All 8 contracts deployed
- [ ] Frontend running on localhost:3000
- [ ] Wallet connected to Hardhat Local
- [ ] Can see your ETH balance
- [ ] Dashboard loads without errors
- [ ] Can navigate between pages

## 🆘 Need Help?

Check these files for more info:

- `README_FRONTEND.md` - Full documentation
- `contracts/README.md` - Contract documentation
- `src/hooks/` - Hook usage examples

## 🎉 You're Ready!

Your NeoCity smart city platform is now running locally. Explore the features and start building!

---

**Happy Building! 🏙️**
