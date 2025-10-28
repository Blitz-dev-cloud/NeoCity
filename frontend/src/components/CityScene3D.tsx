"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense } from "react";
import { Building3D } from "./Building3D";
import { Ground } from "./Ground";
import { CityVehicles } from "./CityVehicles";
import { TrafficLight, TrafficLightController } from "./TrafficLights";

interface CityScene3DProps {
  onBuildingClick: (buildingId: string) => void;
  hoveredBuilding: string | null;
  onBuildingHover: (buildingId: string | null) => void;
}

export function CityScene3D({
  onBuildingClick,
  hoveredBuilding,
  onBuildingHover,
}: CityScene3DProps) {
  // Buildings positioned CENTERED on GREEN patches (avoiding roads)
  // Main roads: x=0 (10 wide: -5 to 5), z=0 (10 wide: -5 to 5)
  // Secondary roads: x=±35 (8 wide: ±31 to ±39), z=±35 (8 wide: ±31 to ±39)
  // Green patch centers: NW(-52,-52), NE(52,-52), SW(-52,52), SE(52,52)
  // Inner patch centers: NW(-17.5,-17.5), NE(17.5,-17.5), SW(-17.5,17.5), SE(17.5,17.5)
  const buildings = [
    {
      id: "cityhall",
      name: "🏛️ City Hall (Identity)",
      position: [-17.5, 0, -17.5] as [number, number, number], // CENTER of NW inner patch
      color: "#A855F7",
      height: 7,
      style: "dome",
    },
    {
      id: "bank",
      name: "🏦 DeFi Bank Tower",
      position: [-52, 0, -52] as [number, number, number], // CENTER of Far NW patch
      color: "#3B82F6",
      height: 10,
      style: "skyscraper",
    },
    {
      id: "hospital",
      name: "🏥 Medical Center",
      position: [-52, 0, 52] as [number, number, number], // CENTER of Far SW patch
      color: "#EF4444",
      height: 7.5,
      style: "hospital",
    },
    {
      id: "shop",
      name: "🏪 Commerce Shop",
      position: [52, 0, -52] as [number, number, number], // CENTER of Far NE patch
      color: "#F59E0B",
      height: 6.5,
      style: "modern",
    },
    {
      id: "traffic",
      name: "🚦 Traffic Control",
      position: [17.5, 0, -17.5] as [number, number, number], // CENTER of NE inner patch
      color: "#14B8A6",
      height: 5,
      style: "tech",
    },
    {
      id: "grievance",
      name: "⚖️ Justice Court",
      position: [17.5, 0, 17.5] as [number, number, number], // CENTER of SE inner patch
      color: "#F97316",
      height: 8.5,
      style: "classical",
    },
    {
      id: "token",
      name: "🪙 Token Mint",
      position: [-17.5, 0, 17.5] as [number, number, number], // CENTER of SW inner patch
      color: "#FBBF24",
      height: 6,
      style: "tower",
    },
    {
      id: "farm",
      name: "🚜 Farm Hub (Supply Chain)",
      position: [52, 0, 52] as [number, number, number], // CENTER of haystacks (windmill at offset)
      color: "#22C55E",
      height: 6,
      style: "warehouse",
    },
  ];

  return (
    <Canvas
      shadows
      className="w-full h-full"
      gl={{ antialias: true, alpha: false }}
      camera={{ position: [50, 35, 50], fov: 60 }}
    >
      <color attach="background" args={["#87CEEB"]} />

      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#a855f7" />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#3b82f6" />

        {/* Stars */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* Ground */}
        <Ground />

        {/* Traffic Light Controller */}
        <TrafficLightController />

        {/* Traffic Lights at Center Intersection */}
        <TrafficLight position={[6, 0, 6]} id="main-h-center" delay={0} />
        <TrafficLight
          position={[-6, 0, -6]}
          id="main-h-center-opposite"
          delay={0}
        />
        <TrafficLight position={[6, 0, -6]} id="main-v-center" delay={5} />
        <TrafficLight
          position={[-6, 0, 6]}
          id="main-v-center-opposite"
          delay={5}
        />

        {/* Traffic Lights at Secondary Intersections */}
        {/* Intersection at (-35, 0) */}
        <TrafficLight position={[-30, 0, 6]} id="sec-h--35" delay={2} />
        <TrafficLight
          position={[-40, 0, -6]}
          id="sec-h--35-opposite"
          delay={2}
        />
        <TrafficLight position={[-30, 0, -6]} id="sec-v--35" delay={7} />
        <TrafficLight
          position={[-40, 0, 6]}
          id="sec-v--35-opposite"
          delay={7}
        />

        {/* Intersection at (35, 0) */}
        <TrafficLight position={[40, 0, 6]} id="sec-h-35" delay={2} />
        <TrafficLight position={[30, 0, -6]} id="sec-h-35-opposite" delay={2} />
        <TrafficLight position={[40, 0, -6]} id="sec-v-35" delay={7} />
        <TrafficLight position={[30, 0, 6]} id="sec-v-35-opposite" delay={7} />

        {/* Intersection at (0, -35) */}
        <TrafficLight position={[6, 0, -30]} id="sec-h-0--35" delay={3} />
        <TrafficLight
          position={[-6, 0, -40]}
          id="sec-h-0--35-opposite"
          delay={3}
        />

        {/* Intersection at (0, 35) */}
        <TrafficLight position={[6, 0, 40]} id="sec-h-0-35" delay={3} />
        <TrafficLight
          position={[-6, 0, 30]}
          id="sec-h-0-35-opposite"
          delay={3}
        />

        {/* Vehicles */}
        <CityVehicles />

        {/* Buildings */}
        {buildings.map((building) => (
          <Building3D
            key={building.id}
            {...building}
            isHovered={hoveredBuilding === building.id}
            onClick={() => onBuildingClick(building.id)}
            onHover={() => onBuildingHover(building.id)}
            onUnhover={() => onBuildingHover(null)}
          />
        ))}

        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={20}
          maxDistance={120}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0, 0]}
        />
      </Suspense>
    </Canvas>
  );
}
