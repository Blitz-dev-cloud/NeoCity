"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrafficLight,
  FaCar,
  FaExclamationTriangle,
  FaChartLine,
  FaMapMarkedAlt,
  FaClock,
  FaCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";
import { TrafficLogABI } from "@/contracts/abis";
import { contractAddresses } from "@/contracts/addresses";
import { uploadJSONToIPFS } from "@/utils/pinata";

enum CongestionLevel {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

enum ActionType {
  None = 0,
  SignalAdjustment = 1,
  RouteRedirection = 2,
  EmergencyResponse = 3,
  MaintenanceScheduled = 4,
}

export default function TrafficPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "log" | "monitor" | "analytics" | "vehicles" | "zones"
  >("vehicles");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form states
  const [location, setLocation] = useState("");
  const [congestionLevel, setCongestionLevel] = useState<CongestionLevel>(
    CongestionLevel.Low
  );
  const [actionTaken, setActionTaken] = useState<ActionType>(ActionType.None);
  const [description, setDescription] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);

  // Vehicle registration states
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState(0); // 0 = Car
  const [isEmergencyVehicle, setIsEmergencyVehicle] = useState(false);

  // State for fetched traffic logs
  interface TrafficLogType {
    id: number;
    location: string;
    operator: string;
    congestion: string;
    action: string;
    predictionData: string;
    notes: string;
    timestamp: number;
  }

  interface VehicleData {
    licensePlate: string;
    vehicleType: string;
    owner: string;
    currentLocation: string;
    lastUpdate: number;
    isActive: boolean;
    isEmergencyVehicle: boolean;
  }

  interface TrafficZoneData {
    zoneName: string;
    vehicleCount: number;
    capacity: number;
    greenLightDuration: number;
    lastUpdate: number;
    hasEmergency: boolean;
    congestion: string;
    utilizationPercent: number;
  }

  const [trafficLogs, setTrafficLogs] = useState<TrafficLogType[]>([]);
  const [myVehicles, setMyVehicles] = useState<VehicleData[]>([]);
  const [allZones, setAllZones] = useState<TrafficZoneData[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);

  const { data: logCount } = useReadContract({
    address: contractAddresses.TrafficLog as `0x${string}`,
    abi: TrafficLogABI,
    functionName: "logCount",
  });

  const { data: totalVehicles } = useReadContract({
    address: contractAddresses.TrafficLog as `0x${string}`,
    abi: TrafficLogABI,
    functionName: "totalVehicles" as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  // Fetch my vehicles when connected
  useEffect(() => {
    const fetchMyVehicles = async () => {
      if (!address) return;

      setIsLoadingVehicles(true);
      try {
        const { readContract } = await import("wagmi/actions");
        const { config } = await import("@/config/wagmi");

        const vehiclePlates = (await readContract(config, {
          address: contractAddresses.TrafficLog as `0x${string}`,
          abi: TrafficLogABI,
          functionName: "getOwnerVehicles" as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          args: [address],
        })) as string[];

        const vehicles: VehicleData[] = [];
        const vehicleTypeMap = [
          "Car",
          "Truck",
          "Bus",
          "Emergency",
          "Motorcycle",
        ];

        for (const plate of vehiclePlates) {
          const vehicleData = (await readContract(config, {
            address: contractAddresses.TrafficLog as `0x${string}`,
            abi: TrafficLogABI,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            functionName: "getVehicle" as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          })) as [number, string, string, bigint, boolean, boolean];

          vehicles.push({
            licensePlate: plate,
            vehicleType: vehicleTypeMap[vehicleData[0]] || "Car",
            owner: vehicleData[1],
            currentLocation: vehicleData[2],
            lastUpdate: Number(vehicleData[3]),
            isActive: vehicleData[4],
            isEmergencyVehicle: vehicleData[5],
          });
        }

        setMyVehicles(vehicles);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchMyVehicles();
  }, [address, totalVehicles]);

  // Fetch all traffic zones
  useEffect(() => {
    const fetchZones = async () => {
      setIsLoadingZones(true);
      try {
        const { readContract } = await import("wagmi/actions");
        const { config } = await import("@/config/wagmi");

        const zoneNames = (await readContract(config, {
          address: contractAddresses.TrafficLog as `0x${string}`,
          abi: TrafficLogABI,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          functionName: "getAllZones" as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        })) as string[];


        const zones: TrafficZoneData[] = [];
        const congestionMap = ["Low", "Medium", "High", "Critical"];

        for (const zoneName of zoneNames) {
          const zoneData = (await readContract(config, {
            address: contractAddresses.TrafficLog as `0x${string}`,
            abi: TrafficLogABI,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            functionName: "getTrafficZone" as any,
            args: [zoneName],
          })) as [bigint, bigint, bigint, bigint, boolean, number];

          const vehicleCount = Number(zoneData[0]);
          const capacity = Number(zoneData[1]);
          const utilizationPercent =
            capacity > 0 ? (vehicleCount * 100) / capacity : 0;

          zones.push({
            zoneName,
            vehicleCount,
            capacity,
            greenLightDuration: Number(zoneData[2]),
            lastUpdate: Number(zoneData[3]),
            hasEmergency: zoneData[4],
            congestion: congestionMap[zoneData[5]] || "Low",
            utilizationPercent,
          });
        }

        setAllZones(zones);
      } catch (error) {
        console.error("Error fetching zones:", error);
      } finally {
        setIsLoadingZones(false);
      }
    };

    fetchZones();
  }, [logCount]); // Refetch when traffic logs change

  // Fetch traffic logs when count changes
  useEffect(() => {
    const fetchLogs = async () => {
      if (!logCount || Number(logCount) === 0) {
        setTrafficLogs([]);
        return;
      }

      setIsLoadingLogs(true);
      const count = Number(logCount);
      const fetchedLogs: TrafficLogType[] = [];

      for (let i = 1; i <= Math.min(count, 20); i++) {
        try {
          const { readContract } = await import("wagmi/actions");
          const { config } = await import("@/config/wagmi");

          const logData = (await readContract(config, {
            address: contractAddresses.TrafficLog as `0x${string}`,
            abi: TrafficLogABI,
            functionName: "getTrafficEntry",
            args: [BigInt(i)],
          })) as [
            string,
            bigint,
            number,
            number,
            `0x${string}`,
            string,
            string,
            boolean
          ];

          const [
            loc,
            timestamp,
            congestionNum,
            actionNum,
            operator,
            notes,
            predictionData,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _isEmergency,
          ] = logData;

          const congestionMap: Record<number, string> = {
            0: "Low",
            1: "Medium",
            2: "High",
            3: "Critical",
          };

          const actionMap: Record<number, string> = {
            0: "None",
            1: "Signal Adjustment",
            2: "Route Redirection",
            3: "Emergency Response",
            4: "Maintenance Scheduled",
          };

          fetchedLogs.push({
            id: i,
            location: loc,
            operator: operator as string,
            congestion: congestionMap[congestionNum] || "Low",
            action: actionMap[actionNum] || "None",
            predictionData,
            notes,
            timestamp: Number(timestamp) * 1000,
          });
        } catch (error) {
          console.error(`Error fetching traffic log ${i}:`, error);
        }
      }

      setTrafficLogs(fetchedLogs);
      setIsLoadingLogs(false);
    };

    fetchLogs();
  }, [logCount]);

  // Write contract
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Show success notification after blockchain confirmation
  useEffect(() => {
    if (isSuccess) {
      showNotification(
        "Traffic data logged successfully on blockchain!",
        "success"
      );
      setLocation("");
      setDescription("");
      setActionTaken(ActionType.None);
      setCongestionLevel(CongestionLevel.Low);
      setIsEmergency(false);
    }
  }, [isSuccess]);

  const handleLogTraffic = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location || !description) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    setIsUploadingToIPFS(true);

    try {
      // Upload traffic prediction data to IPFS
      const predictionData = {
        location,
        congestionLevel,
        actionTaken,
        description,
        timestamp: Date.now(),
        reporter: address,
        isEmergency,
        predictedDuration: Math.floor(Math.random() * 120) + 30, // 30-150 mins
        affectedRoutes: [`Route A from ${location}`, `Route B via ${location}`],
        recommendedAlternatives: ["Highway 101", "Main Street"],
      };

      const ipfsHash = await uploadJSONToIPFS(predictionData, {
        name: `traffic-log-${location}-${Date.now()}`,
        keyvalues: {
          type: "traffic-prediction",
          location,
          congestionLevel: congestionLevel.toString(),
          reporter: address || "",
        },
      });

      setIsUploadingToIPFS(false);
      // REMOVED premature success notification

      // Log to blockchain - success will be shown via useEffect
      writeContract({
        address: contractAddresses.TrafficLog as `0x${string}`,
        abi: TrafficLogABI,
        functionName: "logTrafficData",
        args: [
          location,
          congestionLevel,
          actionTaken,
          description,
          ipfsHash,
          isEmergency,
        ],
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

  useEffect(() => {
    if (isSuccess) {
      showNotification(
        isEmergency
          ? "Emergency logged successfully!"
          : "Traffic data logged successfully!",
        "success"
      );
      setLocation("");
      setDescription("");
      setCongestionLevel(CongestionLevel.Low);
      setActionTaken(ActionType.None);
      setIsEmergency(false);
    }
  }, [isSuccess, isEmergency]);

  // Vehicle registration handler
  const handleRegisterVehicle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!licensePlate) {
      showNotification("Please enter a license plate", "error");
      return;
    }

    try {
      writeContract({
        address: contractAddresses.TrafficLog as `0x${string}`,
        abi: TrafficLogABI,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        functionName: "registerVehicle" as any,
        args: [licensePlate, vehicleType, isEmergencyVehicle],
      });

      // Clear form after submission
      setLicensePlate("");
      setVehicleType(0);
      setIsEmergencyVehicle(false);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Error registering vehicle",
        "error"
      );
      console.error(error);
    }
  };

  // Update vehicle location handler
  const handleUpdateLocation = async (plate: string, newLocation: string) => {
    if (!newLocation) {
      showNotification("Please select a location", "error");
      return;
    }

    try {
      writeContract({
        address: contractAddresses.TrafficLog as `0x${string}`,
        abi: TrafficLogABI,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        functionName: "updateVehicleLocation" as any,
        args: [plate, newLocation],
      });
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Error updating location",
        "error"
      );
      console.error(error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black/40 backdrop-blur-xl rounded-3xl p-12 max-w-md w-full border border-teal-500/30 shadow-2xl"
        >
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="p-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full">
                <FaTrafficLight className="text-5xl text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Traffic Control Center
            </h2>
            <p className="text-teal-200 mb-8">
              Connect your wallet to log traffic data and monitor city flow
            </p>
            <div className="flex items-center justify-center gap-2 text-teal-300">
              <FaCar />
              <span>Please connect your wallet to continue</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-800 p-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600/30 to-cyan-600/30 hover:from-teal-600/40 hover:to-cyan-600/40 backdrop-blur-xl rounded-xl border border-teal-500/30 hover:border-teal-500/50 text-white transition-all group"
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg">
              <FaTrafficLight className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Traffic Control Center
              </h1>
              <p className="text-teal-200">
                Real-time Traffic Monitoring & Management
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
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-teal-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-teal-300 text-sm font-medium">
                Total Vehicles
              </span>
              <FaCar className="text-teal-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {totalVehicles?.toString() || "0"}
            </p>
            <p className="text-teal-200 text-xs mt-1">Registered vehicles</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-teal-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-teal-300 text-sm font-medium">
                Traffic Zones
              </span>
              <FaMapMarkedAlt className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{allZones.length}</p>
            <p className="text-teal-200 text-xs mt-1">Active zones</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-teal-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-teal-300 text-sm font-medium">
                Critical Zones
              </span>
              <FaExclamationTriangle className="text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {allZones.filter((z) => z.congestion === "Critical").length}
            </p>
            <p className="text-teal-200 text-xs mt-1">Needs attention</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-teal-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-teal-300 text-sm font-medium">
                Traffic Logs
              </span>
              <FaChartLine className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {logCount?.toString() || "0"}
            </p>
            <p className="text-teal-200 text-xs mt-1">Total entries</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 bg-black/40 backdrop-blur-xl rounded-2xl p-2 border border-teal-500/30 overflow-x-auto">
            {[
              { id: "vehicles", label: "My Vehicles", icon: FaCar },
              { id: "zones", label: "Traffic Zones", icon: FaMapMarkedAlt },
              { id: "log", label: "Log Traffic", icon: FaTrafficLight },
              { id: "monitor", label: "Live Monitor", icon: FaChartLine },
              { id: "analytics", label: "Analytics", icon: FaCheckCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg"
                    : "text-teal-300 hover:text-white hover:bg-white/10"
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
          {activeTab === "vehicles" && (
            <div className="space-y-6">
              {/* Register Vehicle Form */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-teal-500/30">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaCar className="text-teal-400" />
                  Register New Vehicle
                </h2>

                <form onSubmit={handleRegisterVehicle} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-teal-200 mb-2 font-medium">
                        License Plate
                      </label>
                      <input
                        type="text"
                        value={licensePlate}
                        onChange={(e) =>
                          setLicensePlate(e.target.value.toUpperCase())
                        }
                        placeholder="ABC-1234"
                        className="w-full px-4 py-3 bg-black/50 border border-teal-500/30 rounded-xl text-white placeholder-teal-300/50 focus:outline-none focus:border-teal-400 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-teal-200 mb-2 font-medium">
                        Vehicle Type
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-black/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-400 transition-colors"
                      >
                        <option value={0}>🚗 Car</option>
                        <option value={1}>🚚 Truck</option>
                        <option value={2}>🚌 Bus</option>
                        <option value={3}>🚑 Emergency</option>
                        <option value={4}>🏍️ Motorcycle</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <input
                      type="checkbox"
                      id="emergencyVehicle"
                      checked={isEmergencyVehicle}
                      onChange={(e) => setIsEmergencyVehicle(e.target.checked)}
                      className="w-5 h-5 rounded border-red-500/50 bg-black/50 text-red-500 focus:ring-red-400"
                    />
                    <label
                      htmlFor="emergencyVehicle"
                      className="text-teal-200 flex items-center gap-2 cursor-pointer"
                    >
                      <FaExclamationTriangle className="text-red-400" />
                      <span className="font-medium">Emergency Vehicle</span>
                      <span className="text-teal-300/70 text-sm">
                        (Ambulance, Police, Fire)
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending || isConfirming}
                    className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {isPending || isConfirming ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Registering Vehicle...
                      </span>
                    ) : (
                      "Register Vehicle"
                    )}
                  </button>
                </form>
              </div>

              {/* My Vehicles List */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-teal-500/30">
                <h2 className="text-2xl font-bold text-white mb-6">
                  My Registered Vehicles ({myVehicles.length})
                </h2>

                {isLoadingVehicles ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-teal-200">Loading your vehicles...</p>
                  </div>
                ) : myVehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myVehicles.map((vehicle, i) => (
                      <motion.div
                        key={vehicle.licensePlate}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`bg-gradient-to-br ${
                          vehicle.isEmergencyVehicle
                            ? "from-red-500/20 to-orange-500/20 border-red-500/50"
                            : "from-teal-500/20 to-cyan-500/20 border-teal-500/30"
                        } border rounded-xl p-6`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <FaCar
                                className={
                                  vehicle.isEmergencyVehicle
                                    ? "text-red-400 text-2xl"
                                    : "text-teal-400 text-2xl"
                                }
                              />
                              <h3 className="text-xl font-bold text-white">
                                {vehicle.licensePlate}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-teal-300 text-sm">
                                {vehicle.vehicleType}
                              </span>
                              {vehicle.isEmergencyVehicle && (
                                <span className="px-2 py-1 bg-red-500/30 text-red-300 text-xs rounded-full border border-red-500/50">
                                  EMERGENCY
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <FaMapMarkedAlt className="text-teal-400" />
                            <span className="text-teal-200">
                              {vehicle.currentLocation || "No location set"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FaClock className="text-teal-400" />
                            <span className="text-teal-200">
                              {vehicle.lastUpdate > 0
                                ? new Date(
                                    vehicle.lastUpdate * 1000
                                  ).toLocaleString()
                                : "Never updated"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <select
                            onChange={(e) =>
                              handleUpdateLocation(
                                vehicle.licensePlate,
                                e.target.value
                              )
                            }
                            className="flex-1 px-3 py-2 bg-black/50 border border-teal-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-teal-400"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Update Location...
                            </option>
                            {allZones.map((zone) => (
                              <option key={zone.zoneName} value={zone.zoneName}>
                                {zone.zoneName} ({zone.congestion})
                              </option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaCar className="text-6xl text-teal-500/30 mx-auto mb-4" />
                    <p className="text-teal-200">No vehicles registered yet</p>
                    <p className="text-teal-300/70 text-sm mt-2">
                      Register your first vehicle above to start tracking
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "zones" && (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-teal-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaMapMarkedAlt className="text-teal-400" />
                Live Traffic Zones
              </h2>

              {isLoadingZones ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-teal-200">Loading traffic zones...</p>
                </div>
              ) : allZones.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allZones.map((zone, i) => {
                    const congestionColorMap: Record<string, string> = {
                      Low: "from-green-500/20 to-green-600/20 border-green-500/50",
                      Medium:
                        "from-yellow-500/20 to-yellow-600/20 border-yellow-500/50",
                      High: "from-orange-500/20 to-orange-600/20 border-orange-500/50",
                      Critical:
                        "from-red-500/20 to-red-600/20 border-red-500/50",
                    };

                    return (
                      <motion.div
                        key={zone.zoneName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`bg-gradient-to-br ${
                          congestionColorMap[zone.congestion]
                        } border rounded-xl p-6`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FaMapMarkedAlt className="text-teal-400 text-xl" />
                              <h3 className="text-xl font-bold text-white">
                                {zone.zoneName}
                              </h3>
                            </div>
                            {zone.hasEmergency && (
                              <div className="flex items-center gap-2 mb-2">
                                <FaExclamationTriangle className="text-red-400 animate-pulse" />
                                <span className="text-red-300 font-semibold text-sm">
                                  EMERGENCY VEHICLE IN ZONE
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                zone.congestion === "Critical"
                                  ? "bg-red-500/30 text-red-200"
                                  : zone.congestion === "High"
                                  ? "bg-orange-500/30 text-orange-200"
                                  : zone.congestion === "Medium"
                                  ? "bg-yellow-500/30 text-yellow-200"
                                  : "bg-green-500/30 text-green-200"
                              }`}
                            >
                              {zone.congestion}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-teal-300 text-sm flex items-center gap-2">
                              <FaCar />
                              Vehicles
                            </span>
                            <span className="text-white font-bold">
                              {zone.vehicleCount} / {zone.capacity}
                            </span>
                          </div>

                          <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${zone.utilizationPercent}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className={`h-full ${
                                zone.utilizationPercent >= 90
                                  ? "bg-gradient-to-r from-red-500 to-red-600"
                                  : zone.utilizationPercent >= 70
                                  ? "bg-gradient-to-r from-orange-500 to-orange-600"
                                  : zone.utilizationPercent >= 40
                                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                                  : "bg-gradient-to-r from-green-500 to-green-600"
                              }`}
                            />
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-teal-300">Utilization</span>
                            <span className="text-white font-semibold">
                              {zone.utilizationPercent.toFixed(1)}%
                            </span>
                          </div>

                          <div className="pt-3 border-t border-teal-500/30">
                            <div className="flex items-center justify-between">
                              <span className="text-teal-300 text-sm flex items-center gap-2">
                                <FaTrafficLight />
                                Green Light Duration
                              </span>
                              <span className="text-white font-bold">
                                {zone.greenLightDuration}s
                              </span>
                            </div>
                            <p className="text-teal-200/60 text-xs mt-2">
                              Auto-adjusted based on traffic flow
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaMapMarkedAlt className="text-6xl text-teal-500/30 mx-auto mb-4" />
                  <p className="text-teal-200">No traffic zones available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "log" && (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-teal-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaTrafficLight className="text-teal-400" />
                Log Traffic Data
              </h2>

              <form onSubmit={handleLogTraffic} className="space-y-6">
                <div>
                  <label className="block text-teal-200 mb-2 font-medium">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Main St & 5th Ave"
                    className="w-full px-4 py-3 bg-black/50 border border-teal-500/30 rounded-xl text-white placeholder-teal-300/50 focus:outline-none focus:border-teal-400 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-teal-200 mb-2 font-medium">
                      Congestion Level
                    </label>
                    <select
                      value={congestionLevel}
                      onChange={(e) =>
                        setCongestionLevel(
                          Number(e.target.value) as CongestionLevel
                        )
                      }
                      className="w-full px-4 py-3 bg-black/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-400 transition-colors"
                    >
                      <option value={CongestionLevel.Low}>
                        Low - Smooth Flow
                      </option>
                      <option value={CongestionLevel.Medium}>
                        Medium - Moderate Traffic
                      </option>
                      <option value={CongestionLevel.High}>
                        High - Heavy Traffic
                      </option>
                      <option value={CongestionLevel.Critical}>
                        Critical - Gridlock
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-teal-200 mb-2 font-medium">
                      Action Taken
                    </label>
                    <select
                      value={actionTaken}
                      onChange={(e) =>
                        setActionTaken(Number(e.target.value) as ActionType)
                      }
                      className="w-full px-4 py-3 bg-black/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-400 transition-colors"
                    >
                      <option value={ActionType.None}>None</option>
                      <option value={ActionType.SignalAdjustment}>
                        Signal Adjustment
                      </option>
                      <option value={ActionType.RouteRedirection}>
                        Route Redirection
                      </option>
                      <option value={ActionType.EmergencyResponse}>
                        Emergency Response
                      </option>
                      <option value={ActionType.MaintenanceScheduled}>
                        Maintenance Scheduled
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-teal-200 mb-2 font-medium">
                    Description / Notes
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the traffic situation and any actions taken..."
                    rows={4}
                    className="w-full px-4 py-3 bg-black/50 border border-teal-500/30 rounded-xl text-white placeholder-teal-300/50 focus:outline-none focus:border-teal-400 transition-colors resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl">
                  <input
                    type="checkbox"
                    id="emergency"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="w-5 h-5 rounded border-teal-500/50 bg-black/50 text-teal-500 focus:ring-teal-400"
                  />
                  <label
                    htmlFor="emergency"
                    className="text-teal-200 flex items-center gap-2 cursor-pointer"
                  >
                    <FaExclamationTriangle className="text-red-400" />
                    <span className="font-medium">Mark as Emergency</span>
                    <span className="text-teal-300/70 text-sm">
                      (Accident, road block, or critical situation)
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isPending || isConfirming || isUploadingToIPFS}
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isUploadingToIPFS ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading to IPFS...
                    </span>
                  ) : isPending || isConfirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isPending ? "Confirming..." : "Processing..."}
                    </span>
                  ) : (
                    "Log Traffic Data"
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === "monitor" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaMapMarkedAlt className="text-teal-400" />
                Live Traffic Monitor
              </h2>

              {isLoadingLogs ? (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-12 border border-teal-500/30">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-teal-200 text-center">
                      Loading traffic logs from blockchain...
                    </p>
                  </div>
                </div>
              ) : trafficLogs.length > 0 ? (
                <div className="space-y-4">
                  {trafficLogs.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`bg-black/40 backdrop-blur-xl rounded-2xl p-6 border hover:border-teal-400/50 transition-colors ${
                        log.action === "Emergency Response"
                          ? "border-red-500/50"
                          : "border-teal-500/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FaMapMarkedAlt className="text-teal-400" />
                            <h3 className="text-xl font-bold text-white">
                              {log.location}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-teal-200 mb-3">
                            <span className="flex items-center gap-1">
                              <FaClock className="text-teal-400" />
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                            <span>
                              Operator: {String(log.operator).substring(0, 10)}
                              ...
                            </span>
                          </div>
                          <p className="text-teal-300 text-sm mb-2">
                            {log.notes}
                          </p>
                          {log.predictionData && (
                            <p className="text-teal-400/70 text-xs">
                              Prediction: {log.predictionData}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              log.congestion === "Critical"
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : log.congestion === "High"
                                ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                                : log.congestion === "Medium"
                                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                : "bg-green-500/20 text-green-300 border border-green-500/30"
                            }`}
                          >
                            {log.congestion}
                          </div>
                          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            {log.action}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-teal-500/30">
                  <p className="text-teal-200 text-center">
                    {logCount && Number(logCount) > 0
                      ? `${logCount.toString()} total logs recorded`
                      : "No traffic logs recorded yet"}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-teal-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaChartLine className="text-teal-400" />
                Traffic Analytics
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-6">
                  <h3 className="text-teal-200 font-semibold mb-4">
                    Peak Hours
                  </h3>
                  <div className="space-y-3">
                    {["08:00-09:00", "12:00-13:00", "17:00-19:00"].map(
                      (time, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <span className="text-white">{time}</span>
                          <span className="text-teal-400 font-bold">
                            {85 - i * 10}%
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-6">
                  <h3 className="text-teal-200 font-semibold mb-4">
                    Top Locations
                  </h3>
                  <div className="space-y-3">
                    {[
                      "Main St & 5th Ave",
                      "Broadway & Park",
                      "Highway 101",
                    ].map((loc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="text-white text-sm">{loc}</span>
                        <span className="text-teal-400 font-bold">
                          {234 - i * 50}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-6">
                  <h3 className="text-teal-200 font-semibold mb-4">
                    Response Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-white">234</p>
                      <p className="text-teal-300 text-sm">Total Logs</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">12</p>
                      <p className="text-teal-300 text-sm">Emergencies</p>
                    </div>
                  </div>
                </div>

                <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-6">
                  <h3 className="text-teal-200 font-semibold mb-4 flex items-center gap-2">
                    <FaCheckCircle className="text-green-400" />
                    System Health
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-teal-300">Uptime</span>
                      <span className="text-green-400 font-bold">99.8%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-teal-300">Avg Response</span>
                      <span className="text-green-400 font-bold">3.2 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-teal-300">Success Rate</span>
                      <span className="text-green-400 font-bold">96.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
