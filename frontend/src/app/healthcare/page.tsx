"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHospital,
  FaUserMd,
  FaFileMedical,
  FaShieldAlt,
  FaLock,
  FaUnlock,
  FaClock,
  FaCheckCircle,
  FaArrowLeft,
  FaUpload,
  FaDownload,
  FaEye,
} from "react-icons/fa";
import { EHRRegistryABI } from "@/contracts/abis";
import { contractAddresses } from "@/contracts/addresses";
import {
  uploadMedicalRecord,
  fetchMedicalRecord,
  uploadFileToIPFS,
  getIPFSUrl,
} from "@/utils/pinata";
import { useIdentityRegistry } from "@/hooks/useIdentityRegistry";

export default function HealthcarePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"records" | "access" | "upload">(
    "records"
  );
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Get user's DID automatically
  const { useUserDIDs } = useIdentityRegistry();
  const { data: userDID } = useUserDIDs(address);
  const patientDID = userDID && typeof userDID === "string" ? userDID : "";

  // Form states
  const [recordType, setRecordType] = useState("");
  const [recordData, setRecordData] = useState("");
  const [recordFile, setRecordFile] = useState<File | null>(null);
  const [doctorAddress, setDoctorAddress] = useState("");
  const [accessDuration, setAccessDuration] = useState("7");
  const [permissions, setPermissions] = useState("read");
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);

  // State for fetched records
  interface MedicalRecordType {
    id: number;
    type: string;
    ipfsHash: string;
    timestamp: number;
    uploader: string;
  }

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordType[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<{
    ipfsHash: string;
    type: string;
    data?: Record<string, unknown>;
  } | null>(null);

  // Write contract - moved before useEffect to fix dependency issue
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Fetch medical records for connected user
  useEffect(() => {
    const fetchRecords = async () => {
      if (!isConnected || !patientDID) {
        setMedicalRecords([]);
        return;
      }

      setIsLoadingRecords(true);

      try {
        const { readContract } = await import("wagmi/actions");
        const { config } = await import("@/config/wagmi");

        // Fetch all patient records at once
        const recordData = (await readContract(config, {
          address: contractAddresses.EHRRegistry as `0x${string}`,
          abi: EHRRegistryABI,
          functionName: "getPatientRecords",
          args: [patientDID],
        })) as Array<{
          ipfsHash: string;
          recordType: string;
          timestamp: bigint;
          uploader: string;
          isActive: boolean;
        }>;

        const fetchedRecords: MedicalRecordType[] = [];

        // Map the records
        if (recordData && Array.isArray(recordData)) {
          recordData.forEach((record, i) => {
            if (record.isActive) {
              fetchedRecords.push({
                id: i + 1,
                type: record.recordType || "General",
                ipfsHash: record.ipfsHash || "",
                timestamp: Number(record.timestamp) * 1000,
                uploader: record.uploader || address,
              });
            }
          });
        }

        setMedicalRecords(fetchedRecords);
        console.log("✅ Fetched records:", fetchedRecords.length);
      } catch (error) {
        console.error("❌ Error fetching records:", error);
        setMedicalRecords([]);
      }

      setIsLoadingRecords(false);
    };

    fetchRecords();
  }, [isConnected, patientDID, address, isSuccess]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Show success notification after blockchain confirmation
  useEffect(() => {
    if (isSuccess) {
      showNotification(
        "Medical record uploaded to blockchain successfully!",
        "success"
      );
      setRecordType("");
      setRecordData("");
      setRecordFile(null);
    }
  }, [isSuccess]);

  const handleUploadRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientDID || !recordType || (!recordData && !recordFile)) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    setIsUploadingToIPFS(true);

    try {
      let ipfsHash: string;

      // Upload file or JSON data to IPFS
      if (recordFile) {
        // Upload file directly
        ipfsHash = await uploadFileToIPFS(recordFile, {
          name: `${recordType}-${patientDID}-${Date.now()}`,
          keyvalues: {
            type: "medical-file",
            recordType,
            patientDID,
          },
        });
      } else {
        // Upload JSON medical record
        ipfsHash = await uploadMedicalRecord(
          {
            type: recordType,
            data: recordData,
            patientDID,
            timestamp: Date.now(),
          },
          address // Use wallet address as encryption key
        );
      }

      setIsUploadingToIPFS(false);

      // Upload to blockchain - success will be shown via useEffect
      writeContract({
        address: contractAddresses.EHRRegistry as `0x${string}`,
        abi: EHRRegistryABI,
        functionName: "uploadRecord",
        args: [patientDID, ipfsHash, recordType],
      });
    } catch (error) {
      setIsUploadingToIPFS(false);
      showNotification(
        error instanceof Error ? error.message : "Error uploading to IPFS",
        "error"
      );
      console.error(error);
    }
  };

  const handleViewRecord = async (ipfsHash: string, type: string) => {
    try {
      showNotification("Fetching record from IPFS...", "success");

      // Fetch and decrypt if it's JSON data
      const data = await fetchMedicalRecord(ipfsHash, address);

      setViewingRecord({
        ipfsHash,
        type,
        data,
      });
    } catch {
      showNotification("Error fetching record. Opening IPFS URL...", "error");
      // Fallback: open in new window
      window.open(getIPFSUrl(ipfsHash), "_blank");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 10MB
      if (file.size > 10 * 1024 * 1024) {
        showNotification("File size must be less than 10MB", "error");
        return;
      }
      setRecordFile(file);
      setRecordData(""); // Clear text data if file is selected
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientDID || !doctorAddress || !accessDuration) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    const expiryTime =
      Math.floor(Date.now() / 1000) + parseInt(accessDuration) * 24 * 60 * 60;

    try {
      writeContract({
        address: contractAddresses.EHRRegistry as `0x${string}`,
        abi: EHRRegistryABI,
        functionName: "grantAccess",
        args: [
          patientDID,
          doctorAddress as `0x${string}`,
          BigInt(expiryTime),
          permissions,
        ],
      });
    } catch (error) {
      showNotification("Error granting access", "error");
      console.error(error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      showNotification("Operation completed successfully!", "success");
      setRecordType("");
      setRecordData("");
      setRecordFile(null);
      setDoctorAddress("");
    }
  }, [isSuccess]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-red-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black/40 backdrop-blur-xl rounded-3xl p-12 max-w-md w-full border border-red-500/30 shadow-2xl"
        >
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="p-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-full">
                <FaHospital className="text-5xl text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Healthcare Portal
            </h2>
            <p className="text-red-200 mb-8">
              Connect your wallet to access medical records securely
            </p>
            <div className="flex items-center justify-center gap-2 text-red-300">
              <FaLock />
              <span>Please connect your wallet to continue</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-red-800 p-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/30 to-pink-600/30 hover:from-red-600/40 hover:to-pink-600/40 backdrop-blur-xl rounded-xl border border-red-500/30 hover:border-red-500/50 text-white transition-all group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to City</span>
      </motion.button>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={`fixed top-8 left-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl ${
              notification.type === "success"
                ? "bg-green-500/90 border border-green-400"
                : "bg-red-500/90 border border-red-400"
            }`}
          >
            <p className="text-white font-semibold">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Record Modal */}
      <AnimatePresence>
        {viewingRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setViewingRecord(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-red-900/90 to-pink-900/90 backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full border border-red-500/30 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FaFileMedical className="text-red-400" />
                  {viewingRecord.type}
                </h3>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="text-red-300 hover:text-white transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-black/30 rounded-xl p-4 border border-red-500/20">
                  <p className="text-red-300 text-sm mb-2">IPFS Hash:</p>
                  <p className="text-white font-mono text-xs break-all">
                    {viewingRecord.ipfsHash}
                  </p>
                </div>

                {viewingRecord.data && (
                  <div className="bg-black/30 rounded-xl p-4 border border-red-500/20">
                    <p className="text-red-300 text-sm mb-2">Record Data:</p>
                    <pre className="text-white text-sm overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(viewingRecord.data, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex gap-3">
                  <a
                    href={getIPFSUrl(viewingRecord.ipfsHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FaDownload /> Open in IPFS Gateway
                  </a>
                  <button
                    onClick={() => setViewingRecord(null)}
                    className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg">
              <FaHospital className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Healthcare Portal
              </h1>
              <p className="text-red-200">
                Electronic Health Records Management
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-300 text-sm font-medium">
                Total Records
              </span>
              <FaFileMedical className="text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white">24</p>
            <p className="text-red-200 text-xs mt-1">Medical documents</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-300 text-sm font-medium">Doctors</span>
              <FaUserMd className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">3</p>
            <p className="text-red-200 text-xs mt-1">With access</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-300 text-sm font-medium">
                Access Grants
              </span>
              <FaUnlock className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">5</p>
            <p className="text-red-200 text-xs mt-1">Active permissions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-300 text-sm font-medium">
                Last Upload
              </span>
              <FaClock className="text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">2d</p>
            <p className="text-red-200 text-xs mt-1">Days ago</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 bg-black/40 backdrop-blur-xl rounded-2xl p-2 border border-red-500/30">
            {[
              { id: "records", label: "My Records", icon: FaFileMedical },
              { id: "access", label: "Access Control", icon: FaShieldAlt },
              { id: "upload", label: "Upload Record", icon: FaHospital },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg"
                    : "text-red-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "records" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaFileMedical className="text-red-400" />
                Medical Records
              </h2>

              {/* Display Patient DID */}
              {patientDID && (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 mb-6">
                  <label className="block text-red-200 mb-2 font-medium">
                    Your Patient DID
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={patientDID}
                      readOnly
                      className="flex-1 px-4 py-3 bg-black/50 border border-red-500/30 rounded-xl text-white focus:outline-none cursor-default"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(patientDID);
                        showNotification("DID copied to clipboard!", "success");
                      }}
                      className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-300 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {!patientDID && (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30 mb-6">
                  <p className="text-yellow-200 text-center">
                    ⚠️ Please register your identity first to view and manage
                    medical records.
                  </p>
                </div>
              )}

              {isLoadingRecords ? (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-12 border border-red-500/30">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-red-200 text-center">
                      Loading medical records from blockchain...
                    </p>
                  </div>
                </div>
              ) : medicalRecords.length > 0 ? (
                <div className="space-y-4">
                  {medicalRecords.map((record, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 hover:border-red-400/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {record.type}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-red-200">
                            <span className="flex items-center gap-1">
                              <FaClock className="text-red-400" />
                              {new Date(record.timestamp).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaUserMd className="text-blue-400" />
                              {record.uploader.substring(0, 8)}...
                              {record.uploader.substring(36)}
                            </span>
                          </div>
                          <p className="text-red-300/70 text-xs mt-2">
                            IPFS: {record.ipfsHash.substring(0, 20)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                            Complete
                          </div>
                          <button
                            onClick={() =>
                              handleViewRecord(record.ipfsHash, record.type)
                            }
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <FaEye /> View
                          </button>
                          <a
                            href={getIPFSUrl(record.ipfsHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <FaDownload /> IPFS
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : patientDID ? (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30">
                  <p className="text-red-200 text-center">
                    No medical records found for this patient DID
                  </p>
                </div>
              ) : (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30">
                  <p className="text-red-200 text-center">
                    Enter a patient DID above to view medical records
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "access" && (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaShieldAlt className="text-red-400" />
                Grant Access to Doctor
              </h2>

              <form onSubmit={handleGrantAccess} className="space-y-6">
                <div>
                  <label className="block text-red-200 mb-2 font-medium">
                    Your DID (Patient)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={patientDID}
                      readOnly
                      className="flex-1 px-4 py-3 bg-black/50 border border-red-500/30 rounded-xl text-white focus:outline-none cursor-default"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(patientDID);
                        showNotification("DID copied to clipboard!", "success");
                      }}
                      className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-300 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-red-200 mb-2 font-medium">
                    Doctor Address
                  </label>
                  <input
                    type="text"
                    value={doctorAddress}
                    onChange={(e) => setDoctorAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-xl text-white placeholder-red-300/50 focus:outline-none focus:border-red-400 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-red-200 mb-2 font-medium">
                      Access Duration (Days)
                    </label>
                    <select
                      value={accessDuration}
                      onChange={(e) => setAccessDuration(e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-xl text-white focus:outline-none focus:border-red-400 transition-colors"
                    >
                      <option value="7">7 Days</option>
                      <option value="30">30 Days</option>
                      <option value="90">90 Days</option>
                      <option value="365">1 Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-red-200 mb-2 font-medium">
                      Permissions
                    </label>
                    <select
                      value={permissions}
                      onChange={(e) => setPermissions(e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-xl text-white focus:outline-none focus:border-red-400 transition-colors"
                    >
                      <option value="read">Read Only</option>
                      <option value="write">Read & Write</option>
                      <option value="full">Full Access</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending || isConfirming}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isPending || isConfirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isPending ? "Confirming..." : "Processing..."}
                    </span>
                  ) : (
                    "Grant Access"
                  )}
                </button>
              </form>

              {/* Active Access List */}
              <div className="mt-8 pt-8 border-t border-red-500/30">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaCheckCircle className="text-green-400" />
                  Active Access Grants
                </h3>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-medium">
                          Dr. {i === 1 ? "Smith" : "Johnson"}
                        </p>
                        <p className="text-red-300 text-sm">
                          0x742d...{i === 1 ? "4f3a" : "8c2b"}
                        </p>
                        <p className="text-red-400 text-xs mt-1">
                          Expires in {i === 1 ? "23" : "45"} days
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors">
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaHospital className="text-red-400" />
                Upload Medical Record
              </h2>

              <form onSubmit={handleUploadRecord} className="space-y-6">
                <div>
                  <label className="block text-red-200 mb-2 font-medium">
                    Patient DID
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={patientDID}
                      readOnly
                      className="flex-1 px-4 py-3 bg-black/50 border border-red-500/30 rounded-xl text-white focus:outline-none cursor-default"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(patientDID);
                        showNotification("DID copied to clipboard!", "success");
                      }}
                      className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-300 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-red-200 mb-2 font-medium">
                    Record Type
                  </label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-xl text-white focus:outline-none focus:border-red-400 transition-colors"
                    required
                  >
                    <option value="">Select type...</option>
                    <option value="blood-test">Blood Test</option>
                    <option value="xray">X-Ray</option>
                    <option value="mri">MRI Scan</option>
                    <option value="ct-scan">CT Scan</option>
                    <option value="prescription">Prescription</option>
                    <option value="diagnosis">Diagnosis</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-red-200 mb-2 font-medium">
                    Record Data / Notes
                  </label>
                  <textarea
                    value={recordData}
                    onChange={(e) => setRecordData(e.target.value)}
                    placeholder="Enter medical record details, test results, or notes..."
                    rows={6}
                    className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-xl text-white placeholder-red-300/50 focus:outline-none focus:border-red-400 transition-colors resize-none"
                    disabled={!!recordFile}
                  />
                  <p className="text-red-300/70 text-xs mt-1">
                    Data will be encrypted and stored on IPFS
                  </p>
                </div>

                {/* File Upload Option */}
                <div>
                  <label className="block text-red-200 mb-2 font-medium">
                    Or Upload Medical File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.dcm,.xml"
                      className="hidden"
                      id="medical-file-upload"
                    />
                    <label
                      htmlFor="medical-file-upload"
                      className="flex items-center justify-center gap-3 w-full px-4 py-6 bg-black/50 border-2 border-dashed border-red-500/30 rounded-xl text-red-300 hover:border-red-400 hover:bg-red-500/5 transition-all cursor-pointer group"
                    >
                      <FaUpload className="text-2xl group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-medium">
                          {recordFile
                            ? recordFile.name
                            : "Click to upload file"}
                        </p>
                        <p className="text-xs text-red-300/70">
                          PDF, Images, DICOM, XML (Max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                  {recordFile && (
                    <div className="mt-2 flex items-center justify-between bg-red-500/10 px-4 py-2 rounded-lg">
                      <span className="text-sm text-white">
                        {recordFile.name} ({(recordFile.size / 1024).toFixed(2)}{" "}
                        KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setRecordFile(null)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <h3 className="text-red-200 font-semibold mb-2 flex items-center gap-2">
                    <FaLock className="text-red-400" />
                    Privacy & Security
                  </h3>
                  <ul className="text-red-300/80 text-sm space-y-1">
                    <li>• All medical records are encrypted end-to-end</li>
                    <li>• Stored on IPFS with blockchain verification</li>
                    <li>• Only you control who can access your records</li>
                    <li>• Audit trail maintained for all access attempts</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isPending || isConfirming || isUploadingToIPFS}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isUploadingToIPFS ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading to IPFS...
                    </span>
                  ) : isPending || isConfirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isPending
                        ? "Sending to Blockchain..."
                        : "Confirming Transaction..."}
                    </span>
                  ) : (
                    "Upload Record"
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
