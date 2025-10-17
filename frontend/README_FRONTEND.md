# NeoCity Frontend

Modern blockchain-powered smart city management platform built with Next.js 15, Wagmi, and Viem.

## 🚀 Features

- **DeFi Banking**: Deposit, withdraw, and manage loans with NEO tokens
- **Voting System**: Participate in community governance
- **Identity Registry**: Blockchain-based digital identity management
- **Grievance Management**: Submit and track city grievances
- **Healthcare (EHR)**: Electronic health records on blockchain
- **Supply Chain**: Track products and shipments
- **Traffic Management**: Real-time traffic logging

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Smart Contract Integration**: Wagmi + Viem
- **Wallet Connection**: RainbowKit
- **Styling**: Tailwind CSS 4
- **Icons**: React Icons (Font Awesome)
- **TypeScript**: Full type safety

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy contract ABIs (already done)
# ABIs are in src/contracts/

# Start development server
npm run dev
```

## 🔧 Configuration

### 1. Update Wagmi Project ID

Edit `src/config/wagmi.ts` and replace `YOUR_PROJECT_ID` with your WalletConnect Project ID:

```typescript
projectId: "your_actual_project_id_from_walletconnect";
```

Get your Project ID from: https://cloud.walletconnect.com

### 2. Start Hardhat Local Network

In the contracts directory:

```bash
cd ../contracts
npx hardhat node
```

### 3. Deploy Contracts

```bash
cd ../contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Update Contract Addresses

If contracts are redeployed, update addresses in `src/contracts/addresses.ts`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── banking/      # DeFi banking module
│   │   ├── voting/       # Voting module
│   │   ├── identity/     # Identity registry
│   │   └── ...           # Other modules
│   ├── components/       # React components
│   │   ├── Header.tsx    # Top navigation
│   │   ├── Sidebar.tsx   # Side navigation
│   │   └── Providers.tsx # Wagmi/React Query providers
│   ├── config/           # Configuration files
│   │   └── wagmi.ts      # Wagmi configuration
│   ├── contracts/        # Contract ABIs and addresses
│   │   ├── abis.ts       # ABI exports
│   │   ├── addresses.ts  # Contract addresses
│   │   └── *.json        # Contract artifacts
│   └── hooks/            # Custom React hooks
│       ├── useDeFiToken.ts
│       ├── useDeFiBank.ts
│       ├── useIdentityRegistry.ts
│       └── useVoting.ts
```

## 🎯 Usage

### Connecting Wallet

1. Click "Connect Wallet" in the header
2. Select MetaMask or another wallet
3. Make sure you're on Hardhat Local network (Chain ID: 31337)

### Adding Hardhat Network to MetaMask

- **Network Name**: Hardhat Local
- **RPC URL**: http://127.0.0.1:8545
- **Chain ID**: 31337
- **Currency Symbol**: ETH

### Using DeFi Banking

1. Navigate to "DeFi Banking" from sidebar
2. **Deposit**: Approve tokens → Deposit amount
3. **Withdraw**: Enter amount → Withdraw with interest
4. **Loan**: Enter loan amount and collateral (150% minimum)

### Voting

1. Navigate to "Voting"
2. Create proposals or vote on existing ones
3. Verified identities required for voting

### Identity Registration

1. Navigate to "Identity"
2. Fill in your details
3. Wait for admin verification
4. Once verified, access all platform features

## 🔗 Smart Contracts

All contracts deployed on Hardhat Local:

| Contract         | Address                                      |
| ---------------- | -------------------------------------------- |
| DeFiToken        | `0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6` |
| IdentityRegistry | `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318` |
| DeFiBank         | `0x610178dA211FEF7D417bC0e6FeD39F05609AD788` |
| Voting           | `0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e` |
| Grievance        | `0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0` |
| EHRRegistry      | `0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82` |
| SupplyChain      | `0x9A676e781A523b5d0C0e43731313A708CB607508` |
| TrafficLog       | `0x0B306BF915C4d645ff596e518fAf3F9669b97016` |

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📝 Custom Hooks

### useDeFiToken

```typescript
const { useBalance, transfer, approve } = useDeFiToken();
const { data: balance } = useBalance(address);
```

### useDeFiBank

```typescript
const { deposit, withdraw, requestLoan } = useDeFiBank();
await deposit(parseEther("100"));
```

### useIdentityRegistry

```typescript
const { useIsVerified, registerIdentity } = useIdentityRegistry();
const { data: isVerified } = useIsVerified(address);
```

### useVoting

```typescript
const { createProposal, vote } = useVoting();
await createProposal("My Proposal", BigInt(7 * 24 * 60 * 60));
```

## 🎨 Styling

This project uses Tailwind CSS 4 with a dark theme. Key color scheme:

- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Background**: Gray-950 (#030712)

## 🔐 Security

- All contract interactions use Wagmi hooks
- Transaction confirmations handled automatically
- Non-reentrant functions for financial operations
- Pausable contracts for emergency stops

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### "Contract not deployed"

- Make sure Hardhat node is running
- Deploy contracts using deployment script
- Check contract addresses match in `addresses.ts`

### "Transaction failed"

- Ensure you have enough ETH for gas
- Check if you have sufficient token balance
- Verify you've approved tokens for the contract

### "Wrong network"

- Switch to Hardhat Local (Chain ID: 31337)
- Check RPC URL is http://127.0.0.1:8545

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [RainbowKit Documentation](https://www.rainbowkit.com)
- [Hardhat Documentation](https://hardhat.org/docs)

## 🌟 Features Roadmap

- [ ] Real-time event subscriptions
- [ ] Transaction history
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile responsive improvements
- [ ] PWA support
- [ ] Notification system
- [ ] Export data functionality
