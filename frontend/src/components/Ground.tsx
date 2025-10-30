"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Simple procedural tree component
function Tree({ position }: { position: [number, number, number] }) {
  const treeHeight = 4;

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, treeHeight / 4, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.5, treeHeight / 2, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Foliage - bottom layer */}
      <mesh position={[0, treeHeight / 2 + 0.8, 0]} castShadow>
        <coneGeometry args={[1.5, 2, 8]} />
        <meshStandardMaterial color="#228B22" roughness={0.7} />
      </mesh>
      {/* Foliage - middle layer */}
      <mesh position={[0, treeHeight / 2 + 1.8, 0]} castShadow>
        <coneGeometry args={[1.2, 1.6, 8]} />
        <meshStandardMaterial color="#32CD32" roughness={0.7} />
      </mesh>
      {/* Foliage - top layer */}
      <mesh position={[0, treeHeight / 2 + 2.6, 0]} castShadow>
        <coneGeometry args={[0.8, 1.2, 8]} />
        <meshStandardMaterial color="#3CB371" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Animated Traffic Signal component
function TrafficSignal({
  position,
  delay = 0,
}: {
  position: [number, number, number];
  delay?: number;
}) {
  const redLightRef = useRef<THREE.Mesh>(null);
  const yellowLightRef = useRef<THREE.Mesh>(null);
  const greenLightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime + delay;
    const cycle = time % 9; // 9 second cycle

    if (
      redLightRef.current &&
      yellowLightRef.current &&
      greenLightRef.current
    ) {
      // Red: 0-3 seconds
      if (cycle < 3) {
        (
          redLightRef.current.material as THREE.MeshStandardMaterial
        ).emissive.setHex(0xff0000);
        (
          redLightRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 1.0;
        (
          yellowLightRef.current.material as THREE.MeshStandardMaterial
        ).emissive.setHex(0x000000);
        (
          yellowLightRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 0;
        (
          greenLightRef.current.material as THREE.MeshStandardMaterial
        ).emissive.setHex(0x000000);
        (
          greenLightRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 0;
      }
      // Yellow: 3-4.5 seconds
      else if (cycle < 4.5) {
        (
          redLightRef.current.material as THREE.MeshStandardMaterial
        ).emissive.setHex(0x000000);
        (
          redLightRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 0;
        (
          yellowLightRef.current.material as THREE.MeshStandardMaterial
        ).emissive.setHex(0xffff00);
        (
          yellowLightRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 1.0;
        (
          greenLightRef.current.material as THREE.MeshStandardMaterial
        ).emissive.setHex(0x000000);
        (
          greenLightRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 0;
      }
      // Green: 4.5-9 seconds
      else {
        (
          redLightRef.current.material as THREE.MeshStandardMaterial
        ).emissive.setHex(0x000000);
        (
          redLightRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 0;
        (
          yellowLightRef.current.material as THREE.MeshStandardMaterial
        ).emissive.setHex(0x000000);
        (
          yellowLightRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 0;
        (
          greenLightRef.current.material as THREE.MeshStandardMaterial
        ).emissive.setHex(0x00ff00);
        (
          greenLightRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 1.0;
      }
    }
  });

  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} />
      </mesh>
      {/* Signal box */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Red light */}
      <mesh ref={redLightRef} position={[0, 4.8, 0.16]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial
          color="#330000"
          emissive="#ff0000"
          emissiveIntensity={0}
        />
      </mesh>
      {/* Yellow light */}
      <mesh ref={yellowLightRef} position={[0, 4.5, 0.16]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial
          color="#333300"
          emissive="#ffff00"
          emissiveIntensity={0}
        />
      </mesh>
      {/* Green light */}
      <mesh ref={greenLightRef} position={[0, 4.2, 0.16]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial
          color="#003300"
          emissive="#00ff00"
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  );
}

// Dummy Building component - Optimized with window details
function DummyBuilding({
  position,
  color,
  width = 5,
  height = 8,
  depth = 4.5,
}: {
  position: [number, number, number];
  color: string;
  width?: number;
  height?: number;
  depth?: number;
}) {
  const floors = Math.floor(height / 1.8);
  const windowsPerRow = Math.floor(width / 1.2);

  return (
    <group position={position}>
      {/* Main building with emissive glow */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          roughness={0.6}
          metalness={0.2}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Windows - Front Face Only (optimized) */}
      {[...Array(floors)].map((_, floor) =>
        [...Array(windowsPerRow)].map((_, col) => (
          <mesh
            key={`w-${floor}-${col}`}
            position={[
              (col - windowsPerRow / 2 + 0.5) * 1.2,
              floor * 1.8 + 1.5,
              depth / 2 + 0.02,
            ]}
          >
            <planeGeometry args={[0.7, 1]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.7} />
          </mesh>
        ))
      )}

      {/* Side window hints - just 2 planes for performance */}
      <mesh
        position={[width / 2 + 0.01, height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[depth * 0.8, height * 0.85]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
      </mesh>
      <mesh
        position={[-width / 2 - 0.01, height / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[depth * 0.8, height * 0.85]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
      </mesh>

      {/* Roof with edge detail */}
      <mesh position={[0, height + 0.25, 0]} castShadow>
        <boxGeometry args={[width + 0.3, 0.5, depth + 0.3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Corner accent lights - 4 small lights */}
      {[
        [width / 2 - 0.2, depth / 2 - 0.2],
        [-width / 2 + 0.2, depth / 2 - 0.2],
        [width / 2 - 0.2, -depth / 2 + 0.2],
        [-width / 2 + 0.2, -depth / 2 + 0.2],
      ].map((pos, i) => (
        <mesh key={`light-${i}`} position={[pos[0], height + 0.4, pos[1]]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}
    </group>
  );
}

// Street Lamp component
function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 6, 8]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} />
      </mesh>
      {/* Lamp head */}
      <mesh position={[0, 5.8, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial color="#FFF8DC" />
      </mesh>
      {/* Lamp housing */}
      <mesh position={[0, 5.5, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.5, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} />
      </mesh>
    </group>
  );
}

// Park Bench component
function ParkBench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.8, 0.1, 0.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.9, -0.2]}>
        <boxGeometry args={[1.8, 0.6, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Legs */}
      {[-0.7, 0.7].map((x, i) => (
        <mesh key={i} position={[x, 0.25, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.4]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// Fountain component
function Fountain({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[2.5, 2.8, 0.6, 12]} />
        <meshStandardMaterial color="#bfdbfe" metalness={0.3} />
      </mesh>
      {/* Middle tier */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[1.5, 1.7, 0.4, 12]} />
        <meshStandardMaterial color="#93c5fd" metalness={0.3} />
      </mesh>
      {/* Top tier */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.8, 1.0, 0.3, 12]} />
        <meshStandardMaterial color="#60a5fa" metalness={0.3} />
      </mesh>
      {/* Water spray effect */}
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// Traffic Cone component
function TrafficCone({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      {/* White stripe */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// Bus Stop component
function BusStop({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} />
      </mesh>
      {/* Sign */}
      <mesh position={[0, 2.8, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.05]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      {/* Bench shelter roof */}
      <mesh position={[0.5, 2.5, 0]}>
        <boxGeometry args={[1.5, 0.05, 1.2]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// Haystack component for farm
function Haystack({ position }: { position: [number, number] }) {
  return (
    <group position={[position[0], 0, position[1]]}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.9, 1.0, 1, 8]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>
      {/* Top */}
      <mesh position={[0, 1.3, 0]}>
        <coneGeometry args={[1.0, 0.6, 8]} />
        <meshStandardMaterial color="#D2B48C" />
      </mesh>
    </group>
  );
}

export function Ground() {
  return (
    <group>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#2d5a2d" roughness={0.9} />
      </mesh>

      {/* Main Roads - Cross Pattern */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 150]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.6} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[150, 10]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.6} />
      </mesh>

      {/* Secondary Roads - Fewer roads */}
      {/* Vertical Roads */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-35, 0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 150]} />
        <meshStandardMaterial color="#3d4f5e" roughness={0.6} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[35, 0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 150]} />
        <meshStandardMaterial color="#3d4f5e" roughness={0.6} />
      </mesh>

      {/* Horizontal Roads */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, -35]}
        receiveShadow
      >
        <planeGeometry args={[150, 8]} />
        <meshStandardMaterial color="#3d4f5e" roughness={0.6} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 35]}
        receiveShadow
      >
        <planeGeometry args={[150, 8]} />
        <meshStandardMaterial color="#3d4f5e" roughness={0.6} />
      </mesh>

      {/* Trees on green patches only - avoiding all roads and buildings */}
      {/* Far corners - clustered */}
      <Tree position={[-65, 0, -65]} />
      <Tree position={[-63, 0, -68]} />
      <Tree position={[-68, 0, -63]} />
      <Tree position={[65, 0, -65]} />
      <Tree position={[63, 0, -68]} />
      <Tree position={[68, 0, -63]} />
      <Tree position={[-65, 0, 65]} />
      <Tree position={[-63, 0, 68]} />
      <Tree position={[-68, 0, 63]} />
      <Tree position={[65, 0, 65]} />
      <Tree position={[63, 0, 68]} />
      <Tree position={[68, 0, 63]} />

      {/* Outer quadrants - scattered away from buildings */}
      <Tree position={[-42, 0, -45]} />
      <Tree position={[-45, 0, -42]} />
      <Tree position={[42, 0, -45]} />
      <Tree position={[45, 0, -42]} />
      <Tree position={[-42, 0, 45]} />
      <Tree position={[-45, 0, 42]} />

      {/* Along edges */}
      <Tree position={[-70, 0, -20]} />
      <Tree position={[-70, 0, -10]} />
      <Tree position={[-70, 0, 10]} />
      <Tree position={[-70, 0, 20]} />
      <Tree position={[70, 0, -20]} />
      <Tree position={[70, 0, -10]} />
      <Tree position={[70, 0, 10]} />
      <Tree position={[70, 0, 20]} />
      <Tree position={[-20, 0, -70]} />
      <Tree position={[-10, 0, -70]} />
      <Tree position={[10, 0, -70]} />
      <Tree position={[20, 0, -70]} />
      <Tree position={[-20, 0, 70]} />
      <Tree position={[-10, 0, 70]} />
      <Tree position={[10, 0, 70]} />
      <Tree position={[20, 0, 70]} />

      {/* Inner quadrants - between roads, avoiding main buildings */}
      <Tree position={[-12, 0, -27]} />
      <Tree position={[-27, 0, -12]} />
      <Tree position={[12, 0, -27]} />
      <Tree position={[27, 0, -12]} />
      <Tree position={[-12, 0, 27]} />
      <Tree position={[-27, 0, 12]} />
      <Tree position={[12, 0, 12]} />
      <Tree position={[27, 0, 27]} />

      {/* Dense forest around farm area (SE corner at [52, 52]) */}
      <Tree position={[42, 0, 40]} />
      <Tree position={[40, 0, 42]} />
      <Tree position={[45, 0, 45]} />
      <Tree position={[38, 0, 48]} />
      <Tree position={[48, 0, 38]} />
      <Tree position={[42, 0, 62]} />
      <Tree position={[45, 0, 65]} />
      <Tree position={[40, 0, 68]} />
      <Tree position={[62, 0, 42]} />
      <Tree position={[65, 0, 45]} />
      <Tree position={[68, 0, 40]} />
      <Tree position={[58, 0, 65]} />
      <Tree position={[65, 0, 58]} />
      <Tree position={[70, 0, 52]} />
      <Tree position={[52, 0, 70]} />
      <Tree position={[48, 0, 70]} />
      <Tree position={[70, 0, 48]} />

      {/* Traffic Signals on ALL roadsides at regular intervals */}
      {/* Main vertical road (x=0) */}
      <TrafficSignal position={[6, 0, -60]} delay={0} />
      <TrafficSignal position={[6, 0, -45]} delay={3} />
      <TrafficSignal position={[6, 0, -25]} delay={6} />
      <TrafficSignal position={[6, 0, 25]} delay={0} />
      <TrafficSignal position={[6, 0, 45]} delay={3} />
      <TrafficSignal position={[6, 0, 60]} delay={6} />

      {/* Main horizontal road (z=0) */}
      <TrafficSignal position={[-60, 0, 6]} delay={0} />
      <TrafficSignal position={[-45, 0, 6]} delay={3} />
      <TrafficSignal position={[-25, 0, 6]} delay={6} />
      <TrafficSignal position={[25, 0, 6]} delay={0} />
      <TrafficSignal position={[45, 0, 6]} delay={3} />
      <TrafficSignal position={[60, 0, 6]} delay={6} />

      {/* Left vertical road (x=-35) */}
      <TrafficSignal position={[-40, 0, -50]} delay={2} />
      <TrafficSignal position={[-40, 0, -25]} delay={5} />
      <TrafficSignal position={[-40, 0, 25]} delay={1} />
      <TrafficSignal position={[-40, 0, 50]} delay={4} />

      {/* Right vertical road (x=35) */}
      <TrafficSignal position={[40, 0, -50]} delay={2} />
      <TrafficSignal position={[40, 0, -25]} delay={5} />
      <TrafficSignal position={[40, 0, 25]} delay={1} />
      <TrafficSignal position={[40, 0, 50]} delay={4} />

      {/* Top horizontal road (z=-35) */}
      <TrafficSignal position={[-50, 0, -40]} delay={1} />
      <TrafficSignal position={[-25, 0, -40]} delay={4} />
      <TrafficSignal position={[25, 0, -40]} delay={2} />
      <TrafficSignal position={[50, 0, -40]} delay={5} />

      {/* Bottom horizontal road (z=35) */}
      <TrafficSignal position={[-50, 0, 40]} delay={1} />
      <TrafficSignal position={[-25, 0, 40]} delay={4} />
      <TrafficSignal position={[25, 0, 40]} delay={2} />
      <TrafficSignal position={[50, 0, 40]} delay={5} />

      {/* Street Lamps along main roads */}
      <StreetLamp position={[-8, 0, -60]} />
      <StreetLamp position={[-8, 0, -40]} />
      <StreetLamp position={[-8, 0, -20]} />
      <StreetLamp position={[-8, 0, 0]} />
      <StreetLamp position={[-8, 0, 20]} />
      <StreetLamp position={[-8, 0, 40]} />
      <StreetLamp position={[-8, 0, 60]} />
      
      <StreetLamp position={[8, 0, -60]} />
      <StreetLamp position={[8, 0, -40]} />
      <StreetLamp position={[8, 0, -20]} />
      <StreetLamp position={[8, 0, 20]} />
      <StreetLamp position={[8, 0, 40]} />
      <StreetLamp position={[8, 0, 60]} />

      <StreetLamp position={[-60, 0, -8]} />
      <StreetLamp position={[-40, 0, -8]} />
      <StreetLamp position={[-20, 0, -8]} />
      <StreetLamp position={[20, 0, -8]} />
      <StreetLamp position={[40, 0, -8]} />
      <StreetLamp position={[60, 0, -8]} />

      {/* Park Benches in green areas */}
      <ParkBench position={[-65, 0, -50]} />
      <ParkBench position={[-50, 0, -65]} />
      <ParkBench position={[65, 0, -50]} />
      <ParkBench position={[50, 0, -65]} />
      <ParkBench position={[-65, 0, 50]} />
      <ParkBench position={[65, 0, 50]} />

      {/* Fountain in central park area */}
      <Fountain position={[-25, 0, 25]} />

      {/* Bus Stops at key locations */}
      <BusStop position={[-12, 0, -8]} />
      <BusStop position={[12, 0, 8]} />
      <BusStop position={[-45, 0, -8]} />
      <BusStop position={[45, 0, 8]} />

      {/* Traffic Cones for construction/detail */}
      <TrafficCone position={[30, 0, -12]} />
      <TrafficCone position={[30, 0, -13]} />
      <TrafficCone position={[-30, 0, 12]} />
      <TrafficCone position={[-30, 0, 13]} />

      {/* SYSTEMATIC DUMMY BUILDINGS - Organized in grid patches, NO COLLISIONS */}

      {/* FAR NW QUADRANT (x: -70 to 40, z: -70 to -40) - around Bank [-52, -52] */}
      <DummyBuilding
        position={[-60, 0, -60]}
        color="#e74c3c"
        width={5}
        height={9.5}
        depth={5}
      />
      <DummyBuilding
        position={[-60, 0, -52]}
        color="#3498db"
        width={4.5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[-60, 0, -44]}
        color="#9b59b6"
        width={5.5}
        height={8}
        depth={4.5}
      />
      <DummyBuilding
        position={[-44, 0, -60]}
        color="#f39c12"
        width={4}
        height={10}
        depth={5}
      />
      <DummyBuilding
        position={[-44, 0, -52]}
        color="#1abc9c"
        width={5}
        height={7}
        depth={4}
      />
      <DummyBuilding
        position={[-44, 0, -44]}
        color="#e67e22"
        width={4.5}
        height={8.5}
        depth={4.5}
      />

      {/* FAR NE QUADRANT (x: 40 to 70, z: -70 to -40) - around Shop [52, -52] */}
      <DummyBuilding
        position={[60, 0, -60]}
        color="#2ecc71"
        width={5}
        height={9}
        depth={5}
      />
      <DummyBuilding
        position={[60, 0, -52]}
        color="#95a5a6"
        width={4.5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[60, 0, -44]}
        color="#34495e"
        width={5.5}
        height={8.5}
        depth={4.5}
      />
      <DummyBuilding
        position={[44, 0, -60]}
        color="#16a085"
        width={4}
        height={9.5}
        depth={5}
      />
      <DummyBuilding
        position={[44, 0, -52]}
        color="#c0392b"
        width={5}
        height={7}
        depth={4}
      />
      <DummyBuilding
        position={[44, 0, -44]}
        color="#2980b9"
        width={4.5}
        height={8}
        depth={4.5}
      />

      {/* FAR SW QUADRANT (x: -70 to -40, z: 40 to 70) - around Hospital [-52, 52] */}
      <DummyBuilding
        position={[-60, 0, 60]}
        color="#8e44ad"
        width={5}
        height={9}
        depth={5}
      />
      <DummyBuilding
        position={[-60, 0, 52]}
        color="#d35400"
        width={4.5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[-60, 0, 44]}
        color="#27ae60"
        width={5.5}
        height={8}
        depth={4.5}
      />
      <DummyBuilding
        position={[-44, 0, 60]}
        color="#f1c40f"
        width={4}
        height={10}
        depth={5}
      />
      <DummyBuilding
        position={[-44, 0, 52]}
        color="#e74c3c"
        width={5}
        height={7}
        depth={4}
      />
      <DummyBuilding
        position={[-44, 0, 44]}
        color="#3498db"
        width={4.5}
        height={8.5}
        depth={4.5}
      />

      {/* FAR SE QUADRANT (x: 40 to 70, z: 40 to 70) - around Traffic [62, 62] */}
      <DummyBuilding
        position={[70, 0, 70]}
        color="#9b59b6"
        width={5}
        height={9.5}
        depth={5}
      />
      <DummyBuilding
        position={[70, 0, 62]}
        color="#1abc9c"
        width={5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[70, 0, 54]}
        color="#e67e22"
        width={4.5}
        height={8}
        depth={4.5}
      />
      <DummyBuilding
        position={[54, 0, 70]}
        color="#95a5a6"
        width={5.5}
        height={9}
        depth={5}
      />
      {/* Keep some space around Traffic [62, 62] */}

      {/* WEST STRIP (x: -70 to -40, z: -30 to 30) */}
      <DummyBuilding
        position={[-60, 0, -20]}
        color="#e67e22"
        width={5}
        height={8.5}
        depth={4.5}
      />
      <DummyBuilding
        position={[-52, 0, -20]}
        color="#95a5a6"
        width={4.5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[-44, 0, -20]}
        color="#34495e"
        width={5.5}
        height={9.5}
        depth={5}
      />
      <DummyBuilding
        position={[-60, 0, -10]}
        color="#16a085"
        width={4}
        height={8}
        depth={4.5}
      />
      <DummyBuilding
        position={[-52, 0, -10]}
        color="#c0392b"
        width={5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[-44, 0, -10]}
        color="#2980b9"
        width={4.5}
        height={9.5}
        depth={5}
      />
      <DummyBuilding
        position={[-60, 0, 10]}
        color="#8e44ad"
        width={5.5}
        height={8.5}
        depth={4.5}
      />
      <DummyBuilding
        position={[-52, 0, 10]}
        color="#d35400"
        width={4}
        height={7}
        depth={4}
      />
      <DummyBuilding
        position={[-44, 0, 10]}
        color="#27ae60"
        width={5}
        height={9}
        depth={4.5}
      />
      <DummyBuilding
        position={[-60, 0, 20]}
        color="#f1c40f"
        width={4.5}
        height={8}
        depth={4}
      />
      <DummyBuilding
        position={[-52, 0, 20]}
        color="#e74c3c"
        width={5.5}
        height={7.5}
        depth={5}
      />
      <DummyBuilding
        position={[-44, 0, 20]}
        color="#3498db"
        width={4}
        height={9.5}
        depth={4.5}
      />

      {/* EAST STRIP (x: 40 to 70, z: -30 to 30) */}
      <DummyBuilding
        position={[60, 0, -20]}
        color="#27ae60"
        width={5}
        height={8.5}
        depth={4.5}
      />
      <DummyBuilding
        position={[52, 0, -20]}
        color="#f1c40f"
        width={4.5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[44, 0, -20]}
        color="#e74c3c"
        width={5.5}
        height={9.5}
        depth={5}
      />
      <DummyBuilding
        position={[60, 0, -10]}
        color="#3498db"
        width={4}
        height={8}
        depth={4.5}
      />
      <DummyBuilding
        position={[52, 0, -10]}
        color="#9b59b6"
        width={5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[44, 0, -10]}
        color="#1abc9c"
        width={4.5}
        height={9}
        depth={5}
      />
      <DummyBuilding
        position={[60, 0, 10]}
        color="#e67e22"
        width={5.5}
        height={8.5}
        depth={4.5}
      />
      <DummyBuilding
        position={[52, 0, 10]}
        color="#95a5a6"
        width={4}
        height={7}
        depth={4}
      />
      <DummyBuilding
        position={[44, 0, 10]}
        color="#34495e"
        width={5}
        height={9.5}
        depth={4.5}
      />
      <DummyBuilding
        position={[60, 0, 20]}
        color="#16a085"
        width={4.5}
        height={8}
        depth={4}
      />
      <DummyBuilding
        position={[52, 0, 20]}
        color="#c0392b"
        width={5.5}
        height={7.5}
        depth={5}
      />
      <DummyBuilding
        position={[44, 0, 20]}
        color="#2980b9"
        width={4}
        height={9}
        depth={4.5}
      />

      {/* NORTH STRIP (x: -30 to 30, z: -70 to -40) */}
      <DummyBuilding
        position={[-20, 0, -60]}
        color="#34495e"
        width={5}
        height={8.5}
        depth={4.5}
      />
      <DummyBuilding
        position={[-20, 0, -52]}
        color="#16a085"
        width={4.5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[-20, 0, -44]}
        color="#c0392b"
        width={5.5}
        height={9.5}
        depth={5}
      />
      <DummyBuilding
        position={[-10, 0, -60]}
        color="#2980b9"
        width={4}
        height={8}
        depth={4.5}
      />
      <DummyBuilding
        position={[-10, 0, -52]}
        color="#8e44ad"
        width={5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[-10, 0, -44]}
        color="#d35400"
        width={4.5}
        height={9}
        depth={5}
      />
      <DummyBuilding
        position={[10, 0, -60]}
        color="#27ae60"
        width={5.5}
        height={8.5}
        depth={4.5}
      />
      <DummyBuilding
        position={[10, 0, -52]}
        color="#f1c40f"
        width={4}
        height={7}
        depth={4}
      />
      <DummyBuilding
        position={[10, 0, -44]}
        color="#e74c3c"
        width={5}
        height={9.5}
        depth={5}
      />
      <DummyBuilding
        position={[20, 0, -60]}
        color="#3498db"
        width={4.5}
        height={8}
        depth={4.5}
      />
      <DummyBuilding
        position={[20, 0, -52]}
        color="#9b59b6"
        width={5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[20, 0, -44]}
        color="#1abc9c"
        width={4}
        height={9}
        depth={5}
      />

      {/* SOUTH STRIP (x: -30 to 30, z: 40 to 70) */}
      <DummyBuilding
        position={[-20, 0, 60]}
        color="#e67e22"
        width={5}
        height={8.5}
        depth={4.5}
      />
      <DummyBuilding
        position={[-20, 0, 52]}
        color="#95a5a6"
        width={4.5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[-20, 0, 44]}
        color="#34495e"
        width={5.5}
        height={9.5}
        depth={5}
      />
      <DummyBuilding
        position={[-10, 0, 60]}
        color="#16a085"
        width={4}
        height={8}
        depth={4.5}
      />
      <DummyBuilding
        position={[-10, 0, 52]}
        color="#c0392b"
        width={5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[-10, 0, 44]}
        color="#2980b9"
        width={4.5}
        height={9}
        depth={5}
      />
      <DummyBuilding
        position={[10, 0, 60]}
        color="#8e44ad"
        width={5.5}
        height={8.5}
        depth={4.5}
      />
      <DummyBuilding
        position={[10, 0, 52]}
        color="#d35400"
        width={4}
        height={7}
        depth={4}
      />
      <DummyBuilding
        position={[10, 0, 44]}
        color="#27ae60"
        width={5}
        height={9.5}
        depth={5}
      />
      <DummyBuilding
        position={[20, 0, 60]}
        color="#f1c40f"
        width={4.5}
        height={8}
        depth={4.5}
      />
      <DummyBuilding
        position={[20, 0, 52]}
        color="#e74c3c"
        width={5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[20, 0, 44]}
        color="#3498db"
        width={4}
        height={9}
        depth={5}
      />

      {/* INNER NW QUADRANT (x: -30 to -10, z: -30 to -10) - around City Hall [-17, -17] */}
      <DummyBuilding
        position={[-25, 0, -25]}
        color="#9b59b6"
        width={4}
        height={7}
        depth={4}
      />
      <DummyBuilding
        position={[-25, 0, -10]}
        color="#1abc9c"
        width={4.5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[-10, 0, -25]}
        color="#e67e22"
        width={4}
        height={7}
        depth={4}
      />

      {/* INNER NE QUADRANT (x: 10 to 30, z: -30 to -10) - around Grievance [17, -17] */}
      <DummyBuilding
        position={[25, 0, -25]}
        color="#95a5a6"
        width={4}
        height={7}
        depth={4}
      />
      <DummyBuilding
        position={[25, 0, -10]}
        color="#34495e"
        width={4.5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[10, 0, -25]}
        color="#16a085"
        width={4}
        height={7}
        depth={4}
      />

      {/* INNER SW QUADRANT (x: -30 to -10, z: 10 to 30) - around Token [-17, 17] */}
      <DummyBuilding
        position={[-25, 0, 25]}
        color="#c0392b"
        width={4}
        height={7}
        depth={4}
      />
      <DummyBuilding
        position={[-25, 0, 10]}
        color="#2980b9"
        width={4.5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[-10, 0, 25]}
        color="#8e44ad"
        width={4}
        height={7}
        depth={4}
      />

      {/* INNER SE QUADRANT (x: 10 to 30, z: 10 to 30) - around Farm [17, 17] - SPARSE */}
      <DummyBuilding
        position={[25, 0, 25]}
        color="#d35400"
        width={4}
        height={7}
        depth={4}
      />
      <DummyBuilding
        position={[25, 0, 10]}
        color="#27ae60"
        width={4.5}
        height={7.5}
        depth={4}
      />
      <DummyBuilding
        position={[10, 0, 25]}
        color="#f1c40f"
        width={4}
        height={7}
        depth={4}
      />

      {/* Farm Expansion - Moved to far SE corner */}
      <group position={[52, 0, 52]}>
        {/* Windmill */}
        <group position={[0, 0, -10]}>
          {/* Tower */}
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[1.2, 1.5, 8, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Roof */}
          <mesh position={[0, 8.5, 0]}>
            <coneGeometry args={[1.7, 1.5, 8]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          {/* Blades - 4 at 90 degree intervals */}
          <mesh position={[0, 5, 1.3]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.3, 4, 0.1]} />
            <meshStandardMaterial color="#F5F5DC" />
          </mesh>
          <mesh position={[0, 5, 1.3]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.3, 4, 0.1]} />
            <meshStandardMaterial color="#F5F5DC" />
          </mesh>
          <mesh position={[0, 5, 1.3]} rotation={[0, 0, Math.PI]}>
            <boxGeometry args={[0.3, 4, 0.1]} />
            <meshStandardMaterial color="#F5F5DC" />
          </mesh>
          <mesh position={[0, 5, 1.3]} rotation={[0, 0, -Math.PI / 2]}>
            <boxGeometry args={[0.3, 4, 0.1]} />
            <meshStandardMaterial color="#F5F5DC" />
          </mesh>
        </group>

        {/* Haystacks scattered around farm */}
        <Haystack position={[-8, -5]} />
        <Haystack position={[-6, -8]} />
        <Haystack position={[6, -6]} />
        <Haystack position={[-7, 4]} />
        <Haystack position={[5, 5]} />
        <Haystack position={[8, -3]} />
        <Haystack position={[-5, 6]} />
      </group>
    </group>
  );
}
