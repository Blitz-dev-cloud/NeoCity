"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Box, Cylinder, Sphere, Cone } from "@react-three/drei";
import * as THREE from "three";

interface Building3DProps {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  height: number;
  style: string;
  isHovered: boolean;
  onClick: () => void;
  onHover: () => void;
  onUnhover: () => void;
}

export function Building3D({
  id,
  name,
  position,
  color,
  height,
  isHovered,
  onClick,
  onHover,
  onUnhover,
}: Building3DProps) {
  const meshRef = useRef<THREE.Group>(null);

  // Smooth hover animation
  useFrame(() => {
    if (meshRef.current) {
      const targetY = isHovered ? position[1] + 0.3 : position[1];
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        0.1
      );
    }
  });

  const handlePointerOver = () => {
    onHover();
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    onUnhover();
    document.body.style.cursor = "auto";
  };

  // Custom procedural buildings
  const renderBuilding = () => {
    switch (id) {
      case "bank":
        // Modern Glass Skyscraper - SCALED UP
        return (
          <group scale={1.8}>
            {/* Main tower */}
            <Box
              args={[2.5, 12, 2.5]}
              position={[0, 6, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#1e40af"
                metalness={0.9}
                roughness={0.1}
                emissive={color}
                emissiveIntensity={isHovered ? 0.4 : 0.2}
              />
            </Box>
            {/* Glass windows layers */}
            {[...Array(24)].map((_, i) => (
              <Box
                key={i}
                args={[2.6, 0.4, 2.6]}
                position={[0, i * 0.5 + 0.5, 0]}
              >
                <meshStandardMaterial
                  color="#60a5fa"
                  metalness={1}
                  roughness={0}
                  transparent
                  opacity={0.8}
                  emissive="#3b82f6"
                  emissiveIntensity={0.3}
                />
              </Box>
            ))}
            {/* Antenna */}
            <Cylinder args={[0.08, 0.08, 2, 8]} position={[0, 13, 0]}>
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={0.8}
              />
            </Cylinder>
            <Sphere args={[0.15, 16, 16]} position={[0, 14, 0]}>
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={1}
              />
            </Sphere>
          </group>
        );

      case "cityhall":
        // Classical Dome Building - SCALED UP
        return (
          <group scale={1.8}>
            {/* Base */}
            <Box
              args={[5, 3, 4]}
              position={[0, 1.5, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#7c3aed"
                metalness={0.2}
                roughness={0.6}
                emissive={color}
                emissiveIntensity={isHovered ? 0.3 : 0.15}
              />
            </Box>
            {/* Columns */}
            {[-1.8, -0.6, 0.6, 1.8].map((x, i) => (
              <Cylinder
                key={i}
                args={[0.25, 0.25, 3, 12]}
                position={[x, 1.5, 2.2]}
                castShadow
              >
                <meshStandardMaterial
                  color="#f3f4f6"
                  metalness={0.1}
                  roughness={0.8}
                />
              </Cylinder>
            ))}
            {/* Dome */}
            <Sphere
              args={[2.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
              position={[0, 3.5, 0]}
              castShadow
            >
              <meshStandardMaterial
                color="#a855f7"
                metalness={0.6}
                roughness={0.2}
                emissive={color}
                emissiveIntensity={isHovered ? 0.4 : 0.2}
              />
            </Sphere>
            {/* Dome top spike */}
            <Cone args={[0.4, 1, 8]} position={[0, 5.5, 0]}>
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.8}
                roughness={0.2}
              />
            </Cone>
          </group>
        );

      case "hospital":
        // Medical Center with Cross - SCALED UP
        return (
          <group scale={1.8}>
            {/* Main building */}
            <Box
              args={[4, 8, 3.5]}
              position={[0, 4, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#dc2626"
                metalness={0.3}
                roughness={0.5}
                emissive={color}
                emissiveIntensity={isHovered ? 0.3 : 0.15}
              />
            </Box>
            {/* White cross - vertical */}
            <Box args={[0.6, 2.5, 0.2]} position={[0, 6.5, 1.8]}>
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.5}
              />
            </Box>
            {/* White cross - horizontal */}
            <Box args={[2, 0.6, 0.2]} position={[0, 6.5, 1.8]}>
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.5}
              />
            </Box>
            {/* Helipad on roof */}
            <Cylinder args={[1, 1, 0.2, 32]} position={[0, 8.2, 0]}>
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={0.3}
              />
            </Cylinder>
            {/* Windows */}
            {[...Array(16)].map((_, i) => (
              <Box
                key={i}
                args={[0.4, 0.4, 0.1]}
                position={[
                  (i % 4) * 0.8 - 1.2,
                  Math.floor(i / 4) * 1.8 + 1,
                  1.8,
                ]}
              >
                <meshStandardMaterial
                  color="#60a5fa"
                  emissive="#60a5fa"
                  emissiveIntensity={0.2}
                />
              </Box>
            ))}
          </group>
        );

      case "farm":
        // Farm Complex with Barn - SCALED UP
        return (
          <group scale={2}>
            {/* Main barn */}
            <Box
              args={[4.5, 5, 3]}
              position={[0, 2.5, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#b91c1c"
                metalness={0.2}
                roughness={0.8}
                emissive={color}
                emissiveIntensity={isHovered ? 0.3 : 0.15}
              />
            </Box>
            {/* Roof */}
            <Cone
              args={[3.2, 2.5, 4]}
              position={[0, 6.25, 0]}
              rotation={[0, Math.PI / 4, 0]}
            >
              <meshStandardMaterial
                color="#7f1d1d"
                metalness={0.1}
                roughness={0.9}
              />
            </Cone>
            {/* Silo */}
            <Cylinder args={[0.8, 0.8, 6, 16]} position={[3, 3, 0]} castShadow>
              <meshStandardMaterial
                color="#d1d5db"
                metalness={0.5}
                roughness={0.5}
              />
            </Cylinder>
            <Cone args={[1, 1.2, 16]} position={[3, 6.6, 0]}>
              <meshStandardMaterial
                color="#9ca3af"
                metalness={0.5}
                roughness={0.5}
              />
            </Cone>
            {/* Barn door */}
            <Box args={[1.5, 2.5, 0.1]} position={[0, 1.25, 1.6]}>
              <meshStandardMaterial color="#451a03" roughness={1} />
            </Box>
          </group>
        );

      case "shop":
        // Retail Shop - SCALED UP
        return (
          <group scale={1.8}>
            {/* Main building */}
            <Box
              args={[4, 5, 3]}
              position={[0, 2.5, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#f97316"
                metalness={0.4}
                roughness={0.6}
                emissive={color}
                emissiveIntensity={isHovered ? 0.3 : 0.15}
              />
            </Box>
            {/* Awning */}
            <Box args={[4.5, 0.2, 1.5]} position={[0, 4, 2]}>
              <meshStandardMaterial color="#dc2626" roughness={0.9} />
            </Box>
            {/* Store sign */}
            <Box args={[3, 0.8, 0.1]} position={[0, 5.5, 1.6]}>
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={0.6}
              />
            </Box>
            {/* Windows */}
            <Box args={[1.5, 2, 0.1]} position={[-1, 2.5, 1.6]}>
              <meshStandardMaterial
                color="#60a5fa"
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={0.8}
              />
            </Box>
            <Box args={[1.5, 2, 0.1]} position={[1, 2.5, 1.6]}>
              <meshStandardMaterial
                color="#60a5fa"
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={0.8}
              />
            </Box>
            {/* Door */}
            <Box args={[0.8, 2, 0.1]} position={[0, 1, 1.6]}>
              <meshStandardMaterial color="#92400e" roughness={0.8} />
            </Box>
          </group>
        );

      case "traffic":
        // Traffic Control Center - SCALED UP
        return (
          <group scale={1.8}>
            {/* Main building */}
            <Box
              args={[3.5, 6, 3.5]}
              position={[0, 3, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#0d9488"
                metalness={0.7}
                roughness={0.3}
                emissive={color}
                emissiveIntensity={isHovered ? 0.4 : 0.2}
              />
            </Box>
            {/* Holographic screens */}
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                args={[3.2, 1.2, 0.1]}
                position={[0, i * 2 + 1.5, 1.8]}
              >
                <meshStandardMaterial
                  color="#06b6d4"
                  metalness={0.9}
                  roughness={0.1}
                  emissive="#06b6d4"
                  emissiveIntensity={0.7}
                  transparent
                  opacity={0.8}
                />
              </Box>
            ))}
            {/* Antenna array */}
            {[-0.8, 0, 0.8].map((x, i) => (
              <Cylinder
                key={i}
                args={[0.05, 0.05, 1.5, 8]}
                position={[x, 6.75, 0]}
              >
                <meshStandardMaterial
                  color="#06b6d4"
                  emissive="#06b6d4"
                  emissiveIntensity={0.8}
                />
              </Cylinder>
            ))}
          </group>
        );

      case "grievance":
        // Justice Court - SCALED UP
        return (
          <group scale={1.8}>
            {/* Main building */}
            <Box
              args={[5, 4, 3.5]}
              position={[0, 2, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#ea580c"
                metalness={0.3}
                roughness={0.6}
                emissive={color}
                emissiveIntensity={isHovered ? 0.3 : 0.15}
              />
            </Box>
            {/* Front columns */}
            {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
              <Cylinder
                key={i}
                args={[0.25, 0.3, 4, 16]}
                position={[x, 2, 2]}
                castShadow
              >
                <meshStandardMaterial
                  color="#f5f5f5"
                  metalness={0.1}
                  roughness={0.8}
                />
              </Cylinder>
            ))}
            {/* Triangular roof */}
            <Cone
              args={[3.5, 1.5, 4]}
              position={[0, 4.75, 0]}
              rotation={[0, Math.PI / 4, 0]}
            >
              <meshStandardMaterial
                color="#c2410c"
                metalness={0.2}
                roughness={0.7}
              />
            </Cone>
            {/* Scales of justice symbol */}
            <group position={[0, 5.5, 2]}>
              <Cylinder args={[0.05, 0.05, 0.8, 8]}>
                <meshStandardMaterial
                  color="#fbbf24"
                  metalness={0.8}
                  roughness={0.2}
                />
              </Cylinder>
              <Sphere args={[0.15, 16, 16]} position={[0, 0.5, 0]}>
                <meshStandardMaterial
                  color="#fbbf24"
                  metalness={0.8}
                  roughness={0.2}
                />
              </Sphere>
            </group>
          </group>
        );

      case "token":
        // Token Mint - Vault Style - SCALED UP
        return (
          <group scale={1.8}>
            {/* Main vault */}
            <Cylinder
              args={[2, 2.5, 7, 8]}
              position={[0, 3.5, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#eab308"
                metalness={0.9}
                roughness={0.2}
                emissive={color}
                emissiveIntensity={isHovered ? 0.4 : 0.2}
              />
            </Cylinder>
            {/* Top dome */}
            <Sphere
              args={[2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
              position={[0, 7, 0]}
            >
              <meshStandardMaterial
                color="#facc15"
                metalness={0.9}
                roughness={0.1}
                emissive="#fbbf24"
                emissiveIntensity={0.3}
              />
            </Sphere>
            {/* Golden rings */}
            {[2, 4, 6].map((y, i) => (
              <group
                key={i}
                position={[0, y, 0]}
                rotation={[0, (i * Math.PI) / 4, 0]}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => (
                  <Box
                    key={j}
                    args={[0.15, 0.3, 0.15]}
                    position={[
                      Math.cos((j / 8) * Math.PI * 2) * 2.3,
                      0,
                      Math.sin((j / 8) * Math.PI * 2) * 2.3,
                    ]}
                  >
                    <meshStandardMaterial
                      color="#fbbf24"
                      metalness={1}
                      roughness={0}
                      emissive="#fbbf24"
                      emissiveIntensity={0.2}
                    />
                  </Box>
                ))}
              </group>
            ))}
          </group>
        );

      default:
        // Simple box fallback
        return (
          <Box
            args={[2.5, height, 2.5]}
            position={[0, height / 2, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={color}
              metalness={0.5}
              roughness={0.5}
              emissive={color}
              emissiveIntensity={isHovered ? 0.3 : 0.1}
            />
          </Box>
        );
    }
  };

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Render the custom building */}
      {renderBuilding()}

      {/* Glow effect on hover */}
      {isHovered && (
        <pointLight
          position={[0, height / 2, 0]}
          intensity={2}
          distance={15}
          color={color}
        />
      )}

      {/* Label on hover */}
      {isHovered && (
        <Html center position={[0, height + 2, 0]}>
          <div className="bg-black/90 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/50">
            <p className="text-white font-bold text-sm whitespace-nowrap">
              {name}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
