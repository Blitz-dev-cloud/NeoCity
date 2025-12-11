"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrafficLight, FaClock, FaCar, FaChartLine } from "react-icons/fa";
import { trafficCongestionData } from "./CityVehicles";
import { TrafficLightManager } from "./TrafficLights";

export function TrafficStatusIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [congestionLevel, setCongestionLevel] = useState(0);
  const [stoppedVehicles, setStoppedVehicles] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [lightTiming, setLightTiming] = useState({
    green: 5,
    red: 4,
    yellow: 1,
  });
  const [recoveryStatus, setRecoveryStatus] = useState({
    isActive: false,
    currentPhase: "horizontal" as "horizontal" | "vertical",
    phaseProgress: 0,
    duration: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCongestionLevel(trafficCongestionData.congestionLevel);
      setStoppedVehicles(trafficCongestionData.stoppedVehicles);
      setTotalVehicles(trafficCongestionData.totalVehicles);
      setAverageSpeed(trafficCongestionData.averageSpeed);

      // Get current traffic light timing and recovery status
      const manager = TrafficLightManager.getInstance();
      setLightTiming(manager.getCurrentTiming());
      setRecoveryStatus(manager.getRecoveryStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getCongestionColor = () => {
    if (congestionLevel > 70) return "text-red-500";
    if (congestionLevel > 40) return "text-yellow-500";
    return "text-green-500";
  };

  const getCongestionBg = () => {
    if (congestionLevel > 70)
      return "from-red-500/20 to-orange-500/20 border-red-500/30";
    if (congestionLevel > 40)
      return "from-yellow-500/20 to-orange-500/20 border-yellow-500/30";
    return "from-green-500/20 to-emerald-500/20 border-green-500/30";
  };

  const getCongestionLabel = () => {
    if (congestionLevel > 90) return "CRITICAL";
    if (congestionLevel > 70) return "HIGH";
    if (congestionLevel > 40) return "MEDIUM";
    return "LOW";
  };

  return (
    <div className="fixed top-20 right-4 z-40">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`bg-gradient-to-br ${getCongestionBg()} backdrop-blur-xl border-2 rounded-2xl p-6 shadow-2xl min-w-80`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaTrafficLight className={getCongestionColor()} />
                Traffic Status
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {/* Congestion Level */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Congestion Level</span>
                <span className={`font-bold ${getCongestionColor()}`}>
                  {getCongestionLabel()}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-full ${
                    congestionLevel > 70
                      ? "bg-gradient-to-r from-red-500 to-orange-500"
                      : congestionLevel > 40
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${congestionLevel}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-right text-xs text-gray-400 mt-1">
                {congestionLevel.toFixed(1)}%
              </p>
            </div>

            {/* Vehicle Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FaCar className="text-blue-400 text-sm" />
                  <span className="text-gray-400 text-xs">Total</span>
                </div>
                <p className="text-white font-bold text-lg">{totalVehicles}</p>
              </div>
              <div className="bg-black/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FaCar className="text-red-400 text-sm" />
                  <span className="text-gray-400 text-xs">Stopped</span>
                </div>
                <p className="text-white font-bold text-lg">
                  {stoppedVehicles}
                </p>
              </div>
            </div>

            {/* Average Speed */}
            <div className="bg-black/20 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <FaChartLine className="text-purple-400 text-sm" />
                <span className="text-gray-400 text-xs">Average Speed</span>
              </div>
              <p className="text-white font-bold">
                {(averageSpeed * 100).toFixed(1)}{" "}
                <span className="text-sm text-gray-400">units/s</span>
              </p>
            </div>

            {/* Dynamic Traffic Light Timing */}
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FaClock className="text-cyan-400" />
                <span className="text-white text-sm font-semibold">
                  Signal Timing {congestionLevel > 70 && "(Adjusted)"}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">🟢 Green</span>
                  <span className="text-white font-mono text-sm">
                    {lightTiming.green}s
                    {congestionLevel > 70 && (
                      <span className="text-green-400 ml-1">↑</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">🔴 Red</span>
                  <span className="text-white font-mono text-sm">
                    {lightTiming.red}s
                    {congestionLevel > 70 && (
                      <span className="text-red-400 ml-1">↓</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">🟡 Yellow</span>
                  <span className="text-white font-mono text-sm">
                    {lightTiming.yellow}s
                  </span>
                </div>
              </div>
              {recoveryStatus.isActive ? (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-orange-400 bg-orange-500/10 p-2 rounded flex items-center gap-2">
                    <span className="animate-pulse">🚨</span>
                    CONGESTION RECOVERY MODE ACTIVE
                  </p>
                  <div className="bg-black/30 p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Current Phase:</span>
                      <span className="text-cyan-400 font-semibold uppercase">
                        {recoveryStatus.currentPhase === "horizontal"
                          ? "⬌ Horizontal (N-S)"
                          : "⬍ Vertical (E-W)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Active Duration:</span>
                      <span className="text-white font-mono">
                        {recoveryStatus.duration}s
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${recoveryStatus.phaseProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 italic">
                      Releasing one direction at a time to clear congestion
                    </p>
                  </div>
                </div>
              ) : congestionLevel > 40 ? (
                <p className="text-xs text-cyan-400 mt-3 bg-cyan-500/10 p-2 rounded">
                  ⚡ Adaptive timing active - Optimized for current traffic
                </p>
              ) : null}
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsExpanded(true)}
            className={`bg-gradient-to-br ${getCongestionBg()} backdrop-blur-xl border-2 rounded-xl px-4 py-3 shadow-2xl hover:scale-105 transition-transform`}
          >
            <div className="flex items-center gap-3">
              <FaTrafficLight className={`text-2xl ${getCongestionColor()}`} />
              <div className="text-left">
                <p className="text-white font-bold text-sm">
                  {getCongestionLabel()}
                </p>
                <p className="text-gray-300 text-xs">
                  {congestionLevel.toFixed(0)}% congestion
                </p>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
