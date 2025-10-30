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
        // Modern Glass Skyscraper - ENHANCED WITH DETAILS
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
                emissiveIntensity={isHovered ? 0.5 : 0.3}
              />
            </Box>

            {/* Glass windows with glowing effect - all 4 sides */}
            {[...Array(24)].map((_, i) => (
              <group key={i}>
                {/* Front/Back windows */}
                <Box args={[2.6, 0.35, 0.1]} position={[0, i * 0.5 + 0.5, 1.3]}>
                  <meshStandardMaterial
                    color="#60a5fa"
                    metalness={1}
                    roughness={0}
                    transparent
                    opacity={0.9}
                    emissive="#3b82f6"
                    emissiveIntensity={isHovered ? 0.6 : 0.4}
                  />
                </Box>
                <Box
                  args={[2.6, 0.35, 0.1]}
                  position={[0, i * 0.5 + 0.5, -1.3]}
                >
                  <meshStandardMaterial
                    color="#60a5fa"
                    metalness={1}
                    roughness={0}
                    transparent
                    opacity={0.9}
                    emissive="#3b82f6"
                    emissiveIntensity={isHovered ? 0.6 : 0.4}
                  />
                </Box>
                {/* Side windows */}
                <Box args={[0.1, 0.35, 2.6]} position={[1.3, i * 0.5 + 0.5, 0]}>
                  <meshStandardMaterial
                    color="#60a5fa"
                    metalness={1}
                    roughness={0}
                    transparent
                    opacity={0.9}
                    emissive="#3b82f6"
                    emissiveIntensity={isHovered ? 0.6 : 0.4}
                  />
                </Box>
                <Box
                  args={[0.1, 0.35, 2.6]}
                  position={[-1.3, i * 0.5 + 0.5, 0]}
                >
                  <meshStandardMaterial
                    color="#60a5fa"
                    metalness={1}
                    roughness={0}
                    transparent
                    opacity={0.9}
                    emissive="#3b82f6"
                    emissiveIntensity={isHovered ? 0.6 : 0.4}
                  />
                </Box>
              </group>
            ))}

            {/* Corner accent lights */}
            {[
              [1.3, 1.3],
              [-1.3, 1.3],
              [1.3, -1.3],
              [-1.3, -1.3],
            ].map((pos, i) => (
              <group key={`corner-${i}`}>
                {[2, 5, 8, 11].map((y) => (
                  <mesh key={`light-${y}`} position={[pos[0], y, pos[1]]}>
                    <sphereGeometry args={[0.15, 8, 8]} />
                    <meshStandardMaterial
                      color="#60a5fa"
                      emissive="#60a5fa"
                      emissiveIntensity={1.5}
                    />
                  </mesh>
                ))}
              </group>
            ))}

            {/* Helipad on roof */}
            <Cylinder args={[1.2, 1.2, 0.2, 32]} position={[0, 12.2, 0]}>
              <meshStandardMaterial
                color="#1e293b"
                emissive="#3b82f6"
                emissiveIntensity={0.3}
              />
            </Cylinder>
            <mesh position={[0, 12.35, 0]}>
              <cylinderGeometry args={[0.8, 0.8, 0.05, 32]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={0.8}
              />
            </mesh>

            {/* Antenna with blinking light */}
            <Cylinder args={[0.08, 0.08, 2, 8]} position={[0, 13.2, 0]}>
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </Cylinder>
            <Sphere args={[0.18, 16, 16]} position={[0, 14.3, 0]}>
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={isHovered ? 2 : 1.5}
              />
            </Sphere>

            {/* Building name sign */}
            <Box args={[3, 0.6, 0.1]} position={[0, 0.8, 1.3]}>
              <meshStandardMaterial
                color="#1e293b"
                emissive="#3b82f6"
                emissiveIntensity={0.5}
              />
            </Box>
          </group>
        );

      case "cityhall":
        // Classical Dome Building - ENHANCED WITH DETAILS
        return (
          <group scale={1.8}>
            {/* Base platform */}
            <Box args={[5.5, 0.5, 4.5]} position={[0, 0.25, 0]}>
              <meshStandardMaterial
                color="#94a3b8"
                metalness={0.3}
                roughness={0.7}
              />
            </Box>

            {/* Main building */}
            <Box
              args={[5, 3, 4]}
              position={[0, 1.75, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#7c3aed"
                metalness={0.2}
                roughness={0.6}
                emissive={color}
                emissiveIntensity={isHovered ? 0.4 : 0.2}
              />
            </Box>

            {/* Columns - front */}
            {[-1.8, -0.6, 0.6, 1.8].map((x, i) => (
              <group key={`col-front-${i}`}>
                <Cylinder
                  args={[0.28, 0.25, 3, 12]}
                  position={[x, 1.75, 2.2]}
                  castShadow
                >
                  <meshStandardMaterial
                    color="#f3f4f6"
                    metalness={0.1}
                    roughness={0.8}
                  />
                </Cylinder>
                {/* Column capitals */}
                <Box args={[0.4, 0.2, 0.4]} position={[x, 3.3, 2.2]}>
                  <meshStandardMaterial color="#e5e7eb" />
                </Box>
                {/* Column bases */}
                <Box args={[0.35, 0.15, 0.35]} position={[x, 0.3, 2.2]}>
                  <meshStandardMaterial color="#e5e7eb" />
                </Box>
              </group>
            ))}

            {/* Columns - sides */}
            {[-1.5, 0, 1.5].map((z, i) => (
              <group key={`col-side-${i}`}>
                <Cylinder
                  args={[0.25, 0.22, 3, 12]}
                  position={[2.7, 1.75, z]}
                  castShadow
                >
                  <meshStandardMaterial color="#f3f4f6" />
                </Cylinder>
                <Cylinder
                  args={[0.25, 0.22, 3, 12]}
                  position={[-2.7, 1.75, z]}
                  castShadow
                >
                  <meshStandardMaterial color="#f3f4f6" />
                </Cylinder>
              </group>
            ))}

            {/* Windows with lights */}
            {[...Array(6)].map((_, i) => (
              <Box
                key={`window-${i}`}
                args={[0.6, 1, 0.15]}
                position={[(i % 3) * 1.5 - 1.5, 2, -2.1]}
              >
                <meshStandardMaterial
                  color="#fef08a"
                  emissive="#fbbf24"
                  emissiveIntensity={isHovered ? 0.8 : 0.5}
                  transparent
                  opacity={0.9}
                />
              </Box>
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
                emissiveIntensity={isHovered ? 0.5 : 0.3}
              />
            </Sphere>

            {/* Dome ribs for detail */}
            {[...Array(8)].map((_, i) => (
              <Box
                key={`rib-${i}`}
                args={[0.15, 2.2, 0.15]}
                position={[
                  Math.cos((i / 8) * Math.PI * 2) * 1.5,
                  4.5,
                  Math.sin((i / 8) * Math.PI * 2) * 1.5,
                ]}
                rotation={[Math.PI / 4, (i / 8) * Math.PI * 2, 0]}
              >
                <meshStandardMaterial
                  color="#8b5cf6"
                  emissive="#a855f7"
                  emissiveIntensity={0.3}
                />
              </Box>
            ))}

            {/* Dome top lantern */}
            <Cylinder args={[0.4, 0.4, 0.8, 8]} position={[0, 5.8, 0]}>
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.8}
                roughness={0.2}
                emissive="#fbbf24"
                emissiveIntensity={0.5}
              />
            </Cylinder>

            {/* Dome top spike */}
            <Cone args={[0.4, 1.2, 8]} position={[0, 6.6, 0]}>
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.9}
                roughness={0.1}
                emissive="#fbbf24"
                emissiveIntensity={0.8}
              />
            </Cone>

            {/* Glowing orb on top */}
            <Sphere args={[0.25, 16, 16]} position={[0, 7.4, 0]}>
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={isHovered ? 2 : 1.2}
              />
            </Sphere>

            {/* Entrance steps */}
            {[0.3, 0.15, 0].map((y, i) => (
              <Box
                key={`step-${i}`}
                args={[3.5, 0.15, 0.8]}
                position={[0, y, 2.5 + i * 0.3]}
              >
                <meshStandardMaterial color="#cbd5e1" />
              </Box>
            ))}

            {/* Decorative lights on corners */}
            {[
              [2.5, 2.5],
              [-2.5, 2.5],
              [2.5, -2.5],
              [-2.5, -2.5],
            ].map((pos, i) => (
              <mesh key={`corner-light-${i}`} position={[pos[0], 3.5, pos[1]]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                  color="#a855f7"
                  emissive="#a855f7"
                  emissiveIntensity={1.5}
                />
              </mesh>
            ))}
          </group>
        );

      case "hospital":
        // Modern Medical Center - ENHANCED - SCALED UP
        return (
          <group scale={1.8}>
            {/* Main hospital building - white modern design */}
            <Box
              args={[5, 9, 4]}
              position={[0, 4.5, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#f8fafc"
                metalness={0.4}
                roughness={0.3}
                emissive={color}
                emissiveIntensity={isHovered ? 0.2 : 0.1}
              />
            </Box>

            {/* Red accent strips */}
            <Box args={[5.1, 0.5, 4.1]} position={[0, 8.5, 0]}>
              <meshStandardMaterial
                color="#dc2626"
                emissive="#dc2626"
                emissiveIntensity={0.4}
              />
            </Box>
            <Box args={[5.1, 0.5, 4.1]} position={[0, 4.5, 0]}>
              <meshStandardMaterial
                color="#dc2626"
                emissive="#dc2626"
                emissiveIntensity={0.4}
              />
            </Box>

            {/* Large Red Cross on front - vertical */}
            <Box args={[0.8, 3.5, 0.15]} position={[0, 6, 2.1]}>
              <meshStandardMaterial
                color="#dc2626"
                emissive="#dc2626"
                emissiveIntensity={isHovered ? 0.8 : 0.5}
              />
            </Box>
            {/* Large Red Cross on front - horizontal */}
            <Box args={[2.8, 0.8, 0.15]} position={[0, 6, 2.1]}>
              <meshStandardMaterial
                color="#dc2626"
                emissive="#dc2626"
                emissiveIntensity={isHovered ? 0.8 : 0.5}
              />
            </Box>

            {/* Emergency wing - left side */}
            <Box args={[1.5, 5, 2]} position={[-3.2, 2.5, 0]} castShadow>
              <meshStandardMaterial
                color="#e2e8f0"
                metalness={0.3}
                roughness={0.4}
              />
            </Box>

            {/* Glass windows - front face grid */}
            {[...Array(6)].map((_, floor) =>
              [...Array(4)].map((_, col) => (
                <Box
                  key={`front-${floor}-${col}`}
                  args={[0.6, 0.7, 0.1]}
                  position={[(col - 1.5) * 1.1, floor * 1.3 + 1, 2.05]}
                >
                  <meshStandardMaterial
                    color="#7dd3fc"
                    metalness={0.8}
                    roughness={0.1}
                    transparent
                    opacity={0.7}
                    emissive="#0ea5e9"
                    emissiveIntensity={0.3}
                  />
                </Box>
              ))
            )}

            {/* Helipad on roof with H marking */}
            <Cylinder args={[1.5, 1.5, 0.3, 32]} position={[0, 9.3, 0]}>
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={0.5}
              />
            </Cylinder>
            {/* H letter - vertical bars */}
            <Box args={[0.25, 0.9, 0.1]} position={[-0.4, 9.5, 0]}>
              <meshStandardMaterial color="#1e293b" />
            </Box>
            <Box args={[0.25, 0.9, 0.1]} position={[0.4, 9.5, 0]}>
              <meshStandardMaterial color="#1e293b" />
            </Box>
            {/* H letter - horizontal bar */}
            <Box args={[0.8, 0.25, 0.1]} position={[0, 9.5, 0]}>
              <meshStandardMaterial color="#1e293b" />
            </Box>

            {/* Ambulance entrance canopy */}
            <Box args={[2.5, 0.2, 1.5]} position={[0, 1.5, 2.8]}>
              <meshStandardMaterial
                color="#dc2626"
                emissive="#dc2626"
                emissiveIntensity={0.3}
              />
            </Box>
            <Box args={[0.15, 1.5, 0.15]} position={[-1.2, 0.75, 2.5]}>
              <meshStandardMaterial color="#94a3b8" />
            </Box>
            <Box args={[0.15, 1.5, 0.15]} position={[1.2, 0.75, 2.5]}>
              <meshStandardMaterial color="#94a3b8" />
            </Box>

            {/* Blinking emergency lights */}
            <Sphere args={[0.15, 16, 16]} position={[-2.3, 9, 2]}>
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={isHovered ? 2 : 1}
              />
            </Sphere>
            <Sphere args={[0.15, 16, 16]} position={[2.3, 9, 2]}>
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={isHovered ? 2 : 1}
              />
            </Sphere>
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
        // Modern Retail Shop - ENHANCED WITH DETAILS
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
                emissiveIntensity={isHovered ? 0.4 : 0.2}
              />
            </Box>

            {/* Awning with stripes */}
            <Box args={[4.5, 0.2, 1.5]} position={[0, 4, 2]}>
              <meshStandardMaterial
                color="#dc2626"
                roughness={0.9}
                emissive="#dc2626"
                emissiveIntensity={0.2}
              />
            </Box>
            {/* Awning stripes */}
            {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
              <Box
                key={`stripe-${i}`}
                args={[0.3, 0.22, 1.5]}
                position={[x, 4, 2]}
              >
                <meshStandardMaterial color="#ffffff" />
              </Box>
            ))}

            {/* Awning support poles */}
            {[-1.8, 1.8].map((x, i) => (
              <Cylinder
                key={`pole-${i}`}
                args={[0.08, 0.08, 1.5, 8]}
                position={[x, 3.25, 2.5]}
              >
                <meshStandardMaterial color="#78716c" metalness={0.6} />
              </Cylinder>
            ))}

            {/* Large illuminated store sign */}
            <Box args={[3.5, 1, 0.15]} position={[0, 5.5, 1.6]}>
              <meshStandardMaterial
                color="#1e293b"
                emissive="#f59e0b"
                emissiveIntensity={isHovered ? 1 : 0.7}
              />
            </Box>
            {/* Sign border lights */}
            {[...Array(12)].map((_, i) => (
              <mesh
                key={`signlight-${i}`}
                position={[
                  (i % 6) * 0.6 - 1.5,
                  5.5 + (Math.floor(i / 6) === 0 ? 0.5 : -0.5),
                  1.65,
                ]}
              >
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial
                  color="#fbbf24"
                  emissive="#fbbf24"
                  emissiveIntensity={isHovered ? 1.5 : 1}
                />
              </mesh>
            ))}

            {/* Large display windows */}
            <Box args={[1.6, 2.2, 0.12]} position={[-1.1, 2.6, 1.58]}>
              <meshStandardMaterial
                color="#7dd3fc"
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={0.85}
                emissive="#0ea5e9"
                emissiveIntensity={0.3}
              />
            </Box>
            <Box args={[1.6, 2.2, 0.12]} position={[1.1, 2.6, 1.58]}>
              <meshStandardMaterial
                color="#7dd3fc"
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={0.85}
                emissive="#0ea5e9"
                emissiveIntensity={0.3}
              />
            </Box>

            {/* Window frames */}
            {[-1.1, 1.1].map((x, i) => (
              <group key={`frame-${i}`}>
                <Box args={[1.7, 0.1, 0.08]} position={[x, 3.7, 1.62]}>
                  <meshStandardMaterial color="#475569" />
                </Box>
                <Box args={[1.7, 0.1, 0.08]} position={[x, 1.5, 1.62]}>
                  <meshStandardMaterial color="#475569" />
                </Box>
                <Box args={[0.1, 2.3, 0.08]} position={[x - 0.8, 2.6, 1.62]}>
                  <meshStandardMaterial color="#475569" />
                </Box>
                <Box args={[0.1, 2.3, 0.08]} position={[x + 0.8, 2.6, 1.62]}>
                  <meshStandardMaterial color="#475569" />
                </Box>
              </group>
            ))}

            {/* Entrance door with glass */}
            <Box args={[0.9, 2.2, 0.12]} position={[0, 1.1, 1.58]}>
              <meshStandardMaterial
                color="#64748b"
                metalness={0.8}
                roughness={0.3}
              />
            </Box>
            {/* Door glass panel */}
            <Box args={[0.7, 1.6, 0.08]} position={[0, 1.3, 1.62]}>
              <meshStandardMaterial
                color="#7dd3fc"
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={0.7}
              />
            </Box>

            {/* Rooftop sign/billboard */}
            <Box args={[2.5, 0.8, 0.1]} position={[0, 5.8, 0]}>
              <meshStandardMaterial
                color="#1e293b"
                emissive="#f59e0b"
                emissiveIntensity={0.5}
              />
            </Box>

            {/* Corner accent lights */}
            {[
              [2, 1.5],
              [-2, 1.5],
              [2, -1.5],
              [-2, -1.5],
            ].map((pos, i) => (
              <mesh key={`accent-${i}`} position={[pos[0], 4.8, pos[1]]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial
                  color="#f59e0b"
                  emissive="#f59e0b"
                  emissiveIntensity={1.2}
                />
              </mesh>
            ))}

            {/* Decorative top lights */}
            {[...Array(8)].map((_, i) => (
              <mesh
                key={`toplight-${i}`}
                position={[(i - 3.5) * 0.6, 5.1, 1.6]}
              >
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial
                  color="#fbbf24"
                  emissive="#fbbf24"
                  emissiveIntensity={0.8}
                />
              </mesh>
            ))}
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
        // Crypto Token Mint - Futuristic Vault - ENHANCED - SCALED UP
        return (
          <group scale={1.8}>
            {/* Base platform */}
            <Cylinder args={[3, 3.2, 1, 8]} position={[0, 0.5, 0]} castShadow>
              <meshStandardMaterial
                color="#713f12"
                metalness={0.8}
                roughness={0.3}
              />
            </Cylinder>

            {/* Main vault cylinder */}
            <Cylinder
              args={[2.2, 2.5, 7, 16]}
              position={[0, 4.5, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#ca8a04"
                metalness={0.95}
                roughness={0.15}
                emissive={color}
                emissiveIntensity={isHovered ? 0.5 : 0.3}
              />
            </Cylinder>

            {/* Vault door - circular */}
            <Cylinder
              args={[1.2, 1.2, 0.3, 32]}
              position={[0, 4, 2.4]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial
                color="#1e293b"
                metalness={0.9}
                roughness={0.2}
              />
            </Cylinder>
            {/* Door wheel handle */}
            <group position={[0, 4, 2.55]} rotation={[Math.PI / 2, 0, 0]}>
              <Cylinder args={[0.5, 0.5, 0.1, 6]} position={[0, 0, 0]}>
                <meshStandardMaterial
                  color="#fbbf24"
                  metalness={1}
                  roughness={0}
                  emissive="#fbbf24"
                  emissiveIntensity={0.5}
                />
              </Cylinder>
              {/* Wheel spokes */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Box
                  key={i}
                  args={[0.1, 0.5, 0.1]}
                  position={[
                    Math.cos((i / 6) * Math.PI * 2) * 0.25,
                    Math.sin((i / 6) * Math.PI * 2) * 0.25,
                    0,
                  ]}
                  rotation={[0, 0, (i / 6) * Math.PI * 2]}
                >
                  <meshStandardMaterial
                    color="#fbbf24"
                    metalness={1}
                    roughness={0}
                  />
                </Box>
              ))}
            </group>

            {/* Golden reinforcement rings around vault */}
            {[1.5, 3.5, 5.5, 7.5].map((y, i) => (
              <Cylinder key={i} args={[2.3, 2.6, 0.4, 16]} position={[0, y, 0]}>
                <meshStandardMaterial
                  color="#fbbf24"
                  metalness={1}
                  roughness={0.1}
                  emissive="#fbbf24"
                  emissiveIntensity={0.4}
                />
              </Cylinder>
            ))}

            {/* Top dome - golden */}
            <Sphere
              args={[2.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
              position={[0, 8, 0]}
            >
              <meshStandardMaterial
                color="#fbbf24"
                metalness={1}
                roughness={0.05}
                emissive="#fbbf24"
                emissiveIntensity={isHovered ? 0.6 : 0.4}
              />
            </Sphere>

            {/* Coin symbol on top */}
            <Cylinder args={[0.8, 0.8, 0.2, 32]} position={[0, 9.5, 0]}>
              <meshStandardMaterial
                color="#fef08a"
                metalness={1}
                roughness={0}
                emissive="#fef08a"
                emissiveIntensity={0.8}
              />
            </Cylinder>
            {/* $ or ₿ symbol */}
            <Box args={[0.15, 0.8, 0.1]} position={[0, 9.6, 0]}>
              <meshStandardMaterial color="#1e293b" />
            </Box>
            <Box args={[0.5, 0.15, 0.1]} position={[0, 9.8, 0]}>
              <meshStandardMaterial color="#1e293b" />
            </Box>
            <Box args={[0.5, 0.15, 0.1]} position={[0, 9.4, 0]}>
              <meshStandardMaterial color="#1e293b" />
            </Box>

            {/* Security lights around base */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Sphere
                key={i}
                args={[0.12, 16, 16]}
                position={[
                  Math.cos((i / 8) * Math.PI * 2) * 2.8,
                  1,
                  Math.sin((i / 8) * Math.PI * 2) * 2.8,
                ]}
              >
                <meshStandardMaterial
                  color="#3b82f6"
                  emissive="#3b82f6"
                  emissiveIntensity={isHovered ? 1.5 : 0.8}
                />
              </Sphere>
            ))}

            {/* Decorative pillars at corners */}
            {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
              <Box
                key={`pillar-${i}`}
                args={[0.3, 3, 0.3]}
                position={[Math.cos(angle) * 2.6, 2.5, Math.sin(angle) * 2.6]}
                castShadow
              >
                <meshStandardMaterial
                  color="#78716c"
                  metalness={0.6}
                  roughness={0.4}
                />
              </Box>
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
