import React from "react";
import { Box, Cylinder, Sphere } from "@react-three/drei";

export function CityInfrastructure() {
  // Street lights
  const streetLights = [
    // Outer positions
    [-58, 0, -52],
    [58, 0, -52],
    [-58, 0, 52],
    [58, 0, 52],
    // Near outer
    [-52, 0, -46],
    [52, 0, -46],
    [-52, 0, 46],
    [52, 0, 46],
    // Inner positions
    [23, 0, -17.5],
    [-23, 0, -17.5],
    [23, 0, 17.5],
    [-23, 0, 17.5],
  ];

  // Benches
  const benches = [
    [-52, 0, -23],
    [52, 0, -23],
    [-52, 0, 23],
    [52, 0, 23],
    [-46, 0, -17.5],
    [46, 0, -17.5],
    [-46, 0, 17.5],
    [46, 0, 17.5],
  ];

  // Trees
  const trees = [
    [-60, 0, -60],
    [60, 0, -60],
    [-60, 0, 60],
    [60, 0, 60],
    [-50, 0, -55],
    [50, 0, -55],
    [-50, 0, 55],
    [50, 0, 55],
  ];

  return (
    <group>
      {/* Street Lights */}
      {streetLights.map((pos, i) => (
        <group key={`light-${i}`} position={pos as [number, number, number]}>
          <Cylinder args={[0.1, 0.1, 5]} position={[0, 2.5, 0]}>
            <meshStandardMaterial color="#404040" />
          </Cylinder>
          <Sphere args={[0.3]} position={[0, 5, 0]}>
            <meshStandardMaterial
              color="#ffeb3b"
              emissive="#ffeb3b"
              emissiveIntensity={0.5}
            />
          </Sphere>
        </group>
      ))}

      {/* Benches */}
      {benches.map((pos, i) => (
        <Box
          key={`bench-${i}`}
          args={[1.5, 0.5, 0.5]}
          position={[pos[0], 0.5, pos[2]] as [number, number, number]}
        >
          <meshStandardMaterial color="#8b4513" />
        </Box>
      ))}

      {/* Trees */}
      {trees.map((pos, i) => (
        <group key={`tree-${i}`} position={pos as [number, number, number]}>
          {/* Trunk */}
          <Cylinder args={[0.3, 0.3, 3]} position={[0, 1.5, 0]}>
            <meshStandardMaterial color="#8b4513" />
          </Cylinder>
          {/* Leaves */}
          <Sphere args={[1.5]} position={[0, 4, 0]}>
            <meshStandardMaterial color="#228b22" />
          </Sphere>
        </group>
      ))}
    </group>
  );
}
