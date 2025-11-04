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
  FaBell,
  FaArrowLeft,
} from "react-icons/fa";
import { TrafficLogABI } from "@/contracts/abis";
import { CONTRACTS } from "@/contracts/addresses";

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
  const [activeTab, setActiveTab] = useState<"log" | "monitor" | "analytics">(
    "log"
  );
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

  // Read contract data
  const { data: logCount } = useReadContract({
    address: CONTRACTS.TrafficLog as `0x${string}`,
    abi: TrafficLogABI,
    functionName: "logCount",
  });

  // Write contract
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleLogTraffic = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location || !description) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    // Simulate IPFS upload for prediction data
    const mockPredictionData = `Qm${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    try {
      writeContract({
        address: CONTRACTS.TrafficLog as `0x${string}`,
        abi: TrafficLogABI,
        functionName: "logTrafficData",
        args: [
          location,
          congestionLevel,
          actionTaken,
          description,
          mockPredictionData,
          isEmergency,
        ],
      });
    } catch (error) {
      showNotification("Error logging traffic data", "error");
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

  const getCongestionColor = (level: CongestionLevel) => {
    switch (level) {
      case CongestionLevel.Low:
        return "text-green-400";
      case CongestionLevel.Medium:
        return "text-yellow-400";
      case CongestionLevel.High:
        return "text-orange-400";
      case CongestionLevel.Critical:
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getCongestionBg = (level: CongestionLevel) => {
    switch (level) {
      case CongestionLevel.Low:
        return "bg-green-500/20 border-green-500/30";
      case CongestionLevel.Medium:
        return "bg-yellow-500/20 border-yellow-500/30";
      case CongestionLevel.High:
        return "bg-orange-500/20 border-orange-500/30";
      case CongestionLevel.Critical:
        return "bg-red-500/20 border-red-500/30";
      default:
        return "bg-gray-500/20 border-gray-500/30";
    }
  };

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
                Total Logs
              </span>
              <FaChartLine className="text-teal-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {logCount?.toString() || "0"}
            </p>
            <p className="text-teal-200 text-xs mt-1">Traffic entries</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-teal-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-teal-300 text-sm font-medium">
                Active Alerts
              </span>
              <FaBell className="text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white">3</p>
            <p className="text-teal-200 text-xs mt-1">High priority</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-teal-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-teal-300 text-sm font-medium">
                Avg. Flow
              </span>
              <FaCar className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">65%</p>
            <p className="text-teal-200 text-xs mt-1">City capacity</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-teal-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-teal-300 text-sm font-medium">
                Response Time
              </span>
              <FaClock className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">3.2</p>
            <p className="text-teal-200 text-xs mt-1">Minutes average</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 bg-black/40 backdrop-blur-xl rounded-2xl p-2 border border-teal-500/30">
            {[
              { id: "log", label: "Log Traffic", icon: FaTrafficLight },
              { id: "monitor", label: "Live Monitor", icon: FaMapMarkedAlt },
              { id: "analytics", label: "Analytics", icon: FaChartLine },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
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
                  disabled={isPending || isConfirming}
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isPending || isConfirming ? (
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

              {/* Mock traffic locations */}
              {[
                {
                  location: "Main St & 5th Ave",
                  level: CongestionLevel.High,
                  vehicles: 45,
                  time: "2 mins ago",
                },
                {
                  location: "Broadway & Park",
                  level: CongestionLevel.Medium,
                  vehicles: 28,
                  time: "5 mins ago",
                },
                {
                  location: "Highway 101 Exit 12",
                  level: CongestionLevel.Critical,
                  vehicles: 78,
                  time: "1 min ago",
                  emergency: true,
                },
                {
                  location: "Downtown Plaza",
                  level: CongestionLevel.Low,
                  vehicles: 12,
                  time: "10 mins ago",
                },
              ].map((spot, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-black/40 backdrop-blur-xl rounded-2xl p-6 border hover:border-teal-400/50 transition-colors ${
                    spot.emergency ? "border-red-500/50" : "border-teal-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {spot.location}
                        </h3>
                        {spot.emergency && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                            <FaExclamationTriangle />
                            EMERGENCY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-teal-300 flex items-center gap-1">
                          <FaCar />
                          {spot.vehicles} vehicles
                        </span>
                        <span className="text-teal-400 flex items-center gap-1">
                          <FaClock />
                          {spot.time}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${getCongestionBg(
                        spot.level
                      )}`}
                    >
                      <span className={getCongestionColor(spot.level)}>
                        {CongestionLevel[spot.level]}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 bg-black/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(spot.vehicles / 80) * 100}%` }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                      className={`h-full ${
                        spot.level === CongestionLevel.Low
                          ? "bg-green-500"
                          : spot.level === CongestionLevel.Medium
                          ? "bg-yellow-500"
                          : spot.level === CongestionLevel.High
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
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
