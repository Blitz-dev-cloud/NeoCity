# Role-Based Identity System Implementation Guide

## Overview

NeoCity now requires **role-based identity verification** with **admin approval** before users can access dashboards like Healthcare, Supply Chain, Marketplace, etc.

---

## 🎯 System Architecture

### Identity Roles

1. **CITIZEN** - Default role, basic access
2. **DOCTOR** - Healthcare providers (access EHRRegistry)
3. **FARMER** - Agricultural producers (create batches in Supply Chain)
4. **RETAILER** - Shop owners (sell items in Marketplace)
5. **MANUFACTURER** - Product manufacturers (Supply Chain)
6. **TRANSPORTER** - Logistics providers (Supply Chain)
7. **GOVERNMENT** - Government officials (admin access)
8. **AUDITOR** - System auditors (audit Supply Chain, etc.)

### Approval Flow

```
User Registers → PENDING → Admin Reviews → APPROVED/REJECTED → Access Granted
```

---

## 📋 Contract Changes

### 1. **IdentityRegistry.sol** (UPDATED ✅)

#### New Features:

- **Enum `IdentityRole`** - 8 role types
- **Enum `ApprovalStatus`** - PENDING, APPROVED, REJECTED
- **Struct `Identity`** - Now includes:
  - `role` - IdentityRole
  - `status` - ApprovalStatus
  - `metadata` - JSON with user info (name, email, documents)
  - `approvedAt` - Approval timestamp
  - `approvedBy` - Admin who approved

#### New Functions:

```solidity
// Register with role
registerIdentity(did, didDocument, role, metadata)

// Admin approval
approveIdentity(did)
rejectIdentity(did, reason)

// Role management
changeRole(did, newRole)
getIdentityRole(did)
getIdentityStatus(did)

// Verification with role check
verifyIdentityWithRole(did, requiredRole)
```

#### Events:

- `IdentityRegistered(did, owner, role, timestamp)`
- `IdentityApproved(did, approver, timestamp)`
- `IdentityRejected(did, approver, reason, timestamp)`
- `RoleChanged(did, oldRole, newRole, timestamp)`

---

### 2. **Marketplace.sol** (NEW CONTRACT ✅)

#### Purpose:

Allow RETAILER role users to list and sell items using NEO tokens.

####Features:

- **List Items**: Retailers list products with price, stock, category
- **Place Orders**: Any approved identity can buy
- **Reviews**: Buyers rate items after delivery
- **Platform Fee**: 2% fee on all sales (configurable)

#### Item Categories:

- FOOD, ELECTRONICS, CLOTHING, HEALTH, AGRICULTURE, SERVICES, OTHER

#### Order Statuses:

- PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, DISPUTED

#### Key Functions:

```solidity
// Retailer functions
listItem(sellerDID, name, description, ipfsHash, price, stock, category)
updateItem(itemId, newPrice, newStock, newDescription, newIpfsHash)
delistItem(itemId)

// Buyer functions
placeOrder(buyerDID, itemId, quantity, shippingInfo)
submitReview(orderId, rating, comment)

// Seller functions
updateOrderStatus(orderId, newStatus)

// Admin functions
authorizeSeller(did) // Verify retailer can sell
setPlatformFee(newFeePercent)
```

#### Payment Flow:

```
Buyer → NEO tokens → Contract (splits) → Seller (98%) + Platform Fee (2%)
```

---

### 3. **EHRRegistry.sol** (UPDATED ✅)

#### Changes:

- **Doctor Authorization** now checks for `DOCTOR` role in IdentityRegistry
- New function: `authorizeDoctorWithDID(doctorDID)`
  - Verifies doctor has DOCTOR role
  - Auto-authorizes them

#### Usage:

```solidity
// Admin authorizes doctor
authorizeDoctorWithDID("did:neocity:doctor123")

// Now doctor can upload records, view records, etc.
```

---

### 4. **SupplyChain.sol** (UPDATED - NEEDS FIX)

#### Changes:

- **Batch Creation** requires FARMER, MANUFACTURER, or RETAILER role
- **Transfer** requires recipient to have approved DID
- New field: `ownerDID` in ProductBatch struct

#### Functions Updated:

```solidity
// Now requires DID
registerBatch(did, batchId, productName, ipfsHash, quantity, location)
transferOwnership(batchId, newOwner, newOwnerDID)
```

#### Role Access:

- **FARMER**: Create agricultural batches
- **MANUFACTURER**: Create manufactured goods
- **RETAILER**: Create retail products
- **TRANSPORTER**: Transfer batches
- **AUDITOR**: Conduct audits, recall batches

---

## 🔧 Frontend Changes Needed

### 1. **Identity Dashboard** (`/identity/page.tsx`)

#### Add Registration Form:

```typescript
- Role Selection dropdown
- Name input
- Email input
- Upload proof documents (ID, license, etc.)
- Call: registerIdentity(did, didDocument, role, metadata)
```

#### Add Status Display:

```typescript
// Show user's approval status
- PENDING: "Awaiting admin approval"
- APPROVED: "✅ Verified {role}"
- REJECTED: "❌ Application rejected"
```

#### Admin Panel:

```typescript
// Admin view to approve/reject pending identities
- List pending registrations
- View user metadata, documents
- Approve or Reject buttons
- Call: approveIdentity(did) or rejectIdentity(did, reason)
```

---

### 2. **Healthcare Dashboard** (`/healthcare/page.tsx`)

#### Add Role Check:

```typescript
// Before showing dashboard
const userRole = await identityRegistry.getIdentityRole(userDID);
const isApproved = await identityRegistry.getIdentityStatus(userDID);

if (isApproved !== 2) {
  // 2 = APPROVED
  return <PendingApproval />;
}

// For doctors only
if (userRole === 1) {
  // 1 = DOCTOR
  // Show doctor features
} else {
  // Patient view only
}
```

---

###3. **Marketplace Dashboard** (`/marketplace/page.tsx` - NEW)

#### Structure:

```typescript
// Tabs
- Browse Items (all users)
- My Orders (buyers)
- My Shop (retailers only)
- Admin Panel (admins only)

// Browse Items
- Filter by category
- Search
- View item details
- Add to cart
- Place order (requires approved DID)

// My Shop (Retailer Role Only)
- List new item
- Manage inventory
- View orders
- Update order status
- View reviews

// Order Flow
1. Browse → Select Item → Enter Quantity
2. Approve NEO token spending
3. Place Order (transfers tokens)
4. Seller updates status (Confirmed → Shipped → Delivered)
5. Buyer submits review
```

---

### 4. **Supply Chain Dashboard** (`/supply-chain/page.tsx`)

#### Add Role-Based Features:

```typescript
// Farmer/Manufacturer/Retailer
- Create Batch (requires DID input)
- View My Batches

// Transporter
- View Available Batches
- Accept Transfer

// Auditor
- Audit Batches
- Recall Products
```

---

### 5. **Admin Dashboard** (`/admin/page.tsx` - NEW)

#### Features:

```typescript
// Identity Management
- Pending Approvals List
- Approve/Reject identities
- Change user roles
- Revoke identities

// Marketplace Management
- Authorize/deauthorize sellers
- Set platform fee
- View all orders
- Handle disputes

// Healthcare Management
- Authorize doctors

// System Stats
- Total users by role
- Pending approvals count
- Recent activity
```

---

## 🚀 Deployment Steps

### Step 1: Deploy Updated Contracts

```bash
cd contracts

# 1. Compile
npx hardhat compile

# 2. Deploy IdentityRegistry (updated)
npx hardhat run scripts/deploy.js --network sepolia

# 3. Deploy Marketplace (new)
# Add to deploy.js:
const Marketplace = await ethers.getContractFactory("Marketplace");
const marketplace = await Marketplace.deploy(identityRegistry.address, deFiToken.address);

# 4. Deploy updated EHRRegistry, SupplyChain
# Pass identityRegistry address to constructors
```

### Step 2: Update Frontend

```typescript
// Update contract addresses
frontend / src / contracts / addresses.ts;
export const CONTRACTS = {
  IdentityRegistry: "0x...",
  Marketplace: "0x...",
  // ... rest
};

// Update ABIs
frontend / src / contracts / abis.ts;
import MarketplaceABI from "./Marketplace.json";
export { MarketplaceABI };
```

### Step 3: Create Admin Account

```javascript
// In Hardhat console
const identityRegistry = await ethers.getContractAt(
  "IdentityRegistry",
  "0x..."
);

// Grant admin role to your address
await identityRegistry.grantRole(ADMIN_ROLE, "0xYourAddress");
```

---

## 📱 User Workflows

### New User Registration:

1. User navigates to `/identity`
2. Clicks "Register Identity"
3. Fills form:
   - Choose role (Doctor, Farmer, Retailer, etc.)
   - Enter name, email
   - Upload proof documents (IPFS)
4. Submits → Status: PENDING
5. Admin reviews in admin panel
6. Admin approves → Status: APPROVED
7. User can now access role-specific features

### Doctor Accessing Healthcare:

1. Doctor registers with DOCTOR role
2. Admin approves
3. Admin calls `authorizeDoctorWithDID(doctorDID)`
4. Doctor navigates to `/healthcare`
5. Can now upload records, view patient records

### Retailer Selling Items:

1. Retailer registers with RETAILER role
2. Admin approves
3. Admin calls `marketplace.authorizeSeller(retailerDID)`
4. Retailer navigates to `/marketplace`
5. Goes to "My Shop" tab
6. Lists items with price, stock, images (IPFS)
7. Customers place orders
8. Retailer updates order status
9. Receives 98% of payment in NEO tokens

### Farmer Creating Batch:

1. Farmer registers with FARMER role
2. Admin approves
3. Farmer navigates to `/supply-chain`
4. Creates batch with:
   - Product name (e.g., "Organic Tomatoes")
   - Metadata (IPFS: origin, certifications)
   - Quantity, location
5. Batch appears on blockchain
6. Can transfer to retailers/manufacturers

---

## ⚠️ Security Considerations

### 1. Identity Verification

- **Metadata** should include:
  - Full name
  - Email (verified)
  - Phone number
  - Proof documents (government ID, license)
- **IPFS** for document storage (encrypted)
- **Admin verification** of documents before approval

### 2. Role Enforcement

- All contract functions check `verifyIdentity()` or `verifyIdentityWithRole()`
- Frontend checks role before showing UI
- Smart contracts are final authority (frontend can be bypassed)

### 3. Marketplace Safety

- **Escrow**: Tokens transferred to contract first
- **Dispute Resolution**: Add admin dispute handling
- **Seller Verification**: Admin manually authorizes sellers
- **Review System**: Prevents fake reviews (only verified buyers)

### 4. Supply Chain Integrity

- **Ownership Trail**: Full history tracked
- **Auditor Role**: Independent verification
- **Batch Recall**: Emergency product recalls

---

## 🐛 Known Issues & TODO

### Contract Issues (CRITICAL):

1. ✅ **IdentityRegistry.sol**: Updated with roles and approval
2. ✅ **Marketplace.sol**: Created with full marketplace features
3. ✅ **EHRRegistry.sol**: Updated with doctor role check
4. ❌ **SupplyChain.sol**: File corrupted, needs clean rewrite
   - Copy working version from backup
   - Add `ownerDID` field
   - Add role-based modifiers
   - Update `registerBatch()` and `transferOwnership()`

### Frontend TODO:

1. Create `/admin/page.tsx` - Admin dashboard
2. Create `/marketplace/page.tsx` - Marketplace UI
3. Update `/identity/page.tsx` - Add registration form, approval status
4. Update `/healthcare/page.tsx` - Add role checks
5. Update `/supply-chain/page.tsx` - Add DID parameter to forms
6. Create `Marketplace.json` ABI file
7. Update contract addresses after deployment

### Features TODO:

1. **Email Verification**: Send verification emails
2. **Document Verification**: OCR/AI to verify uploaded IDs
3. **Dispute System**: Marketplace order disputes
4. **Rating System**: Seller reputation scores
5. **Search & Filter**: Advanced marketplace search
6. **Analytics**: Admin dashboard analytics
7. **Notifications**: Alert users when approved/rejected

---

## 📊 Database Schema (Off-chain - Optional)

### Store in PostgreSQL/MongoDB:

```json
{
  "users": {
    "did": "did:neocity:123",
    "wallet": "0x...",
    "email": "user@example.com",
    "phone": "+1234567890",
    "role": "DOCTOR",
    "status": "APPROVED",
    "documents": ["ipfs://Qm...", "ipfs://Qm..."],
    "createdAt": "2024-01-01",
    "approvedAt": "2024-01-02",
    "approvedBy": "0xAdmin..."
  },
  "marketplace_items": {
    "itemId": 1,
    "sellerDID": "did:neocity:seller",
    "name": "Product Name",
    "images": ["ipfs://Qm...", "ipfs://Qm..."],
    "views": 1234,
    "favorites": 56
  },
  "orders": {
    "orderId": 1,
    "buyerDID": "did:neocity:buyer",
    "sellerDID": "did:neocity:seller",
    "status": "SHIPPED",
    "trackingNumber": "ABC123",
    "shippingAddress": "encrypted"
  }
}
```

---

## 🎯 Next Steps (Priority Order)

1. **Fix SupplyChain.sol** - Rewrite clean version with role checks
2. **Deploy Contracts** - Deploy to Sepolia testnet
3. **Create Admin Dashboard** - `/admin/page.tsx`
4. **Update Identity Dashboard** - Add registration form
5. **Create Marketplace UI** - `/marketplace/page.tsx`
6. **Test End-to-End** - Full user workflow
7. **Add Security** - Document verification, encryption
8. **Deploy to Production** - Mainnet deployment

---

## 📚 References

- **IdentityRegistry Contract**: `contracts/contracts/IdentityRegistry.sol`
- **Marketplace Contract**: `contracts/contracts/Marketplace.sol`
- **EHRRegistry Contract**: `contracts/contracts/EHRRegistry.sol`
- **SupplyChain Contract**: `contracts/contracts/SupplyChain.sol` (needs fix)

---

_Last Updated: 2024_
_NeoCity - Role-Based Decentralized Smart City Platform_
