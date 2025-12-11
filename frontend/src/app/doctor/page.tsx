"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaUserMd,
  FaFileMedical,
  FaEye,
  FaArrowLeft,
  FaLock,
  FaUnlock,
  FaClock,
  FaDownload,
} from "react-icons/fa";
import { EHRRegistryABI } from "@/contracts/abis";
import { contractAddresses } from "@/contracts/addresses";
import { fetchMedicalRecord, getIPFSUrl } from "@/utils/pinata";

export default function DoctorDashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"patients" | "upload">("patients");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Write contract
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Form states
  const [patientDID, setPatientDID] = useState("");
  const [recordType, setRecordType] = useState("");
  const [recordData, setRecordData] = useState("");

  // State for patient records
  interface AccessGrant {
    patientDID: string;
    expiryTime: number;
    permissions: string;
  }

  interface MedicalRecord {
    ipfsHash: string;
    uploader: string;
    timestamp: number;
    recordType: string;
  }

  const [grantedAccess, setGrantedAccess] = useState<AccessGrant[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<{
    ipfsHash: string;
    type: string;
    data?: Record<string, unknown>;
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Show success notification after blockchain confirmation
  useEffect(() => {
    if (isSuccess) {
      showNotification("Medical record uploaded successfully!", "success");
      setPatientDID("");
      setRecordType("");
      setRecordData("");
    }
  }, [isSuccess]);

  // Fetch patient records when selected
  useEffect(() => {
    const fetchRecords = async () => {
      if (!selectedPatient || !isConnected) {
        setPatientRecords([]);
        return;
      }

      setIsLoadingRecords(true);

      try {
        const { readContract } = await import("wagmi/actions");
        const { config } = await import("@/config/wagmi");

        const records = (await readContract(config, {
          address: contractAddresses.EHRRegistry as `0x${string}`,
          abi: EHRRegistryABI,
          functionName: "getPatientRecords",
          args: [selectedPatient],
        })) as MedicalRecord[];

        setPatientRecords(records);
        setIsLoadingRecords(false);
      } catch (error) {
        console.error("Error fetching records:", error);
        showNotification(
          "Failed to fetch patient records. You may not have access.",
          "error"
        );
        setIsLoadingRecords(false);
      }
    };

    fetchRecords();
  }, [selectedPatient, isConnected]);

  const handleUploadRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientDID || !recordType || !recordData) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    try {
      // In a real implementation, you'd upload to IPFS first
      const dummyIpfsHash = `ipfs://doctor-record-${Date.now()}`;

      writeContract({
        address: contractAddresses.EHRRegistry as `0x${string}`,
        abi: EHRRegistryABI,
        functionName: "uploadRecord",
        args: [patientDID, dummyIpfsHash, recordType],
      });
    } catch (error) {
      console.error("Upload failed:", error);
      showNotification("Failed to upload record. Please try again.", "error");
    }
  };

  const handleViewRecord = async (ipfsHash: string, recordType: string) => {
    try {
      showNotification("Fetching medical record from IPFS...", "success");
      const data = (await fetchMedicalRecord(ipfsHash)) as Record<
        string,
        unknown
      >;

      setViewingRecord({
        ipfsHash,
        type: recordType,
        data,
      });
    } catch {
      showNotification("Error fetching record. Opening IPFS URL...", "error");
      window.open(getIPFSUrl(ipfsHash), "_blank");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-blue-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl border-2 border-blue-500/30 p-8 text-center shadow-2xl"
        >
          <FaUserMd className="w-24 h-24 text-blue-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Doctor Dashboard
          </h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to access patient records.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all"
          >
            Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-blue-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <FaArrowLeft /> Back to Home
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
              <FaUserMd className="w-12 h-12 text-blue-500 relative" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                Doctor Dashboard
              </h1>
              <p className="text-gray-400">
                View and manage patient medical records
              </p>
            </div>
          </div>
        </motion.div>

        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border-2 ${
              notification.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {[
            { id: "patients", label: "My Patients", icon: <FaFileMedical /> },
            { id: "upload", label: "Upload Record", icon: <FaUserMd /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "patients" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaUnlock className="text-green-400" />
                Patients with Granted Access
              </h2>

              {grantedAccess.length === 0 ? (
                <div className="text-center py-8">
                  <FaLock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No patient access granted yet</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Patients need to grant you access to view their records
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {grantedAccess.map((access) => (
                    <button
                      key={access.patientDID}
                      onClick={() => setSelectedPatient(access.patientDID)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        selectedPatient === access.patientDID
                          ? "bg-blue-500/20 border-2 border-blue-400"
                          : "bg-gray-800/50 border-2 border-transparent hover:border-blue-500/30"
                      }`}
                    >
                      <p className="text-white font-mono text-sm truncate mb-1">
                        {access.patientDID}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <FaClock className="text-yellow-400" />
                        <span className="text-gray-400">
                          Expires:{" "}
                          {new Date(
                            access.expiryTime * 1000
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        {access.permissions}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Patient Records */}
            <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaFileMedical className="text-blue-400" />
                Medical Records
                {selectedPatient && (
                  <span className="text-sm text-gray-400 font-normal ml-auto">
                    {patientRecords.length} records
                  </span>
                )}
              </h2>

              {!selectedPatient ? (
                <div className="text-center py-12">
                  <FaEye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Select a patient to view records
                  </p>
                </div>
              ) : isLoadingRecords ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading patient records...</p>
                </div>
              ) : patientRecords.length === 0 ? (
                <div className="text-center py-12">
                  <FaFileMedical className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No medical records found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientRecords.map((record, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/10 hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold mb-2">
                            {record.recordType}
                          </span>
                          <p className="text-gray-400 text-sm">
                            Uploaded:{" "}
                            {new Date(
                              record.timestamp * 1000
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            By: {record.uploader.slice(0, 6)}...
                            {record.uploader.slice(-4)}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleViewRecord(record.ipfsHash, record.recordType)
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                        >
                          <FaDownload />
                          View
                        </button>
                      </div>
                      <p className="text-gray-500 text-xs font-mono truncate">
                        IPFS: {record.ipfsHash}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaFileMedical className="text-blue-400" />
              Upload Medical Record
            </h2>

            <form onSubmit={handleUploadRecord} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Patient DID
                </label>
                <input
                  type="text"
                  value={patientDID}
                  onChange={(e) => setPatientDID(e.target.value)}
                  placeholder="did:neo:patient123..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Record Type
                </label>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select type...</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Diagnosis">Diagnosis</option>
                  <option value="Treatment Plan">Treatment Plan</option>
                  <option value="Progress Notes">Progress Notes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Record Data / Notes
                </label>
                <textarea
                  value={recordData}
                  onChange={(e) => setRecordData(e.target.value)}
                  placeholder="Enter medical record details..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || isConfirming}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending || isConfirming ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isPending
                      ? "Sending to Blockchain..."
                      : "Confirming Transaction..."}
                  </>
                ) : (
                  <>
                    <FaFileMedical />
                    Upload Record
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Record Viewer Modal */}
        {viewingRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setViewingRecord(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gray-900 rounded-2xl border-2 border-blue-500/30 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-blue-400">
                  {viewingRecord.type}
                </h3>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <pre className="bg-gray-800 rounded-xl p-4 overflow-x-auto text-sm text-gray-300">
                {JSON.stringify(viewingRecord.data, null, 2)}
              </pre>
              <a
                href={getIPFSUrl(viewingRecord.ipfsHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
              >
                <FaDownload />
                View on IPFS
              </a>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
