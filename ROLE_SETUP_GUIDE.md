# NeoCity Role-Based Access Setup Guide

## 🎯 Overview

NeoCity uses role-based access control for certain features. This guide explains how doctors and supply chain participants are set up.

## 👨‍⚕️ Healthcare System (EHR)

### How Doctors Are Authorized:

1. **Admin Role**: The contract deployer (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`) has ADMIN_ROLE
2. **Authorize Doctors**: Admin can call `authorizeDoctor(doctorAddress)` to grant DOCTOR_ROLE
3. **Access Records**: Doctors must be granted access by patients via `grantAccess(patientDID, doctorAddress, duration, permissions)`

### Currently Authorized Doctors:

- `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Deployer)
- `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (User 1)

### Why Records Don't Display:

The issue is that `getPatientRecords()` has the modifier `onlyPatientOrAuthorizedDoctor`, which means:

1. **If you're the patient**: You need to be calling it with the same address that owns the DID
2. **If you're a doctor**: You need BOTH:
   - DOCTOR_ROLE (granted by admin)
   - Access granted by the patient (via `grantAccess`)

**Solution**: The contract needs to allow patients to view their own records without needing to grant themselves access.

## 📦 Supply Chain System

### How Farmers/Vendors Are Registered:

1. **Admin Role**: Contract deployer has DEFAULT_ADMIN_ROLE
2. **Register Farmers**: Admin calls `registerFarmer(farmerAddress)` to grant FARMER_ROLE
3. **Register Vendors**: Admin calls `registerVendor(vendorAddress)` to grant VENDOR_ROLE

### Currently Registered:

**Farmers:**

- `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Deployer)
- `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` (User 2)

**Vendors:**

- `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (User 1)

### Why "Too Much Gas" Error:

This happens when:

1. You're not authorized (no FARMER_ROLE or VENDOR_ROLE)
2. The transaction reverts, but shows as "out of gas"

**Solution**: Use one of the authorized addresses above, or have admin grant you the role.

## 🔧 How to Use Your Local Hardhat Account

### Import Hardhat Test Account to MetaMask:

1. When you run `npx hardhat node`, it shows 20 test accounts with their private keys
2. Copy the **first account's private key**:
   ```
   Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. In MetaMask:
   - Click account icon → "Add account or hardware wallet" → "Import account"
   - Paste the private key
   - This account has 10,000 ETH and ALL ROLES!

## 🛠️ Scripts Available

### Setup Roles (Already Run):

```bash
npx hardhat run scripts/setup-roles.js --network localhost
```

This grants:

- DOCTOR_ROLE to deployer and User1
- FARMER_ROLE to deployer and User2
- VENDOR_ROLE to User1

### Check Your Roles:

Create a script to check if you have the required roles before attempting transactions.

## 🐛 Current Issues & Fixes Needed

### 1. ✅ FIXED: Supply Chain Gas Error

**Cause**: User didn't have FARMER_ROLE or VENDOR_ROLE  
**Fix**: Run `setup-roles.js` script (completed)

### 2. ⚠️ TODO: EHR Records Not Displaying

**Cause**: `getPatientRecords()` requires patient to grant access to themselves  
**Fix**: Need to modify the contract or frontend to handle patient self-access

### 3. ⚠️ TODO: Frontend Role Check

**Cause**: No UI indication when user lacks required roles  
**Fix**: Add role checking before showing "Create Batch" or "Upload Record" buttons

## 💡 Recommended Next Steps

1. **Import Hardhat Account #0** to MetaMask (has all roles)
2. **Test with authorized account** to verify everything works
3. **Fix EHR contract** to allow patients to view own records without self-granting access
4. **Add role indicators** in UI to show which roles user has
5. **Add "Request Role" buttons** in dashboards for users to request FARMER/VENDOR/DOCTOR roles from admin

## 📝 Notes

- Hardhat node must be running for roles to persist
- Restarting Hardhat node RESETS all roles - must run setup-roles.js again
- Each network (Hardhat, Sepolia) has separate role assignments
