"use client";

import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  color?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-4xl",
  color = "blue",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const colorClasses =
    {
      blue: "from-blue-600/90 to-cyan-600/90 border-blue-400",
      green: "from-green-600/90 to-emerald-600/90 border-green-400",
      purple: "from-purple-600/90 to-pink-600/90 border-purple-400",
      orange: "from-orange-600/90 to-red-600/90 border-orange-400",
      indigo: "from-indigo-600/90 to-blue-600/90 border-indigo-400",
      yellow: "from-yellow-600/90 to-orange-600/90 border-yellow-400",
      red: "from-red-600/90 to-rose-600/90 border-red-400",
      teal: "from-teal-600/90 to-cyan-600/90 border-teal-400",
    }[color] || "from-blue-600/90 to-cyan-600/90 border-blue-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-strong bg-black/50 animate-fadeIn custom-cursor"
      onClick={onClose}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Modal Content */}
      <div
        className={`relative w-full ${maxWidth} bg-gradient-to-br ${colorClasses} backdrop-blur-xl border-2 rounded-2xl shadow-2xl animate-slideUp`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl animate-pulse-glow" />

        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg animate-gradient bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="custom-cursor-pointer p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all hover:rotate-90 transform duration-300"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="relative p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
