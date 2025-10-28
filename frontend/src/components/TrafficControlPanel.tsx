"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trafficCongestionData } from "./CityVehicles";
import {
  FaCar,
  FaTachometerAlt,
  FaTrafficLight,
  FaChartLine,
} from "react-icons/fa";

export function TrafficControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(trafficCongestionData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData({ ...trafficCongestionData });
    }, 100); // Update every 100ms for real-time feel

    return () => clearInterval(interval);
  }, []);

  const getCongestionColor = (level: number) => {
    if (level < 30) return "text-green-400";
    if (level < 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getCongestionBg = (level: number) => {
    if (level < 30) return "from-green-500/20 to-green-600/20";
    if (level < 60) return "from-yellow-500/20 to-yellow-600/20";
    return "from-red-500/20 to-red-600/20";
  };

  const getCongestionStatus = (level: number) => {
    if (level < 30) return "Smooth";
    if (level < 60) return "Moderate";
    return "Congested";
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-lg shadow-blue-500/50 font-semibold flex items-center gap-2 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaTrafficLight className="text-xl" />
        Traffic Control
      </motion.button>

      {/* Control Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed bottom-24 right-24 z-50 w-96"
          >
            <div className="bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border-2 border-blue-400/30 shadow-2xl shadow-blue-500/50 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/30 rounded-lg">
                    <FaTrafficLight className="text-2xl text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Traffic Control
                    </h3>
                    <p className="text-xs text-blue-300">
                      Real-time Monitoring
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Congestion Level */}
              <div
                className={`bg-gradient-to-r ${getCongestionBg(
                  data.congestionLevel
                )} rounded-xl p-4 mb-4 border border-white/10`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">
                    Congestion Level
                  </span>
                  <span
                    className={`text-2xl font-bold ${getCongestionColor(
                      data.congestionLevel
                    )}`}
                  >
                    {data.congestionLevel.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${
                      data.congestionLevel < 30
                        ? "from-green-500 to-green-600"
                        : data.congestionLevel < 60
                        ? "from-yellow-500 to-yellow-600"
                        : "from-red-500 to-red-600"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${data.congestionLevel}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <span
                    className={`text-lg font-semibold ${getCongestionColor(
                      data.congestionLevel
                    )}`}
                  >
                    {getCongestionStatus(data.congestionLevel)}
                  </span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Total Vehicles */}
                <div className="bg-white/5 backdrop-blur-sm border border-blue-400/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FaCar className="text-blue-400" />
                    <span className="text-xs text-blue-200">
                      Total Vehicles
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {data.totalVehicles}
                  </p>
                </div>

                {/* Stopped Vehicles */}
                <div className="bg-white/5 backdrop-blur-sm border border-red-400/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FaTrafficLight className="text-red-400" />
                    <span className="text-xs text-red-200">Stopped</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {data.stoppedVehicles}
                  </p>
                </div>

                {/* Average Speed */}
                <div className="bg-white/5 backdrop-blur-sm border border-green-400/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FaTachometerAlt className="text-green-400" />
                    <span className="text-xs text-green-200">Avg Speed</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {(data.averageSpeed * 100).toFixed(1)}
                    <span className="text-sm text-gray-400 ml-1">u/s</span>
                  </p>
                </div>

                {/* Flow Rate */}
                <div className="bg-white/5 backdrop-blur-sm border border-purple-400/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FaChartLine className="text-purple-400" />
                    <span className="text-xs text-purple-200">Flow Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {(
                      ((data.totalVehicles - data.stoppedVehicles) /
                        data.totalVehicles) *
                      100
                    ).toFixed(0)}
                    %
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 p-3 bg-black/20 rounded-lg border border-white/10">
                <motion.div
                  className={`w-3 h-3 rounded-full ${
                    data.congestionLevel < 30
                      ? "bg-green-500"
                      : data.congestionLevel < 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm text-gray-300">
                  System Active • Monitoring {data.totalVehicles} vehicles
                </span>
              </div>

              {/* Tips */}
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                <p className="text-xs text-blue-200">
                  💡 <span className="font-semibold">Tip:</span> Traffic lights
                  sync automatically to optimize flow
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
