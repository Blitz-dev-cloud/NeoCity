# NeoCity Token Access Guide

## Quick Navigation

### 🪙 Token Faucet (For Everyone)

**How to Access:**

1. Open the NeoCity app at http://localhost:3000
2. Look at the **left sidebar**
3. Click on **"Token Faucet"** (3rd item from top)
4. OR directly visit: http://localhost:3000/faucet

**What You Get:**

- 1,000 NEO tokens per claim
- Free for all users
- 24-hour cooldown between claims

**Visual Location:**

```
Sidebar Menu:
├── 📊 Dashboard
├── 🏦 DeFi Banking
├── 💰 Token Faucet     ← CLICK HERE (All Users)
├── 🔒 Token Vault      ← Owner Only
├── 🗳️ Voting
├── 🆔 Identity
└── ...
```

---

### 🔒 Token Vault (Owner Only)

**How to Access:**

1. Open the NeoCity app at http://localhost:3000
2. Look at the **left sidebar**
3. Click on **"Token Vault"** (4th item from top)
4. OR directly visit: http://localhost:3000/vault

**What You Get:**

- Unlimited token minting (up to max supply)
- Only accessible to contract owner
- Quick amount buttons (1K, 10K, 100K, 1M)

**For Non-Owners:**

- If you're not the owner, you'll see an "Access Denied" page
- The page will show a button to go to the Token Faucet instead

**Visual Location:**

```
Sidebar Menu:
├── 📊 Dashboard
├── 🏦 DeFi Banking
├── 💰 Token Faucet     ← For Everyone
├── 🔒 Token Vault      ← OWNER ONLY (Click here if you're the owner)
├── 🗳️ Voting
├── 🆔 Identity
└── ...
```

---

## Smart Navigation Features

### If You're the Contract Owner:

- **On Faucet Page**: You'll see a yellow banner at the top saying "Contract Owner Detected" with a button "Go to Vault →"
- Click that button to quickly jump to the Token Vault for unlimited minting

### If You're NOT the Owner:

- **On Vault Page**: You'll see "Access Denied" with two buttons:
  - **"Go to Token Faucet"** (green) ← Click this to claim free tokens
  - **"Return to Dashboard"** (gray) ← Go back to home

---

## Step-by-Step: Getting Your First Tokens

### For Regular Users:

1. **Connect Wallet** (top right corner)
2. **Click "Token Faucet"** in the sidebar (💰 icon)
3. **Click "Claim 1,000 NEO"** button
4. **Approve** the transaction in MetaMask
5. **Done!** Tokens will appear in your wallet
6. **Wait 24 hours** before claiming again

### For Contract Owner:

**Option 1: Use Faucet (1,000 NEO)**

- Same steps as regular users above
- Good for testing small amounts

**Option 2: Use Vault (Unlimited)**

1. **Click "Token Vault"** in the sidebar (🔒 icon)
2. **Enter recipient address** (can be your own address)
3. **Enter amount** (or click quick buttons: 1K, 10K, 100K, 1M)
4. **Click "Mint Tokens"**
5. **Approve** transaction
6. **Done!** No cooldown, mint as many times as needed

---

## URL Quick Reference

| Feature          | URL                           | Who Can Access |
| ---------------- | ----------------------------- | -------------- |
| **Token Faucet** | http://localhost:3000/faucet  | Everyone       |
| **Token Vault**  | http://localhost:3000/vault   | Owner Only     |
| **DeFi Banking** | http://localhost:3000/banking | Everyone       |
| **Dashboard**    | http://localhost:3000         | Everyone       |

---

## Troubleshooting

### "I can't find the Token Faucet"

- Check the **left sidebar** (it's the 3rd item)
- Icon: 💰 (coins)
- Text: "Token Faucet"
- If sidebar is collapsed, click the hamburger menu (☰)

### "Token Vault shows Access Denied"

- This is normal if you're not the contract owner
- Click the **green "Go to Token Faucet"** button
- You can claim 1,000 NEO every 24 hours there

### "I'm the owner but can't access Vault"

- Make sure you're connected with the owner wallet
- Owner address: `0xd48207CE2b338660340f675B3c7dF209eE38ef0d`
- Check your wallet address matches exactly

### "Sidebar doesn't show Token Faucet"

- Refresh the page (Ctrl+R or Cmd+R)
- Clear browser cache if issue persists
- Make sure frontend is running: `npm run dev` in frontend folder

---

## Gas Fee Optimization

If minting is expensive (0.03 ETH+):

1. **Use Hardhat local** instead of Sepolia (free gas)
2. **Wait for low network activity** (late night UTC)
3. **Mint larger amounts** less frequently
4. **Set custom gas limit**: ~50,000 for mint transactions

See `TOKEN_DISTRIBUTION.md` for full gas optimization guide.

---

## Summary

✅ **Everyone**: Use **Token Faucet** in sidebar → 1,000 NEO every 24h  
✅ **Owner Only**: Use **Token Vault** in sidebar → Unlimited minting  
✅ **Lost?**: Yellow/Green banners will guide you to the right page  
✅ **Need Help?**: Check the sidebar - both links are clearly labeled

---

Last Updated: November 6, 2025
