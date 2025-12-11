/**
 * Pinata IPFS Integration
 * Upload and retrieve files from IPFS using Pinata API
 */

export interface PinataConfig {
  apiKey: string;
  apiSecret: string;
  jwt: string;
}

export interface UploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface UploadToIPFSOptions {
  name?: string;
  keyvalues?: Record<string, string>;
}

/**
 * Upload JSON data to IPFS via Pinata
 */
export async function uploadJSONToIPFS(
  data: Record<string, unknown> | unknown[],
  options?: UploadToIPFSOptions
): Promise<string> {
  const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

  // Check if we have authentication credentials (either JWT or API Key + Secret)
  if (!pinataJWT && (!pinataApiKey || !pinataSecretKey)) {
    throw new Error(
      "Pinata credentials not configured. Please set either NEXT_PUBLIC_PINATA_JWT or both NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY in .env"
    );
  }

  try {
    const body = {
      pinataContent: data,
      pinataMetadata: {
        name: options?.name || `neocity-data-${Date.now()}`,
        keyvalues: options?.keyvalues || {},
      },
      pinataOptions: {
        cidVersion: 1,
      },
    };

    // Build headers based on available credentials
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (pinataJWT) {
      // Use JWT authentication (recommended)
      headers.Authorization = `Bearer ${pinataJWT}`;
      console.log("🔐 Using Pinata JWT authentication");
    } else if (pinataApiKey && pinataSecretKey) {
      // Use API Key + Secret authentication (legacy)
      headers.pinata_api_key = pinataApiKey;
      headers.pinata_secret_api_key = pinataSecretKey;
      console.log("🔐 Using Pinata API Key + Secret authentication");
    }

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Pinata API Error Response:", error);
      console.error("❌ Full Error Details:", JSON.stringify(error, null, 2));

      // Extract meaningful error message
      let errorMessage = response.statusText;
      if (error.error) {
        errorMessage =
          typeof error.error === "string"
            ? error.error
            : JSON.stringify(error.error);
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(
        `Pinata upload failed (${response.status}): ${errorMessage}`
      );
    }

    const result: UploadResponse = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
}

/**
 * Upload a file to IPFS via Pinata
 */
export async function uploadFileToIPFS(
  file: File,
  options?: UploadToIPFSOptions
): Promise<string> {
  const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

  // Check if we have either JWT or API Key + Secret
  if (!pinataJWT && (!pinataApiKey || !pinataSecretKey)) {
    throw new Error(
      "Pinata not configured. Please set either NEXT_PUBLIC_PINATA_JWT or (NEXT_PUBLIC_PINATA_API_KEY + NEXT_PUBLIC_PINATA_SECRET_KEY) in .env"
    );
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: options?.name || file.name,
      keyvalues: options?.keyvalues || {},
    });
    formData.append("pinataMetadata", metadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", pinataOptions);

    // Build headers conditionally based on available credentials
    const headers: Record<string, string> = {};

    if (pinataJWT) {
      headers.Authorization = `Bearer ${pinataJWT}`;
      console.log("🔐 Using Pinata JWT authentication for file upload");
    } else if (pinataApiKey && pinataSecretKey) {
      headers.pinata_api_key = pinataApiKey;
      headers.pinata_secret_api_key = pinataSecretKey;
      console.log(
        "🔐 Using Pinata API Key + Secret authentication for file upload"
      );
    }

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Pinata File Upload Error:", error);
      throw new Error(
        `Pinata file upload failed (${response.status}): ${
          error.error || error.message || response.statusText
        }`
      );
    }

    const result: UploadResponse = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
}

/**
 * Retrieve data from IPFS via Pinata Gateway
 */
export async function fetchFromIPFS(
  ipfsHash: string
): Promise<Record<string, unknown> | Blob> {
  const pinataGateway =
    process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud";

  try {
    const url = `https://${pinataGateway}/ipfs/${ipfsHash}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    // For binary data (images, PDFs, etc.)
    return await response.blob();
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    throw error;
  }
}

/**
 * Get IPFS URL for a hash
 */
export function getIPFSUrl(ipfsHash: string): string {
  const pinataGateway =
    process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud";
  return `https://${pinataGateway}/ipfs/${ipfsHash}`;
}

/**
 * Encrypt data before uploading to IPFS (basic encryption)
 * For production, use more robust encryption like AES-256-GCM
 */
export function encryptData(
  data: Record<string, unknown>,
  key: string
): string {
  // Simple base64 encoding with a key prefix
  // In production, use proper encryption libraries
  const jsonString = JSON.stringify(data);
  const encoded = btoa(jsonString + `:${key}`);
  return encoded;
}

/**
 * Decrypt data retrieved from IPFS
 */
export function decryptData(
  encryptedData: string,
  key: string
): Record<string, unknown> {
  try {
    const decoded = atob(encryptedData);
    const [jsonString] = decoded.split(`:${key}`);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error decrypting data:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Upload encrypted medical record to IPFS
 */
export async function uploadMedicalRecord(
  recordData: {
    type: string;
    data: string;
    patientDID: string;
    timestamp: number;
  },
  encryptionKey?: string
): Promise<string> {
  const dataToUpload = encryptionKey
    ? {
        encrypted: true,
        data: encryptData(recordData, encryptionKey),
        timestamp: recordData.timestamp,
      }
    : {
        encrypted: false,
        ...recordData,
      };

  return uploadJSONToIPFS(dataToUpload, {
    name: `medical-record-${recordData.patientDID}-${recordData.timestamp}`,
    keyvalues: {
      type: "medical-record",
      recordType: recordData.type,
      patientDID: recordData.patientDID,
    },
  });
}

/**
 * Retrieve and decrypt medical record from IPFS
 */
export async function fetchMedicalRecord(
  ipfsHash: string,
  encryptionKey?: string
): Promise<Record<string, unknown>> {
  const data = await fetchFromIPFS(ipfsHash);

  // Handle blob data
  if (data instanceof Blob) {
    throw new Error("Expected JSON data but received Blob");
  }

  if (data.encrypted && encryptionKey) {
    return decryptData(data.data as string, encryptionKey);
  }

  return data;
}
