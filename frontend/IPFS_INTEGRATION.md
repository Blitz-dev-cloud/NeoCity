# IPFS Integration with Pinata - NeoCity

## Overview

NeoCity now uses **Pinata IPFS** for decentralized storage of medical records, grievances, supply chain data, and traffic predictions. All sensitive data is encrypted before uploading to IPFS.

---

## ✅ Contracts Using IPFS

### 1. **EHRRegistry.sol** (Healthcare)

- **Field**: `ipfsHash` in `MedicalRecord` struct
- **Function**: `uploadRecord(patientDID, ipfsHash, recordType)`
- **Usage**: Store medical records (encrypted JSON or files like PDFs, X-rays, MRI scans)
- **Frontend**: `/healthcare` - Upload medical files or JSON data, view records from IPFS

### 2. **Grievance.sol** (Grievance System)

- **Fields**:
  - `ipfsHash` - Original grievance description
  - `resolutionIpfsHash` - Resolution details
- **Functions**:
  - `fileGrievance(did, title, ipfsHash)`
  - `resolveGrievance(id, resolutionIpfsHash)`
- **Usage**: Store detailed grievance descriptions and resolutions
- **Frontend**: `/grievance` - File grievances with IPFS storage

### 3. **SupplyChain.sol** (Supply Chain)

- **Field**: `metadataHash` in `Batch` struct
- **Function**: `createBatch(batchId, productName, metadataHash, quantity, location)`
- **Usage**: Store product metadata, certifications, origin details
- **Frontend**: `/supply-chain` - Create batches with metadata on IPFS

### 4. **TrafficLog.sol** (Traffic Management)

- **Field**: Uses IPFS for storing prediction data
- **Usage**: Store traffic prediction models and historical data
- **Frontend**: `/traffic` - Store traffic predictions

---

## 🔧 Setup Instructions

### Step 1: Get Pinata Credentials

1. **Create a Pinata Account**

   - Go to https://app.pinata.cloud/
   - Sign up for a free account (1GB free storage)

2. **Generate API Keys**

   - Navigate to **API Keys** section
   - Click **"New Key"**
   - Enable permissions:
     - ✅ `pinFileToIPFS`
     - ✅ `pinJSONToIPFS`
     - ✅ `unpin` (optional)
   - **Important**: Copy the **JWT token** (you won't see it again!)

3. **Optional: Get Dedicated Gateway**
   - Navigate to **Gateways** section
   - Create a dedicated gateway for faster retrieval
   - Use format: `yourgateway.mypinata.cloud`

### Step 2: Configure Environment

1. **Create `.env.local` file** in `frontend/` directory:

```bash
# Copy from .env.local.example
cp .env.local.example .env.local
```

2. **Add your Pinata credentials**:

```env
# Pinata JWT (Required)
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxMjM0NTY3OC05MGFiLWNkZWYtMTIzNC01Njc4OTBhYmNkZWYiLCJlbWFpbCI6InlvdXJlbWFpbEBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJhYmMxMjM0NTY3ODkwIiwic2NvcGVkS2V5U2VjcmV0IjoiZGVmMDk4NzY1NDMyMSIsImlhdCI6MTcwOTg1MjQwMH0.abcdefghijklmnopqrstuvwxyz1234567890

# Optional: Custom Gateway (default: gateway.pinata.cloud)
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
# OR use dedicated gateway:
# NEXT_PUBLIC_PINATA_GATEWAY=yourgateway.mypinata.cloud
```

3. **Restart the development server**:

```bash
cd frontend
npm run dev
```

---

## 📦 Usage Examples

### Healthcare - Upload Medical Record

```typescript
import { uploadMedicalRecord, uploadFileToIPFS } from "@/utils/pinata";

// Upload JSON medical record (encrypted)
const ipfsHash = await uploadMedicalRecord(
  {
    type: "blood-test",
    data: "Test results: Normal, Blood pressure: 120/80",
    patientDID: "did:neocity:patient123",
    timestamp: Date.now(),
  },
  walletAddress
); // Encryption key

// Upload medical file (PDF, X-ray, MRI)
const file = new File([blob], "xray-scan.pdf");
const ipfsHash = await uploadFileToIPFS(file, {
  name: "xray-patient123-2024",
  keyvalues: { type: "medical-file", patientDID: "did:neocity:patient123" },
});

// Store on blockchain
await writeContract({
  address: CONTRACTS.EHRRegistry,
  abi: EHRRegistryABI,
  functionName: "uploadRecord",
  args: [patientDID, ipfsHash, "xray"],
});
```

### Retrieve Medical Record

```typescript
import { fetchMedicalRecord, getIPFSUrl } from "@/utils/pinata";

// Fetch and decrypt JSON record
const record = await fetchMedicalRecord(ipfsHash, walletAddress);

// Get direct IPFS URL
const url = getIPFSUrl(ipfsHash);
// https://gateway.pinata.cloud/ipfs/QmXxx...
```

### Grievance - Upload Description

```typescript
import { uploadJSONToIPFS } from "@/utils/pinata";

const grievanceData = {
  title: "Street light not working",
  description: "Detailed description of the issue...",
  location: "123 Main St",
  timestamp: Date.now(),
};

const ipfsHash = await uploadJSONToIPFS(grievanceData, {
  name: `grievance-${Date.now()}`,
  keyvalues: { type: "grievance", did: userDID },
});

// Store on blockchain
await writeContract({
  address: CONTRACTS.Grievance,
  abi: GrievanceABI,
  functionName: "fileGrievance",
  args: [userDID, title, ipfsHash],
});
```

### Supply Chain - Upload Batch Metadata

```typescript
import { uploadJSONToIPFS } from "@/utils/pinata";

const metadata = {
  product: "Organic Apples",
  origin: "Farm ABC, California",
  certifications: ["USDA Organic", "Fair Trade"],
  harvestDate: "2024-01-15",
  expiryDate: "2024-02-15",
};

const ipfsHash = await uploadJSONToIPFS(metadata, {
  name: `batch-${batchId}`,
  keyvalues: { type: "supply-chain", batchId },
});

// Store on blockchain
await writeContract({
  address: CONTRACTS.SupplyChain,
  abi: SupplyChainABI,
  functionName: "createBatch",
  args: [batchId, productName, ipfsHash, quantity, location],
});
```

---

## 🔐 Security Features

### 1. **Encryption** (Medical Records)

- Medical records are encrypted using wallet address as key
- Basic encryption implemented, upgrade to AES-256-GCM for production
- Only patient and authorized doctors can decrypt

### 2. **Access Control**

- Smart contracts enforce access control
- IPFS hashes are public, but encrypted data is unreadable without key
- Patients control who can access their records

### 3. **File Size Limits**

- Max file size: **10MB** per upload
- Free Pinata tier: **1GB total storage**
- Upgrade for more storage: https://pinata.cloud/pricing

### 4. **Content Verification**

- IPFS uses content-addressing (hash = content fingerprint)
- Tampering changes the hash
- Blockchain stores original hash for verification

---

## 🚀 Features Implemented

### ✅ Healthcare Dashboard (`/healthcare`)

- **Upload Medical Records**:
  - JSON data (notes, test results) - encrypted
  - Files (PDF, images, DICOM) - direct upload
- **View Records**:
  - Fetch from IPFS and decrypt
  - Modal preview for JSON data
  - Direct IPFS gateway link for files
- **File Support**:
  - PDF documents
  - Images (JPG, PNG)
  - DICOM medical images
  - XML files

### 🔄 To Be Implemented

- **Grievance Dashboard** - IPFS upload integration
- **Supply Chain Dashboard** - Metadata upload
- **Traffic Dashboard** - Prediction data storage

---

## 📊 Pinata Dashboard Features

### Monitor Your IPFS Usage

1. **View Pinned Files**

   - https://app.pinata.cloud/pinmanager
   - See all uploaded files, metadata, dates

2. **Analytics**

   - Track storage usage
   - Monitor gateway requests
   - View bandwidth usage

3. **Manage Files**
   - Unpin unused files to free storage
   - Update metadata
   - View file details

---

## 🛠️ Utility Functions

Located in `frontend/src/utils/pinata.ts`:

### Core Functions

- `uploadJSONToIPFS(data, options)` - Upload JSON data
- `uploadFileToIPFS(file, options)` - Upload binary files
- `fetchFromIPFS(ipfsHash)` - Retrieve data from IPFS
- `getIPFSUrl(ipfsHash)` - Get gateway URL

### Healthcare Specific

- `uploadMedicalRecord(recordData, encryptionKey)` - Upload encrypted medical record
- `fetchMedicalRecord(ipfsHash, encryptionKey)` - Retrieve and decrypt record

### Encryption (Basic)

- `encryptData(data, key)` - Encrypt data before upload
- `decryptData(encryptedData, key)` - Decrypt retrieved data
- **⚠️ Production**: Upgrade to AES-256-GCM or use libraries like `crypto-js`

---

## 🔍 Testing

### 1. Test Healthcare Upload

1. Navigate to `/healthcare`
2. Enter your patient DID
3. Select record type (e.g., "Blood Test")
4. Either:
   - Enter text data, OR
   - Upload a file (PDF/image)
5. Click "Upload Record"
6. Check console for IPFS hash
7. Verify on Pinata dashboard

### 2. Test Record Retrieval

1. After upload, view your records
2. Click "View" button on a record
3. Modal should show:
   - IPFS hash
   - Decrypted data (if JSON)
   - "Open in IPFS Gateway" button

### 3. Verify on IPFS

- Open IPFS URL in browser
- Format: `https://gateway.pinata.cloud/ipfs/{hash}`
- Should show your file/data

---

## 📝 Environment Variables

```env
# Required
NEXT_PUBLIC_PINATA_JWT=your_jwt_token

# Optional
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
```

### Where to Find

- **JWT**: Pinata Dashboard → API Keys → Create New Key → Copy JWT
- **Gateway**: Pinata Dashboard → Gateways → Your Gateway Domain

---

## 🐛 Troubleshooting

### Error: "Pinata JWT not configured"

- **Solution**: Add `NEXT_PUBLIC_PINATA_JWT` to `.env.local`
- Restart dev server: `npm run dev`

### Error: "Failed to fetch from IPFS"

- **Check**: Is IPFS hash valid? (starts with `Qm` or `bafy`)
- **Try**: Different gateway (update `NEXT_PUBLIC_PINATA_GATEWAY`)
- **Verify**: File exists on Pinata dashboard

### Error: "File size must be less than 10MB"

- **Solution**: Compress file or split into smaller chunks
- **Upgrade**: Pinata paid plans support larger files

### Upload takes too long

- **Normal**: Large files (5-10MB) may take 10-30 seconds
- **Check**: Network connection
- **Try**: Use dedicated Pinata gateway (faster)

---

## 💡 Best Practices

### 1. **Encrypt Sensitive Data**

```typescript
// Always encrypt medical records
const ipfsHash = await uploadMedicalRecord(data, walletAddress);
```

### 2. **Add Metadata**

```typescript
// Use keyvalues for searchability
await uploadJSONToIPFS(data, {
  name: "descriptive-name",
  keyvalues: {
    type: "medical-record",
    patientDID: "did:neocity:...",
    recordType: "blood-test",
  },
});
```

### 3. **Handle Errors**

```typescript
try {
  const hash = await uploadFileToIPFS(file);
} catch (error) {
  console.error("IPFS upload failed:", error);
  // Fallback or retry logic
}
```

### 4. **Validate Before Upload**

```typescript
// Check file size
if (file.size > 10 * 1024 * 1024) {
  throw new Error("File too large");
}

// Check file type
const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
if (!allowedTypes.includes(file.type)) {
  throw new Error("Invalid file type");
}
```

---

## 🔄 Migration from Mock IPFS

### Before (Mock Hashes)

```typescript
const mockIpfsHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
```

### After (Real Pinata)

```typescript
const ipfsHash = await uploadMedicalRecord(recordData, walletAddress);
```

### Status

- ✅ **Healthcare**: Integrated with Pinata
- ⏳ **Grievance**: Using mock hashes (TODO)
- ⏳ **Supply Chain**: Using mock hashes (TODO)
- ⏳ **Traffic**: Using mock hashes (TODO)

---

## 📚 Resources

- **Pinata Docs**: https://docs.pinata.cloud/
- **IPFS Docs**: https://docs.ipfs.tech/
- **NeoCity GitHub**: Repository link
- **Pinata Pricing**: https://pinata.cloud/pricing

---

## 🎯 Next Steps

1. **Complete Integration**:

   - [ ] Integrate Pinata in Grievance dashboard
   - [ ] Integrate Pinata in Supply Chain dashboard
   - [ ] Integrate Pinata in Traffic dashboard

2. **Security Enhancements**:

   - [ ] Upgrade encryption to AES-256-GCM
   - [ ] Implement key management system
   - [ ] Add file integrity checks

3. **Performance**:

   - [ ] Use dedicated Pinata gateway
   - [ ] Implement caching for frequently accessed files
   - [ ] Add progress indicators for large uploads

4. **Features**:
   - [ ] File preview (images, PDFs) in modal
   - [ ] Batch upload support
   - [ ] Download records as ZIP

---

_Last Updated: January 2024_
_NeoCity - Decentralized Smart City Platform_
