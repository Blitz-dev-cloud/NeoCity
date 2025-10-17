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

// Dummy Building component - proper building structure with windows
function DummyBuilding({
  position,
  color,
  width = 4,
  height = 5,
  depth = 3.5,
}: {
  position: [number, number, number];
  color: string;
  width?: number;
  height?: number;
  depth?: number;
}) {
  return (
    <group position={position}>
      {/* Main building */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {/* Windows - front face */}
      {[...Array(Math.floor(height / 1.5))].map((_, floor) =>
        [...Array(Math.floor(width / 1.5))].map((_, col) => (
          <mesh
            key={`front-${floor}-${col}`}
            position={[
              (col - Math.floor(width / 1.5) / 2) * 1.2,
              floor * 1.5 + 1,
              depth / 2 + 0.02,
            ]}
          >
            <boxGeometry args={[0.6, 0.8, 0.05]} />
            <meshStandardMaterial
              color="#87ceeb"
              emissive="#60a5fa"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))
      )}

      {/* Roof */}
      <mesh position={[0, height + 0.2, 0]}>
        <boxGeometry args={[width + 0.2, 0.4, depth + 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
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

      {/* SYSTEMATIC DUMMY BUILDINGS - Organized in grid patches, NO COLLISIONS */}

      {/* FAR NW QUADRANT (x: -70 to -40, z: -70 to -40) - around Bank [-52, -52] */}
      <DummyBuilding
        position={[-60, 0, -60]}
        color="#e74c3c"
        width={4}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[-60, 0, -52]}
        color="#3498db"
        width={3.5}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[-60, 0, -44]}
        color="#9b59b6"
        width={4.5}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[-44, 0, -60]}
        color="#f39c12"
        width={3}
        height={6.5}
        depth={4}
      />
      <DummyBuilding
        position={[-44, 0, -52]}
        color="#1abc9c"
        width={4}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[-44, 0, -44]}
        color="#e67e22"
        width={3.5}
        height={5.5}
        depth={3.5}
      />

      {/* FAR NE QUADRANT (x: 40 to 70, z: -70 to -40) - around Shop [52, -52] */}
      <DummyBuilding
        position={[60, 0, -60]}
        color="#2ecc71"
        width={4}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[60, 0, -52]}
        color="#95a5a6"
        width={3.5}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[60, 0, -44]}
        color="#34495e"
        width={4.5}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[44, 0, -60]}
        color="#16a085"
        width={3}
        height={6.5}
        depth={4}
      />
      <DummyBuilding
        position={[44, 0, -52]}
        color="#c0392b"
        width={4}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[44, 0, -44]}
        color="#2980b9"
        width={3.5}
        height={5.5}
        depth={3.5}
      />

      {/* FAR SW QUADRANT (x: -70 to -40, z: 40 to 70) - around Hospital [-52, 52] */}
      <DummyBuilding
        position={[-60, 0, 60]}
        color="#8e44ad"
        width={4}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[-60, 0, 52]}
        color="#d35400"
        width={3.5}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[-60, 0, 44]}
        color="#27ae60"
        width={4.5}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[-44, 0, 60]}
        color="#f1c40f"
        width={3}
        height={6.5}
        depth={4}
      />
      <DummyBuilding
        position={[-44, 0, 52]}
        color="#e74c3c"
        width={4}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[-44, 0, 44]}
        color="#3498db"
        width={3.5}
        height={5.5}
        depth={3.5}
      />

      {/* FAR SE QUADRANT (x: 40 to 70, z: 40 to 70) - around Traffic [62, 62] */}
      <DummyBuilding
        position={[70, 0, 70]}
        color="#9b59b6"
        width={4}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[70, 0, 62]}
        color="#1abc9c"
        width={4}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[70, 0, 54]}
        color="#e67e22"
        width={3.5}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[54, 0, 70]}
        color="#95a5a6"
        width={4.5}
        height={6}
        depth={4}
      />
      {/* Keep some space around Traffic [62, 62] */}

      {/* WEST STRIP (x: -70 to -40, z: -30 to 30) */}
      <DummyBuilding
        position={[-60, 0, -20]}
        color="#e67e22"
        width={4}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[-52, 0, -20]}
        color="#95a5a6"
        width={3.5}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[-44, 0, -20]}
        color="#34495e"
        width={4.5}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[-60, 0, -10]}
        color="#16a085"
        width={3}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[-52, 0, -10]}
        color="#c0392b"
        width={4}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[-44, 0, -10]}
        color="#2980b9"
        width={3.5}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[-60, 0, 10]}
        color="#8e44ad"
        width={4.5}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[-52, 0, 10]}
        color="#d35400"
        width={3}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[-44, 0, 10]}
        color="#27ae60"
        width={4}
        height={6}
        depth={3.5}
      />
      <DummyBuilding
        position={[-60, 0, 20]}
        color="#f1c40f"
        width={3.5}
        height={5.5}
        depth={3}
      />
      <DummyBuilding
        position={[-52, 0, 20]}
        color="#e74c3c"
        width={4.5}
        height={5}
        depth={4}
      />
      <DummyBuilding
        position={[-44, 0, 20]}
        color="#3498db"
        width={3}
        height={6}
        depth={3.5}
      />

      {/* EAST STRIP (x: 40 to 70, z: -30 to 30) */}
      <DummyBuilding
        position={[60, 0, -20]}
        color="#27ae60"
        width={4}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[52, 0, -20]}
        color="#f1c40f"
        width={3.5}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[44, 0, -20]}
        color="#e74c3c"
        width={4.5}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[60, 0, -10]}
        color="#3498db"
        width={3}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[52, 0, -10]}
        color="#9b59b6"
        width={4}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[44, 0, -10]}
        color="#1abc9c"
        width={3.5}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[60, 0, 10]}
        color="#e67e22"
        width={4.5}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[52, 0, 10]}
        color="#95a5a6"
        width={3}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[44, 0, 10]}
        color="#34495e"
        width={4}
        height={6}
        depth={3.5}
      />
      <DummyBuilding
        position={[60, 0, 20]}
        color="#16a085"
        width={3.5}
        height={5.5}
        depth={3}
      />
      <DummyBuilding
        position={[52, 0, 20]}
        color="#c0392b"
        width={4.5}
        height={5}
        depth={4}
      />
      <DummyBuilding
        position={[44, 0, 20]}
        color="#2980b9"
        width={3}
        height={6}
        depth={3.5}
      />

      {/* NORTH STRIP (x: -30 to 30, z: -70 to -40) */}
      <DummyBuilding
        position={[-20, 0, -60]}
        color="#34495e"
        width={4}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[-20, 0, -52]}
        color="#16a085"
        width={3.5}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[-20, 0, -44]}
        color="#c0392b"
        width={4.5}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[-10, 0, -60]}
        color="#2980b9"
        width={3}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[-10, 0, -52]}
        color="#8e44ad"
        width={4}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[-10, 0, -44]}
        color="#d35400"
        width={3.5}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[10, 0, -60]}
        color="#27ae60"
        width={4.5}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[10, 0, -52]}
        color="#f1c40f"
        width={3}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[10, 0, -44]}
        color="#e74c3c"
        width={4}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[20, 0, -60]}
        color="#3498db"
        width={3.5}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[20, 0, -52]}
        color="#9b59b6"
        width={4}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[20, 0, -44]}
        color="#1abc9c"
        width={3}
        height={6}
        depth={4}
      />

      {/* SOUTH STRIP (x: -30 to 30, z: 40 to 70) */}
      <DummyBuilding
        position={[-20, 0, 60]}
        color="#e67e22"
        width={4}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[-20, 0, 52]}
        color="#95a5a6"
        width={3.5}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[-20, 0, 44]}
        color="#34495e"
        width={4.5}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[-10, 0, 60]}
        color="#16a085"
        width={3}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[-10, 0, 52]}
        color="#c0392b"
        width={4}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[-10, 0, 44]}
        color="#2980b9"
        width={3.5}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[10, 0, 60]}
        color="#8e44ad"
        width={4.5}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[10, 0, 52]}
        color="#d35400"
        width={3}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[10, 0, 44]}
        color="#27ae60"
        width={4}
        height={6}
        depth={4}
      />
      <DummyBuilding
        position={[20, 0, 60]}
        color="#f1c40f"
        width={3.5}
        height={5.5}
        depth={3.5}
      />
      <DummyBuilding
        position={[20, 0, 52]}
        color="#e74c3c"
        width={4}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[20, 0, 44]}
        color="#3498db"
        width={3}
        height={6}
        depth={4}
      />

      {/* INNER NW QUADRANT (x: -30 to -10, z: -30 to -10) - around City Hall [-17, -17] */}
      <DummyBuilding
        position={[-25, 0, -25]}
        color="#9b59b6"
        width={3}
        height={4.5}
        depth={3}
      />
      <DummyBuilding
        position={[-25, 0, -10]}
        color="#1abc9c"
        width={3.5}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[-10, 0, -25]}
        color="#e67e22"
        width={3}
        height={4.5}
        depth={3}
      />

      {/* INNER NE QUADRANT (x: 10 to 30, z: -30 to -10) - around Grievance [17, -17] */}
      <DummyBuilding
        position={[25, 0, -25]}
        color="#95a5a6"
        width={3}
        height={4.5}
        depth={3}
      />
      <DummyBuilding
        position={[25, 0, -10]}
        color="#34495e"
        width={3.5}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[10, 0, -25]}
        color="#16a085"
        width={3}
        height={4.5}
        depth={3}
      />

      {/* INNER SW QUADRANT (x: -30 to -10, z: 10 to 30) - around Token [-17, 17] */}
      <DummyBuilding
        position={[-25, 0, 25]}
        color="#c0392b"
        width={3}
        height={4.5}
        depth={3}
      />
      <DummyBuilding
        position={[-25, 0, 10]}
        color="#2980b9"
        width={3.5}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[-10, 0, 25]}
        color="#8e44ad"
        width={3}
        height={4.5}
        depth={3}
      />

      {/* INNER SE QUADRANT (x: 10 to 30, z: 10 to 30) - around Farm [17, 17] - SPARSE */}
      <DummyBuilding
        position={[25, 0, 25]}
        color="#d35400"
        width={3}
        height={4.5}
        depth={3}
      />
      <DummyBuilding
        position={[25, 0, 10]}
        color="#27ae60"
        width={3.5}
        height={5}
        depth={3}
      />
      <DummyBuilding
        position={[10, 0, 25]}
        color="#f1c40f"
        width={3}
        height={4.5}
        depth={3}
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
