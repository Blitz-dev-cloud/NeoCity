"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUniversity,
  FaVoteYea,
  FaIdCard,
  FaExclamationTriangle,
  FaHospital,
  FaShippingFast,
  FaTrafficLight,
  FaCoins,
  FaLock,
  FaUserShield,
  FaUserMd,
} from "react-icons/fa";
import { ReactNode } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: ReactNode;
  badge?: number;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: <FaHome /> },
  { name: "DeFi Banking", href: "/banking", icon: <FaUniversity /> },
  { name: "Token Faucet", href: "/faucet", icon: <FaCoins /> },
  { name: "Token Vault", href: "/vault", icon: <FaLock /> },
  { name: "Voting", href: "/voting", icon: <FaVoteYea /> },
  { name: "Identity", href: "/identity", icon: <FaIdCard /> },
  {
    name: "Grievances",
    href: "/grievance",
    icon: <FaExclamationTriangle />,
    badge: 3,
  },
  { name: "Healthcare", href: "/healthcare", icon: <FaHospital /> },
  { name: "Doctor Portal", href: "/doctor", icon: <FaUserMd /> },
  { name: "Supply Chain", href: "/supply-chain", icon: <FaShippingFast /> },
  { name: "Traffic", href: "/traffic", icon: <FaTrafficLight /> },
  { name: "Admin Panel", href: "/admin", icon: <FaUserShield /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen sticky top-16">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Network Info */}
      <div className="absolute bottom-4 left-4 right-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="text-xs text-gray-400 mb-1">Network</div>
        <div className="text-sm font-medium text-white">Hardhat Local</div>
        <div className="text-xs text-gray-500 mt-1">Chain ID: 31337</div>
      </div>
    </aside>
  );
}
