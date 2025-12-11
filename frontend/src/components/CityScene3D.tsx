"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense } from "react";
import { Building3D } from "./Building3D";
import { Ground } from "./Ground";
import { CityVehicles } from "./CityVehicles";
import { TrafficLight, TrafficLightController } from "./TrafficLights";
import { CityInfrastructure } from "./CityInfrastructure";
// TrafficCongestionMonitor must be rendered outside of the R3F <Canvas> (it returns DOM nodes).
// Importing it here is unnecessary and may cause runtime errors if rendered inside the Canvas.

interface CityScene3DProps {
  onBuildingClick: (buildingId: string) => void;
  hoveredBuilding: string | null;
  onBuildingHover: (buildingId: string | null) => void;
  userDID?: string; // Optional DID to display on building tooltips
}

export function CityScene3D({
  onBuildingClick,
  hoveredBuilding,
  onBuildingHover,
  userDID,
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
      id: "doctor",
      name: "👨‍⚕️ Doctor Portal",
      position: [-60, 0, 52] as [number, number, number], // Next to hospital
      color: "#EC4899",
      height: 6.5,
      style: "modern",
    },
    {
      id: "voting",
      name: "🗳️ Voting Hall",
      position: [52, 0, -52] as [number, number, number], // CENTER of Far NE patch
      color: "#7C3AED",
      height: 8,
      style: "dome",
    },
    {
      id: "admin",
      name: "🛡️ Admin Center",
      position: [17.5, 0, -52] as [number, number, number], // Far NORTH patch (moved from near voting)
      color: "#6366F1",
      height: 7,
      style: "admin",
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
      id: "vault",
      name: "🔒 Token Vault",
      position: [-17.5, 0, 17.5] as [number, number, number], // CENTER of SW inner patch (original position)
      color: "#FBBF24",
      height: 6,
      style: "tower",
    },
    {
      id: "faucet",
      name: "💧 Token Faucet",
      position: [-25, 0, 17.5] as [number, number, number], // Next to vault in SW inner patch (original position)
      color: "#14B8A6",
      height: 5,
      style: "modern",
    },
    {
      id: "farm",
      name: "🚜 Farm Hub (Supply Chain)",
      position: [52, 0, 52] as [number, number, number], // CENTER of haystacks (windmill at offset)
      color: "#22C55E",
      height: 6,
      style: "warehouse",
    },
    {
      id: "shop",
      name: "🏪 Commerce Shop",
      position: [60, 0, -20] as [number, number, number], // EAST STRIP - dummy buildings only area
      color: "#F59E0B",
      height: 6.5,
      style: "modern",
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
      {/* Reduced fog for better visibility */}
      <fog attach="fog" args={["#87CEEB", 80, 200]} />

      <Suspense fallback={null}>
        {/* Enhanced Lighting */}
        <ambientLight intensity={1.2} />

        {/* Main sun light - warm sunlight */}
        <directionalLight
          position={[50, 80, 50]}
          intensity={2.8}
          color="#FFF8DC"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
          shadow-bias={-0.0001}
        />

        {/* Fill lights for better visibility - increased */}
        <directionalLight
          position={[-30, 40, -30]}
          intensity={1.2}
          color="#FFF5E6"
        />

        {/* Accent lights around key buildings - brighter */}
        <pointLight
          position={[-52, 15, -52]}
          intensity={2.5}
          color="#3b82f6"
          distance={35}
        />
        <pointLight
          position={[-52, 12, 52]}
          intensity={2.5}
          color="#ef4444"
          distance={35}
        />
        <pointLight
          position={[52, 10, -52]}
          intensity={2.0}
          color="#f59e0b"
          distance={30}
        />
        <pointLight
          position={[-17.5, 10, -17.5]}
          intensity={2.2}
          color="#a855f7"
          distance={30}
        />
        <pointLight
          position={[52, 12, 52]}
          intensity={2.0}
          color="#22c55e"
          distance={35}
        />

        {/* Hemisphere light for natural sky illumination - increased */}
        <hemisphereLight args={["#87CEEB", "#2d5a2d", 0.8]} />

        {/* Stars - visible during day */}
        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={3}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* Ground */}
        <Ground />

        {/* City Infrastructure - Street lights, benches, trees, etc. */}
        <CityInfrastructure />

        {/* Traffic Light Controller */}
        <TrafficLightController />

        {/* MAIN INTERSECTION (0, 0) - 4 corner lights controlling all 4 approaches */}
        {/* NE corner - Controls traffic coming from North and East */}
        <TrafficLight position={[6, 0, 6]} id="main-ne" delay={0} />

        {/* NW corner - Controls traffic coming from North and West */}
        <TrafficLight position={[-6, 0, 6]} id="main-nw" delay={0} />

        {/* SE corner - Controls traffic coming from South and East */}
        <TrafficLight position={[6, 0, -6]} id="main-se" delay={5} />

        {/* SW corner - Controls traffic coming from South and West */}
        <TrafficLight position={[-6, 0, -6]} id="main-sw" delay={5} />

        {/* WEST INTERSECTION (-35, 0) - 4 corner lights */}
        <TrafficLight position={[-29, 0, 6]} id="west-ne" delay={2} />
        <TrafficLight position={[-41, 0, 6]} id="west-nw" delay={2} />
        <TrafficLight position={[-29, 0, -6]} id="west-se" delay={7} />
        <TrafficLight position={[-41, 0, -6]} id="west-sw" delay={7} />

        {/* EAST INTERSECTION (35, 0) - 4 corner lights */}
        <TrafficLight position={[41, 0, 6]} id="east-ne" delay={2} />
        <TrafficLight position={[29, 0, 6]} id="east-nw" delay={2} />
        <TrafficLight position={[41, 0, -6]} id="east-se" delay={7} />
        <TrafficLight position={[29, 0, -6]} id="east-sw" delay={7} />

        {/* NORTH INTERSECTION (0, 35) - 4 corner lights */}
        <TrafficLight position={[6, 0, 41]} id="north-ne" delay={3} />
        <TrafficLight position={[-6, 0, 41]} id="north-nw" delay={3} />
        <TrafficLight position={[6, 0, 29]} id="north-se" delay={8} />
        <TrafficLight position={[-6, 0, 29]} id="north-sw" delay={8} />

        {/* SOUTH INTERSECTION (0, -35) - 4 corner lights */}
        <TrafficLight position={[6, 0, -29]} id="south-ne" delay={3} />
        <TrafficLight position={[-6, 0, -29]} id="south-nw" delay={3} />
        <TrafficLight position={[6, 0, -41]} id="south-se" delay={8} />
        <TrafficLight position={[-6, 0, -41]} id="south-sw" delay={8} />

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
            userDID={userDID}
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
