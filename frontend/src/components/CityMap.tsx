"use client";

import { useRouter } from "next/navigation";
import { useState, ElementType } from "react"; // Added ElementType import
import {
  FaUniversity,
  FaVoteYea,
  FaIdCard,
  FaExclamationTriangle,
  FaHospital,
  FaTruck,
  FaTrafficLight,
  FaCoins,
  FaFaucet,
  FaLock,
  FaUserShield,
  FaUserMd,
} from "react-icons/fa";

interface CityBuilding {
  id: string;
  name: string;
  icon: ElementType; // Fixed: Changed 'any' to 'ElementType'
  route: string;
  position: { x: number; y: number };
  gradient: string;
  description: string;
  status?: string;
  stat?: string | null;
}

interface CityMapProps {
  stats: {
    bank: string | null;
    treasury: string | null;
    voting: string | null;
    identity: string | null;
  };
}

export function CityMap({ stats }: CityMapProps) {
  const router = useRouter();
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  const cityBuildings: CityBuilding[] = [
    {
      id: "bank",
      name: "DeFi Bank",
      icon: FaUniversity,
      route: "/banking",
      position: { x: 10, y: 15 },
      gradient: "from-blue-500 via-blue-600 to-blue-700",
      description: "Deposits, Loans & Interest",
      stat: stats.bank,
    },
    {
      id: "voting",
      name: "City Hall",
      icon: FaVoteYea,
      route: "/voting",
      position: { x: 38, y: 10 },
      gradient: "from-purple-500 via-purple-600 to-purple-700",
      description: "Governance & Voting",
      stat: stats.voting,
    },
    {
      id: "identity",
      name: "Registry Office",
      icon: FaIdCard,
      route: "/identity",
      position: { x: 66, y: 15 },
      gradient: "from-green-500 via-green-600 to-green-700",
      description: "Identity Verification",
      stat: stats.identity,
    },
    {
      id: "treasury",
      name: "City Treasury",
      icon: FaCoins,
      route: "/banking",
      position: { x: 10, y: 50 },
      gradient: "from-amber-500 via-amber-600 to-amber-700",
      description: "NEO Token Management",
      stat: stats.treasury,
    },
    {
      id: "faucet",
      name: "Token Faucet",
      icon: FaFaucet,
      route: "/faucet",
      position: { x: 24, y: 35 },
      gradient: "from-teal-500 via-teal-600 to-teal-700",
      description: "Get Free NEO Tokens",
      status: "1000 NEO/24h",
    },
    {
      id: "vault",
      name: "Token Vault",
      icon: FaLock,
      route: "/vault",
      position: { x: 52, y: 35 },
      gradient: "from-yellow-500 via-yellow-600 to-yellow-700",
      description: "Secure Token Minting",
      status: "Owner Only",
    },
    {
      id: "grievance",
      name: "Citizen Services",
      icon: FaExclamationTriangle,
      route: "/grievances",
      position: { x: 38, y: 55 },
      gradient: "from-orange-500 via-orange-600 to-orange-700",
      description: "Report & Track Issues",
      status: "Coming Soon",
    },
    {
      id: "hospital",
      name: "City Hospital",
      icon: FaHospital,
      route: "/healthcare",
      position: { x: 66, y: 50 },
      gradient: "from-red-500 via-red-600 to-red-700",
      description: "Electronic Health Records",
    },
    {
      id: "doctor",
      name: "Doctor Portal",
      icon: FaUserMd,
      route: "/doctor",
      position: { x: 80, y: 50 },
      gradient: "from-pink-500 via-pink-600 to-pink-700",
      description: "Healthcare Provider Dashboard",
    },
    {
      id: "admin",
      name: "Admin Center",
      icon: FaUserShield,
      route: "/admin",
      position: { x: 10, y: 80 },
      gradient: "from-purple-500 via-indigo-600 to-purple-700",
      description: "System Administration",
      status: "Admin Only",
    },
    {
      id: "supply",
      name: "Market District",
      icon: FaTruck,
      route: "/supply-chain",
      position: { x: 24, y: 80 },
      gradient: "from-yellow-500 via-yellow-600 to-yellow-700",
      description: "Supply Chain Tracking",
    },
    {
      id: "traffic",
      name: "Traffic Control",
      icon: FaTrafficLight,
      route: "/traffic",
      position: { x: 52, y: 80 },
      gradient: "from-cyan-500 via-cyan-600 to-cyan-700",
      description: "Traffic Management",
    },
  ];

  const handleBuildingClick = (route: string, status?: string) => {
    if (status === "Coming Soon") {
      return;
    }
    router.push(route);
  };

  return (
    <div className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl p-8 overflow-hidden min-h-[600px]">
      {/* Sky/Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-green-950/10 pointer-events-none"></div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* Buildings */}
      <div className="relative h-full">
        {cityBuildings.map((building) => {
          const Icon = building.icon;
          const isHovered = hoveredBuilding === building.id;
          const isComingSoon = building.status === "Coming Soon";

          return (
            <div
              key={building.id}
              className={`absolute transform transition-all duration-300 ${
                isComingSoon
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              } ${isHovered ? "scale-110 z-20" : "scale-100 z-10"}`}
              style={{
                left: `${building.position.x}%`,
                top: `${building.position.y}%`,
              }}
              onClick={() =>
                handleBuildingClick(building.route, building.status)
              }
              onMouseEnter={() => setHoveredBuilding(building.id)}
              onMouseLeave={() => setHoveredBuilding(null)}
            >
              {/* Building Structure - Isometric Style */}
              <div className="relative">
                {/* Building Base - 3D Effect */}
                <div
                  className={`relative w-32 h-40 bg-gradient-to-br ${
                    building.gradient
                  } rounded-t-lg shadow-2xl transform perspective-1000 ${
                    isHovered ? "shadow-[0_0_30px_rgba(59,130,246,0.5)]" : ""
                  }`}
                  style={{
                    boxShadow: isHovered
                      ? "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(59, 130, 246, 0.4)"
                      : "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {/* Windows */}
                  <div className="absolute inset-0 grid grid-cols-3 gap-2 p-3">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`bg-yellow-200/30 rounded-sm ${
                          isHovered ? "bg-yellow-300/50" : ""
                        }`}
                      ></div>
                    ))}
                  </div>

                  {/* Roof */}
                  <div
                    className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-36 h-8 bg-gradient-to-br ${building.gradient} rounded-sm`}
                    style={{
                      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                    }}
                  ></div>

                  {/* Icon */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div
                      className={`p-4 bg-white/20 backdrop-blur-sm rounded-full ${
                        isHovered ? "bg-white/30 scale-110" : ""
                      } transition-all duration-300`}
                    >
                      <Icon className="text-white text-3xl" />
                    </div>
                  </div>

                  {/* Coming Soon Badge */}
                  {isComingSoon && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      Soon
                    </div>
                  )}

                  {/* Stats Badge */}
                  {building.stat && !isComingSoon && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                      {building.stat}
                    </div>
                  )}
                </div>

                {/* Building Shadow */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-36 h-4 bg-black/40 rounded-full blur-md"></div>

                {/* Info Tooltip */}
                {isHovered && (
                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 shadow-2xl w-48 z-30 animate-fadeIn">
                    <div className="font-bold text-white mb-1">
                      {building.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {building.description}
                    </div>
                    {isComingSoon && (
                      <div className="text-xs text-yellow-400 mt-2 font-semibold">
                        🚧 Under Development
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Name Label */}
              <div className="text-center mt-4 text-sm font-semibold text-white drop-shadow-lg">
                {building.name}
              </div>
            </div>
          );
        })}

        {/* Decorative Elements - Roads */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          style={{ zIndex: 1 }}
        >
          <line
            x1="20%"
            y1="30%"
            x2="80%"
            y2="30%"
            stroke="#4ade80"
            strokeWidth="3"
            strokeDasharray="10,10"
          />
          <line
            x1="20%"
            y1="65%"
            x2="80%"
            y2="65%"
            stroke="#4ade80"
            strokeWidth="3"
            strokeDasharray="10,10"
          />
          <line
            x1="30%"
            y1="20%"
            x2="30%"
            y2="90%"
            stroke="#4ade80"
            strokeWidth="3"
            strokeDasharray="10,10"
          />
          <line
            x1="70%"
            y1="20%"
            x2="70%"
            y2="90%"
            stroke="#4ade80"
            strokeWidth="3"
            strokeDasharray="10,10"
          />
        </svg>
      </div>
    </div>
  );
}
