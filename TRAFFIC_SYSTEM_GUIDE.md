# Traffic System Run & Test Guide

This guide explains how to run the NeoCity Traffic System and verify the new congestion control algorithm.

## Prerequisites

- Node.js installed
- Metamask or similar wallet configured for Localhost (Chain ID: 31337)

## 1. Start the Local Blockchain

Open a terminal in the root `d:\NeoCity` directory:

```bash
npx hardhat node
```

Keep this terminal running. It will display the accounts and private keys.

## 2. Deploy Contracts

Open a **new** terminal in `d:\NeoCity`:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will deploy the `TrafficLog` contract (and others) and update the `frontend/src/contracts/addresses.ts` and `abis.ts` files automatically.

## 3. Start the Frontend

In the same terminal (or a new one), navigate to the frontend directory:

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 4. Testing the Traffic System

1.  **Navigate to Traffic Dashboard**: Go to [http://localhost:3000/traffic](http://localhost:3000/traffic).
2.  **Connect Wallet**: Connect your wallet (use one of the Hardhat accounts).
3.  **Register a Vehicle**:
    - Click "Register Vehicle".
    - Enter a Model (e.g., "CyberTruck").
    - Confirm the transaction.
4.  **Simulate Traffic**:
    - The dashboard shows the current congestion level (Low, Medium, High, Critical).
    - You can manually update your vehicle's location to different zones to simulate movement.
    - The system automatically calculates congestion based on the number of vehicles in a zone.

## 5. Verifying the Congestion Algorithm

The new algorithm (documented in `docs/TRAFFIC_CONGESTION_ALGORITHM.md`) features:

- **Adaptive Thresholds**: Congestion levels change based on vehicle count relative to capacity.
- **Emergency Priority**: Emergency vehicles trigger immediate green lights.
- **Anti-Oscillation**: Traffic light durations adjust gradually to prevent rapid switching.

### Test Scenarios

- **Normal Flow**: Register 1-5 vehicles in a zone. Status should be "Low".
- **Congestion**: Register 20+ vehicles in a zone. Status should shift to "High" or "Critical".
- **Recovery**: Move vehicles out of the zone. The status should return to "Low" and traffic light durations should normalize.

## Troubleshooting

- **"Internal JSON-RPC error"**: Reset your Metamask account (Settings > Advanced > Clear activity tab data) to fix nonce issues after a restart.
- **Frontend Errors**: Ensure you are on the correct network (Localhost 8545).
