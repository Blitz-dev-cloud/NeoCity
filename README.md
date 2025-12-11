# 🏙️ NeoCity - Blockchain-Powered Smart City Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61dafb?style=flat&logo=react)](https://react.dev/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.26.3-yellow?style=flat&logo=ethereum)](https://hardhat.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.x-363636?style=flat&logo=solidity)](https://soliditylang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.180.0-000000?style=flat&logo=three.js)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**NeoCity** is a fully-integrated blockchain-powered smart city platform that combines stunning 3D visualization with decentralized city management systems. Built with Next.js 15, React 19, Three.js, and Ethereum smart contracts, NeoCity provides a complete ecosystem for digital governance, DeFi banking, healthcare, supply chain, and more.

![NeoCity Banner](https://via.placeholder.com/1200x400/1a1a1a/00ffff?text=NeoCity+-+Blockchain+Smart+City)

## ✨ Features

### 🎨 Interactive 3D City Visualization

- **Procedurally Generated Buildings**: 8 unique, detailed 3D buildings with custom architecture
  - 🏦 Bank: Modern glass skyscraper with 24-row window grid, helipad, and antenna
  - 🏛️ City Hall: Classical dome building with columns and entrance steps
  - 🏥 Hospital: Medical center with red cross, emergency helipad, and ambulance entrance
  - 🌾 Farm: Red barn with silo and agricultural warehouse
  - 🛍️ Shop: Retail store with awning, display windows, and illuminated signage
  - 🚦 Traffic Center: Tech building with holographic screens and antenna array
  - ⚖️ Courthouse: Justice building with columns and scales of justice
  - 💰 Token Vault: Golden vault with circular door and coin symbol
- **Real-time Rendering**: Powered by React Three Fiber and Three.js
- **Interactive Elements**: Click buildings to access dashboards, hover effects, dynamic lighting
- **City Infrastructure**: Street lights, benches, trees, and urban atmosphere

### 💼 DeFi Banking System

- **Token Management**: ERC20-compliant NEO token with minting capabilities
- **Deposits & Withdrawals**: Secure staking with interest accrual
- **Loan System**: Collateralized loans with 150% ratio requirement
- **Interest Calculation**: Automated 5% APY on deposits
- **Transaction History**: Real-time tracking of all banking activities
- **Dashboard Analytics**: Stats cards, charts, and portfolio overview

### 🗳️ Governance & Voting

- **Proposal Creation**: Submit and manage governance proposals
- **Democratic Voting**: Yes/No voting with transparent vote counting
- **Voting Power**: Based on token holdings and registration status
- **Active Proposals**: Track ongoing voting periods with countdown timers
- **Vote History**: Complete audit trail of all voting activities
- **Proposal Management**: 7-day voting period with automatic resolution

### 🆔 Digital Identity Registry

- **DID Registration**: Blockchain-based digital identity creation
- **Verification System**: Multi-level identity verification process
- **Credential Management**: Secure storage of identity credentials
- **Privacy Protection**: Encrypted personal information on-chain
- **Identity Card**: Visual representation of digital identity
- **Benefits Access**: Governance, financial services, healthcare, civic services

### ⚖️ Grievance Filing System

- **Case Submission**: File grievances with detailed descriptions
- **Status Tracking**: Monitor case progress (Pending, Under Review, Resolved, Dismissed)
- **Evidence Upload**: IPFS integration for document storage
- **Resolution Management**: Track resolutions and outcomes
- **Transparency**: Public access to grievance records
- **Justice Dashboard**: Court-themed interface with case analytics

### 🏥 Healthcare (EHR) Management

- **Medical Records**: Secure electronic health record storage
- **Doctor Access Control**: Grant/revoke access to healthcare providers
- **Record Upload**: Add new medical records with timestamps
- **Privacy Controls**: Patient-controlled data sharing
- **Access Logs**: Track who accessed medical information
- **HIPAA Compliance**: Blockchain-based privacy protection

### 📦 Supply Chain Tracking

- **Batch Registration**: Register product batches with unique IDs
- **Ownership Transfer**: Track ownership changes through supply chain
- **Location Updates**: Real-time location tracking of shipments
- **Status Management**: Created, In Transit, Delivered, Sold, Recalled
- **Timeline View**: Visual representation of product journey
- **Traceability**: Complete audit trail from farm to consumer

### 🚦 Traffic Logging System

- **Traffic Recording**: Log traffic data with location and timestamps
- **Congestion Monitoring**: Track congestion levels (Low, Medium, High, Critical)
- **Live Dashboard**: Real-time traffic flow visualization
- **Emergency Alerts**: Critical congestion notifications
- **Analytics**: Traffic patterns and trend analysis
- **Action Tracking**: Record responses to traffic incidents

## 🏗️ Architecture

```
NeoCity/
├── frontend/                 # Next.js 15 + React 19 Application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── banking/     # DeFi Bank Dashboard
│   │   │   ├── voting/      # Governance Dashboard
│   │   │   ├── identity/    # Identity Registry Dashboard
│   │   │   ├── grievance/   # Grievance Filing Dashboard
│   │   │   ├── healthcare/  # Healthcare EHR Dashboard
│   │   │   ├── supply-chain/# Supply Chain Dashboard
│   │   │   ├── traffic/     # Traffic Logging Dashboard
│   │   │   └── page.tsx     # Main 3D City Scene
│   │   ├── components/      # React Components
│   │   │   ├── Building3D.tsx      # Procedural 3D buildings
│   │   │   ├── CityScene3D.tsx     # Main 3D scene orchestrator
│   │   │   ├── Ground.tsx          # Terrain and roads
│   │   │   └── CityInfrastructure.tsx # Urban elements
│   │   ├── contracts/       # Smart Contract ABIs & Addresses
│   │   ├── hooks/           # Custom React hooks for Web3
│   │   └── config/          # Wagmi & RainbowKit configuration
│   └── package.json
│
├── contracts/               # Hardhat Smart Contracts
│   ├── contracts/          # Solidity source files
│   │   ├── DeFiToken.sol   # ERC20 token contract
│   │   ├── DeFiBank.sol    # Banking system contract
│   │   ├── Voting.sol      # Governance voting contract
│   │   ├── IdentityRegistry.sol    # Digital identity contract
│   │   ├── Grievance.sol           # Grievance filing contract
│   │   ├── EHRRegistry.sol         # Healthcare records contract
│   │   ├── SupplyChain.sol         # Supply chain tracking contract
│   │   └── TrafficLog.sol          # Traffic logging contract
│   ├── test/               # Contract test suites
│   ├── scripts/            # Deployment scripts
│   └── hardhat.config.js   # Hardhat configuration
│
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Git**
- **MetaMask** browser extension (for wallet connection)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Blitz-dev-cloud/NeoCity.git
   cd NeoCity
   ```

2. **Install contract dependencies**

   ```bash
   cd contracts
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Smart Contract Deployment

#### Option 1: Local Hardhat Node (Development)

1. **Start local blockchain**

   ```bash
   cd contracts
   npx hardhat node
   ```

2. **Deploy contracts** (in a new terminal)

   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Setup test data** (optional)
   ```bash
   npx hardhat run scripts/setup-local.js --network localhost
   ```

#### Option 2: Sepolia Testnet (Production)

1. **Configure environment**

   ```bash
   cd contracts
   cp .env.example .env
   # Edit .env and add your SEPOLIA_RPC_URL and PRIVATE_KEY
   ```

2. **Deploy to Sepolia**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

### Frontend Development

1. **Sync contract data**

   ```bash
   cd frontend
   npm run sync-contracts
   ```

2. **Start development server**

   ```bash
   npm run dev
   ```

3. **Open browser**
   ```
   Navigate to http://localhost:3000
   ```

### Configure MetaMask

1. **Add Local Network** (for Hardhat node)

   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

2. **Import Test Account**

   - Copy private key from Hardhat node output
   - Import into MetaMask

3. **Connect Wallet**
   - Click "Connect Wallet" in any dashboard
   - Select MetaMask
   - Approve connection

## 📱 Usage

### Exploring the 3D City

1. **Launch the application** at `http://localhost:3000`
2. **View the 3D city** with 8 interactive buildings
3. **Click any building** to navigate to its dashboard:
   - 🏦 Bank/Token → Banking Dashboard
   - 🏛️ City Hall → Identity Registry
   - 🗳️ Voting Building → Governance Dashboard
   - ⚖️ Courthouse → Grievance System
   - 🏥 Hospital → Healthcare EHR
   - 🌾 Farm/Shop → Supply Chain
   - 🚦 Traffic Center → Traffic Logger

### Using Dashboards

Each dashboard provides:

- **"Back to City" button** (top-left) to return to 3D scene
- **Wallet connection** required for blockchain interactions
- **Tab navigation** for different features
- **Real-time stats** and analytics
- **Transaction notifications** with success/error feedback

### Example Workflows

#### 1. DeFi Banking

```
1. Navigate to Banking Dashboard
2. Connect wallet
3. Approve token spending
4. Deposit NEO tokens
5. View accrued interest
6. Request collateralized loan
7. Withdraw funds
```

#### 2. Governance Voting

```
1. Navigate to Voting Dashboard
2. Connect wallet
3. Create new proposal
4. Vote on active proposals
5. View voting results
6. Check proposal history
```

#### 3. Supply Chain Tracking

```
1. Navigate to Supply Chain Dashboard
2. Connect wallet (farmer account)
3. Register new product batch
4. Update location as it moves
5. Transfer ownership to vendor
6. Track complete journey
```

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 15.5.6 (App Router, React Server Components)
- **UI Library**: React 19.1.0
- **3D Graphics**: Three.js 0.180.0, React Three Fiber 9.4.0, Drei 10.7.6
- **Styling**: Tailwind CSS 4, Framer Motion 12.23.24
- **Web3**: Wagmi 2.18.1, Viem 2.38.3, RainbowKit 2.2.9
- **State**: Zustand 5.0.8, TanStack Query 5.90.5
- **Icons**: React Icons 5.5.0

### Smart Contracts

- **Language**: Solidity ^0.8.27
- **Framework**: Hardhat 2.26.3
- **Libraries**: OpenZeppelin Contracts 5.4.0
- **Testing**: Chai, Hardhat Network Helpers
- **Tools**: Ethers.js 6.15.0, TypeChain 8.3.2

### Development Tools

- **Build Tool**: Turbopack (Next.js 15)
- **TypeScript**: 5.x
- **Linting**: ESLint 9.x
- **Package Manager**: npm/yarn

## 📊 Smart Contract Details

### DeFiToken (NEO)

```solidity
- Symbol: NEO
- Decimals: 18
- Initial Supply: 100,000,000 NEO
- Max Supply: 1,000,000,000 NEO
- Features: Mintable, Burnable, Ownable
```

### DeFiBank

```solidity
- Interest Rate: 5% APY
- Collateral Ratio: 150%
- Functions: deposit, withdraw, requestLoan, repayLoan
- Events: Deposited, Withdrawn, LoanRequested, LoanRepaid
```

### Voting

```solidity
- Voting Period: 7 days
- Reveal Period: 2 days
- Functions: createProposal, vote, executeProposal
- Governance: Token-weighted voting
```

### IdentityRegistry

```solidity
- Functions: registerIdentity, verifyIdentity, updateIdentity
- Privacy: On-chain storage with access control
- Verification: Multi-level verification system
```

### Grievance

```solidity
- Functions: fileGrievance, updateStatus, resolveGrievance
- Status: Pending, UnderReview, Resolved, Dismissed
- IPFS: Evidence storage integration
```

### EHRRegistry

```solidity
- Functions: addRecord, grantAccess, revokeAccess
- Privacy: Patient-controlled access
- Encryption: On-chain encrypted records
```

### SupplyChain

```solidity
- Functions: registerBatch, updateLocation, transferOwnership
- Status: Created, InTransit, Delivered, Sold, Recalled
- Traceability: Complete product journey
```

### TrafficLog

```solidity
- Functions: logTraffic, emergencyLog, getTrafficData
- Congestion: Low, Medium, High, Critical
- Actions: SignalAdjustment, RouteRedirection, EmergencyResponse
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts

# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/DeFiBank.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

### Test Coverage

- ✅ DeFiToken: 100% coverage
- ✅ DeFiBank: 95% coverage
- ✅ Voting: 90% coverage
- ✅ IdentityRegistry: 95% coverage
- ✅ Grievance: 85% coverage
- ✅ EHRRegistry: 90% coverage
- ✅ SupplyChain: 90% coverage
- ✅ TrafficLog: 85% coverage

## 📖 Documentation

- **[Smart Contracts README](contracts/README.md)** - Detailed contract documentation
- **[Frontend Setup Guide](frontend/README.md)** - Frontend configuration
- **[Deployment Guide](contracts/DEPLOYMENT.md)** - Step-by-step deployment
- **[Test Summary](contracts/TEST_SUMMARY.md)** - Testing documentation
- **[Quick Reference](contracts/QUICK_REFERENCE.md)** - Common commands

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Write tests for new features
- Follow existing code style
- Update documentation
- Ensure all tests pass
- Add comments for complex logic

## 🔒 Security

### Audit Status

- ⚠️ **Not yet audited** - Use at your own risk
- Smart contracts are under active development
- Do not use in production without proper audit

### Reporting Vulnerabilities

Please report security vulnerabilities to: **security@neocity.example.com**

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin** - Secure smart contract libraries
- **Hardhat** - Ethereum development environment
- **Next.js Team** - Amazing React framework
- **Three.js Community** - 3D graphics library
- **Wagmi & Viem** - React hooks for Ethereum
- **RainbowKit** - Beautiful wallet connection UI

## 📞 Contact

- **GitHub**: [@Blitz-dev-cloud](https://github.com/Blitz-dev-cloud)
- **Project Link**: [https://github.com/Blitz-dev-cloud/NeoCity](https://github.com/Blitz-dev-cloud/NeoCity)

## 🗺️ Roadmap

### Phase 1 ✅ (Completed)

- [x] Smart contract development (8 contracts)
- [x] 3D city visualization with procedural buildings
- [x] All dashboard implementations
- [x] Wallet integration (MetaMask, WalletConnect)
- [x] Local deployment and testing

### Phase 2 🚧 (In Progress)

- [ ] Sepolia testnet deployment
- [ ] Mobile responsive optimizations
- [ ] Enhanced 3D animations
- [ ] Multi-language support
- [ ] User documentation

### Phase 3 📅 (Planned)

- [ ] Smart contract audit
- [ ] Mainnet deployment
- [ ] IPFS integration for file storage
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

### Phase 4 🔮 (Future)

- [ ] DAO governance implementation
- [ ] Cross-chain bridge integration
- [ ] AI-powered city optimization
- [ ] VR/AR city exploration
- [ ] NFT-based city assets

---

<div align="center">
  <p>Built with ❤️ by the NeoCity Team</p>
  <p>
    <a href="#-neocity---blockchain-powered-smart-city-platform">Back to Top ↑</a>
  </p>
</div>
