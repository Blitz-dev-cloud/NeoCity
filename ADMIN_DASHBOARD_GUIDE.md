# 🛡️ Admin Dashboard Access Guide

## 🔗 How to Access

### **URL**: `http://localhost:3000/admin`

### **Requirements**:

1. ✅ Frontend running (`npm run dev` in `/frontend`)
2. ✅ Wallet connected (MetaMask or similar)
3. ✅ **Must be the contract deployer address**

---

## 🔐 Admin Address

**Only this address can access the admin dashboard:**

```
0xd48207CE2b338660340f675B3c7dF209eE38ef0d
```

This is hardcoded in the admin page. If this is NOT your wallet address, you'll see:

- ❌ **"Access Denied"** message
- Cannot view or approve identities
- Cannot authorize doctors

---

## ⚡ Real-Time Features (NEW!)

### **Automatic Polling**

- Dashboard fetches new data **every 5 seconds**
- No need to refresh the page manually
- Green pulsing dot indicates active monitoring

### **Live Stats Dashboard**

Shows 3 cards with real-time counts:

| Card                   | Shows                        | Updates  |
| ---------------------- | ---------------------------- | -------- |
| **Pending Approvals**  | Identities awaiting approval | Every 5s |
| **Authorized Doctors** | Doctors approved in system   | Every 5s |
| **Total Identities**   | All registered identities    | Every 5s |

### **Last Update Time**

- Displayed in header: "Last update: HH:MM:SS"
- Confirms data freshness

---

## 📋 Dashboard Tabs

### **1. Pending Approvals**

View all identities with status = PENDING (0)

**Actions:**

- ✅ **Approve** - Sets status to APPROVED (1)
- ❌ **Reject** - Sets status to REJECTED (2)

**Shows:**

- DID (Decentralized Identifier)
- Owner address
- Role (Citizen, Doctor, Government, etc.)
- Registration timestamp

---

### **2. Authorized Doctors**

View all doctors who have been approved

**Shows:**

- Doctor DIDs
- Only shows identities with:
  - Role = DOCTOR (4)
  - Status = APPROVED (1)

**Actions:**

- View doctor details
- See authorization status

---

### **3. All Identities**

Complete list of every registered identity

**Shows:**

- All DIDs regardless of status
- Filter by: Pending, Approved, Rejected
- Role types
- Timestamps

---

## 🔄 How Real-Time Works

### **Event-Based Fetching**

```javascript
// Fetches blockchain events from last 10,000 blocks
IdentityRegistered events → Parse DIDs → Read current status
```

### **Polling Interval**

```javascript
useEffect(() => {
  fetchIdentities(); // Initial fetch

  const interval = setInterval(fetchIdentities, 5000); // Every 5s
  return () => clearInterval(interval);
}, [dependencies]);
```

### **What Gets Updated**

Every 5 seconds, the dashboard:

1. Queries blockchain for `IdentityRegistered` events
2. For each DID found, reads current status from contract
3. Updates pending list, all identities list
4. Recalculates stats cards
5. Updates "Last update" timestamp

---

## 🎯 Typical Workflow

### **Approving a New Doctor**

1. **User Registers** (`/identity`)

   - User selects role: "Doctor"
   - Submits identity with metadata
   - Status = PENDING

2. **Admin Dashboard** (real-time)

   - New pending identity appears within 5 seconds
   - Shows in "Pending Approvals" tab
   - Yellow card count increases

3. **Admin Reviews**

   - Checks DID, owner address, metadata
   - Verifies role = DOCTOR (4)

4. **Admin Approves**

   - Clicks "Approve" button
   - Transaction sent to blockchain
   - Button shows "Sending..." → "Confirming..."
   - Success notification appears

5. **Doctor Authorized** (automatically)
   - Identity status → APPROVED
   - Moves from "Pending" to "Authorized Doctors"
   - Green card count increases
   - Doctor can now be granted EHR access

---

## 🚨 Troubleshooting

### **"Connect Your Wallet" Message**

- Install MetaMask or compatible wallet
- Connect wallet to the site
- Make sure you're on the correct network (Sepolia/local)

### **"Access Denied" Message**

- Your wallet address is NOT the admin address
- Only `0xd48207CE2b338660340f675B3c7dF209eE38ef0d` can access
- **Solution**: Switch to the deployer wallet OR update ADMIN_ADDRESS in code

### **No Pending Identities Showing**

- Wait 5 seconds for auto-refresh
- Check if any identities have been registered at `/identity`
- Verify blockchain connection (check wallet network)

### **"Loading..." Forever**

- Check frontend console for errors (F12)
- Verify contract address is correct in `addresses.ts`
- Make sure blockchain node is running (if local)

---

## 🔧 Configuration

### **Change Admin Address**

Edit `/frontend/src/app/admin/page.tsx`:

```typescript
const ADMIN_ADDRESS = "0xYourNewAdminAddress";
```

### **Change Polling Interval**

Default is 5 seconds. To change:

```typescript
const interval = setInterval(fetchIdentities, 10000); // 10 seconds
```

### **Change Block Range**

Fetches events from last 10,000 blocks. To change:

```typescript
const fromBlock = currentBlock > 20000n ? currentBlock - 20000n : 0n;
```

---

## 📊 Status Values Reference

| Status   | Value | Meaning           | Color     |
| -------- | ----- | ----------------- | --------- |
| PENDING  | 0     | Awaiting approval | 🟡 Yellow |
| APPROVED | 1     | Identity verified | 🟢 Green  |
| REJECTED | 2     | Identity denied   | 🔴 Red    |

## 🏥 Role Values Reference

| Role                | Value | Name                      |
| ------------------- | ----- | ------------------------- |
| CITIZEN             | 0     | Regular citizen           |
| VOTER               | 1     | Voting participant        |
| BUSINESS_OWNER      | 2     | Business owner            |
| GOVERNMENT_OFFICIAL | 3     | Government role           |
| DOCTOR              | 4     | Healthcare provider       |
| FARMER              | 5     | Supply chain farmer       |
| MANUFACTURER        | 6     | Supply chain manufacturer |
| RETAILER            | 7     | Supply chain retailer     |

---

## ✨ New Features Added

✅ **Real-time polling** - Auto-refresh every 5 seconds
✅ **Event-based fetching** - Uses blockchain events for accuracy
✅ **Live stats dashboard** - 3 cards with real-time counts
✅ **Last update indicator** - Shows exact time of last fetch
✅ **Status indicator** - Green pulsing dot shows active monitoring
✅ **Proper transaction handling** - Shows sending/confirming states

---

## 🎉 Quick Start

1. **Start Frontend**

   ```bash
   cd frontend
   npm run dev
   ```

2. **Connect Wallet**

   - Open MetaMask
   - Connect to localhost:3000

3. **Navigate to Admin**

   - Go to `http://localhost:3000/admin`
   - Or click "Admin" in sidebar

4. **Verify Access**

   - Should see admin dashboard
   - Stats cards showing counts
   - Real-time indicator active

5. **Wait for Data**
   - First fetch happens immediately
   - Then every 5 seconds
   - Watch "Last update" time change

---

**Dashboard is now fully real-time! 🚀**
