# NeoCity Token Distribution System

## Overview

NeoCity uses a two-tier token distribution system: a **Token Faucet** for regular users and a **Token Vault** for contract owner minting.

## Token Information

- **Token Name**: DeFiToken (NEO)
- **Contract Address**: `0x9A676e781A523b5d0C0e43731313A708CB607508`
- **Initial Supply**: 100,000,000 NEO
- **Max Supply**: 1,000,000,000 NEO
- **Owner**: `0xd48207CE2b338660340f675B3c7dF209eE38ef0d`

## Distribution Methods

### 1. Token Faucet (For All Users) 🚰

**Location**: http://localhost:3000/faucet (Sidebar: "Token Faucet")

**Features**:

- Claim **1,000 NEO** per request
- **24-hour cooldown** between claims
- Available to **all users**
- Automatic cooldown timer with countdown
- Simple one-click claiming
- Free testnet tokens for ecosystem testing

**How to Use**:

1. Navigate to "Token Faucet" from the sidebar
2. Connect your wallet
3. Click "Claim 1,000 NEO"
4. Approve the transaction in your wallet
5. Wait 24 hours before claiming again

**Use Cases**:

- New users getting started
- Testing DeFi features (deposits, loans)
- Participating in voting
- Any feature requiring NEO tokens

---

### 2. Token Vault (Owner Only) 👑

**Location**: http://localhost:3000/vault (Sidebar: "Token Vault")

**Features**:

- Mint **unlimited** tokens (up to max supply)
- Only accessible to contract owner
- Mint to any address
- Real-time supply tracking
- Quick amount buttons (1K, 10K, 100K, 1M)
- Security warnings and validations
- Dedicated secure interface

**How to Use** (Owner Only):

1. Go to "Token Vault" from the sidebar
2. Enter recipient address
3. Enter amount to mint (or use quick buttons)
4. Click "Mint Tokens"
5. Approve transaction

**Access Requirements**:

- Must be contract owner: `0xd48207CE2b338660340f675B3c7dF209eE38ef0d`
- Non-owners will see "Access Denied" message

**Use Cases**:

- Distributing tokens to partners
- Rewarding users
- Funding liquidity pools
- Emergency token distribution
- Large-scale token allocation

---

## Gas Optimization Tips

### High Gas Fees on Sepolia?

If you're experiencing high gas fees (0.03 ETH or more), try:

1. **Wait for Lower Network Activity**:

   - Check Sepolia gas prices at https://sepolia.etherscan.io/gastracker
   - Mint during off-peak hours (late night/early morning UTC)

2. **Reduce Mint Amount**:

   - Instead of minting 1M tokens, mint 10K or 100K
   - Smaller amounts = lower gas consumption

3. **Batch Minting** (for owners):

   - Mint larger amounts less frequently
   - One 1M mint is cheaper than ten 100K mints

4. **Use Hardhat Local**:

   - For testing, use local Hardhat network (free)
   - Gas fees are negligible on local network

5. **Optimize Wallet Settings**:
   - Set custom gas limit: ~50,000 for mint transactions
   - Use "Slow" priority if not urgent
   - Never use "Aggressive" unless necessary

### Expected Gas Usage:

- **Faucet Claim**: ~45,000 gas
- **Token Mint**: ~45,000 gas
- **Token Transfer**: ~21,000 gas
- **Token Approval**: ~46,000 gas

---

### 3. Owner Initial Supply - 100M NEO 💰

**Initial Distribution**:

- The contract owner received **100,000,000 NEO** at deployment
- Owner can manually transfer tokens using standard ERC20 transfer

**How Owner Can Distribute**:

```javascript
// Using the mint function (recommended for new tokens)
await mint(recipientAddress, parseEther("1000"));

// Or using standard transfer (from initial supply)
await transfer(recipientAddress, parseEther("1000"));
```

---

## Token Use Cases

### Banking Features

- **Deposit**: Requires NEO tokens to earn interest
- **Borrow**: Requires NEO collateral to take loans
- **Repay**: Need NEO to pay back loans
- **Approve**: Must approve tokens before depositing

### Voting Features

- **Create Proposal**: May require token stake (if implemented)
- **Vote**: May require token holding (if implemented)

### Other Features

- **Healthcare**: May require tokens for premium features
- **Supply Chain**: Token payments for shipments
- **Identity**: Token-based verification fees

---

## Quick Start Guide

### For New Users:

1. **Connect Wallet**: Click "Connect Wallet" in header
2. **Get Identity**: Go to Identity page, register with your details
3. **Get Tokens**: Visit Token Faucet, claim 1000 NEO
4. **Start Testing**: Use tokens in Banking, Voting, etc.

### For Contract Owner:

1. **Access Token Vault**: Click "Token Vault" in sidebar
2. **Distribute Tokens**: Mint to any address as needed
3. **Monitor Supply**: Check total supply vs max supply
4. **Use Faucet Too**: Owner can also use faucet like regular users (for testing)

---

## Technical Details

### Smart Contract Functions

**Faucet Implementation**:

```solidity
// Calls the mint function with 1000 NEO
function claim() external {
    mint(msg.sender, 1000 * 10**18);
}
```

**Mint Function**:

```solidity
function mint(address to, uint256 amount) public onlyOwner {
    require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
    _mint(to, amount);
}
```

### Frontend Integration

**Faucet Page** (`/faucet/page.tsx`):

- Uses localStorage to track cooldown per address
- Countdown timer shows remaining wait time (hours, minutes, seconds)
- Success notifications with transaction confirmation
- Standalone page accessible to all users
- Error handling for various failure scenarios

**Token Vault** (`/vault/page.tsx`):

- Owner detection: `address === CONTRACT_OWNER`
- Access control: Non-owners see "Access Denied" page
- Input validation for address and amount
- Transaction status feedback with loading states
- Quick amount buttons for common values
- Real-time supply statistics
- Security warnings and best practices

---

## Security Considerations

### Cooldown System

- **Client-side tracking**: Uses localStorage (can be bypassed)
- **Contract protection**: Actual minting still requires owner signature
- **Recommendation**: Add contract-level cooldown for production

### Owner Privileges

- Only owner can mint tokens
- Owner verification happens on-chain
- Cannot mint beyond max supply
- All mints are public and traceable

### Best Practices

1. Never share private key of owner account
2. Test with small amounts first
3. Verify recipient address before minting
4. Monitor total supply regularly

---

## Troubleshooting

### "Only the contract owner can mint tokens"

- **Cause**: Non-owner trying to access mint function
- **Solution**: Use Token Faucet instead (1000 NEO/day)

### Faucet cooldown not working

- **Cause**: LocalStorage cleared or using different browser
- **Solution**: Wait 24 hours from last claim, or use different address

### Transaction failed

- **Cause**: Insufficient gas, network issues, or invalid parameters
- **Solution**: Check wallet balance, network connection, and input values

### Mint tab not showing

- **Cause**: Connected wallet is not the contract owner
- **Solution**: Normal behavior - mint is owner-only feature

---

## Future Enhancements

### Potential Improvements:

1. **On-chain Cooldown**: Move cooldown tracking to smart contract
2. **Dynamic Amounts**: Adjust faucet amount based on user needs
3. **Staking Rewards**: Earn tokens by staking
4. **Governance**: Token holders vote on faucet parameters
5. **Multi-tier Faucet**: Different amounts based on user level

---

## Summary

| Feature            | Who Can Use | Amount      | Cooldown | Location      |
| ------------------ | ----------- | ----------- | -------- | ------------- |
| **Token Faucet**   | All Users   | 1,000 NEO   | 24 hours | `/faucet`     |
| **Token Vault**    | Owner Only  | Unlimited\* | None     | `/vault`      |
| **Initial Supply** | Owner Only  | 100M NEO    | One-time | At deployment |

\*Up to max supply of 1,000,000,000 NEO

---

## Contact & Support

- **Contract Owner**: `0xd48207CE2b338660340f675B3c7dF209eE38ef0d`
- **Token Contract**: `0x9A676e781A523b5d0C0e43731313A708CB607508`
- **Network**: Hardhat Local (Chain ID: 31337)

For issues or questions, check the console logs or transaction history in your wallet.

---

**Last Updated**: December 2024
**Version**: 1.0.0
