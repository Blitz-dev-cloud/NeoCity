"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TrafficLightManager } from "./TrafficLights";
import { useAccount } from "wagmi";

interface Vehicle {
  id: string;
  type: "car" | "bus" | "truck";
  color: string;
  position: THREE.Vector3;
  rotation: number;
  speed: number;
  path: "horizontal" | "vertical";
  lane: number;
  baseSpeed: number;
  stopped: boolean;
}

// Export congestion data for real-time monitoring
export const trafficCongestionData = {
  totalVehicles: 0,
  stoppedVehicles: 0,
  averageSpeed: 0,
  congestionLevel: 0, // 0-100
};

export function CityVehicles() {
  const vehiclesRef = useRef<THREE.Group>(null);

  // Generate random vehicles
  const vehicles = useMemo<Vehicle[]>(() => {
    const vehicleTypes: ("car" | "bus" | "truck")[] = [
      "car",
      "car",
      "car",
      "bus",
      "truck",
    ];
    const colors = [
      "#FF4444",
      "#4444FF",
      "#44FF44",
      "#FFFF44",
      "#FF44FF",
      "#44FFFF",
      "#FFA500",
      "#800080",
      "#00CED1",
      "#DC143C",
    ];

    const result: Vehicle[] = [];

    // Main horizontal road (z=0) - vehicles moving left-right
    for (let i = 0; i < 4; i++) {
      const direction = Math.random() > 0.5;
      const baseSpeed = 0.08 + Math.random() * 0.04;
      result.push({
        id: `main-h-${i}`,
        type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        position: new THREE.Vector3(
          Math.random() * 100 - 50,
          0.5,
          direction ? 2 : -2
        ),
        rotation: direction ? 0 : Math.PI,
        speed: baseSpeed,
        baseSpeed: baseSpeed,
        stopped: false,
        path: "horizontal",
        lane: direction ? 2 : -2,
      });
    }

    // Main vertical road (x=0) - vehicles moving forward-backward
    for (let i = 0; i < 4; i++) {
      const direction = Math.random() > 0.5;
      const baseSpeed = 0.08 + Math.random() * 0.04;
      result.push({
        id: `main-v-${i}`,
        type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        position: new THREE.Vector3(
          direction ? 2 : -2,
          0.5,
          Math.random() * 100 - 50
        ),
        rotation: direction ? Math.PI / 2 : -Math.PI / 2,
        speed: baseSpeed,
        baseSpeed: baseSpeed,
        stopped: false,
        path: "vertical",
        lane: direction ? 2 : -2,
      });
    }

    // Secondary horizontal roads (z=±35)
    [-35, 35].forEach((zPos, idx) => {
      for (let i = 0; i < 2; i++) {
        const direction = Math.random() > 0.5;
        const baseSpeed = 0.08 + Math.random() * 0.04;
        result.push({
          id: `sec-h-${idx}-${i}`,
          type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          position: new THREE.Vector3(
            Math.random() * 100 - 50,
            0.5,
            zPos + (direction ? 2 : -2)
          ),
          rotation: direction ? 0 : Math.PI,
          speed: baseSpeed,
          baseSpeed: baseSpeed,
          stopped: false,
          path: "horizontal",
          lane: zPos + (direction ? 2 : -2),
        });
      }
    });

    // Secondary vertical roads (x=±35)
    [-35, 35].forEach((xPos, idx) => {
      for (let i = 0; i < 2; i++) {
        const direction = Math.random() > 0.5;
        const baseSpeed = 0.08 + Math.random() * 0.04;
        result.push({
          id: `sec-v-${idx}-${i}`,
          type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          position: new THREE.Vector3(
            xPos + (direction ? 2 : -2),
            0.5,
            Math.random() * 100 - 50
          ),
          rotation: direction ? Math.PI / 2 : -Math.PI / 2,
          speed: baseSpeed,
          baseSpeed: baseSpeed,
          stopped: false,
          path: "vertical",
          lane: xPos + (direction ? 2 : -2),
        });
      }
    });

    return result;
  }, []);

  // Animate vehicles
  useFrame(() => {
    if (!vehiclesRef.current) return;

    const manager = TrafficLightManager.getInstance();
    let stoppedCount = 0;
    let totalSpeed = 0;

    vehiclesRef.current.children.forEach((mesh, index) => {
      const vehicle = vehicles[index];

      // Check for traffic lights at intersections (corner placement)
      let shouldStop = false;
      const pos = mesh.position;

      // Helper function to check if near intersection
      const checkIntersection = (
        centerX: number,
        centerZ: number,
        lightId: string
      ) => {
        const distX = Math.abs(pos.x - centerX);
        const distZ = Math.abs(pos.z - centerZ);

        // Vehicle approaching intersection (within 10 units)
        if (distX < 10 && distZ < 10) {
          const state = manager.getState(lightId);
          if (state === "red" || state === "yellow") {
            // Only stop if vehicle is approaching the light (not past it)
            if (vehicle.path === "horizontal") {
              // Horizontal vehicles check if they're before the intersection
              if (vehicle.rotation === 0 && pos.x < centerX + 5) return true; // Moving east
              if (vehicle.rotation === Math.PI && pos.x > centerX - 5)
                return true; // Moving west
            } else {
              // Vertical vehicles check if they're before the intersection
              if (vehicle.rotation === Math.PI / 2 && pos.z < centerZ + 5)
                return true; // Moving north
              if (vehicle.rotation === -Math.PI / 2 && pos.z > centerZ - 5)
                return true; // Moving south
            }
          }
        }
        return false;
      };

      // Check main intersection (0, 0) - Corner-based traffic lights
      // Each corner light controls traffic approaching from 2 directions
      if (vehicle.path === "horizontal") {
        if (vehicle.rotation === 0) {
          // Moving EAST (→) - check NE and SE corners (right side lights)
          if (vehicle.lane > 0) {
            // Upper lane - check NE corner
            if (checkIntersection(0, 0, "main-ne")) shouldStop = true;
          } else {
            // Lower lane - check SE corner
            if (checkIntersection(0, 0, "main-se")) shouldStop = true;
          }
        } else {
          // Moving WEST (←) - check NW and SW corners (left side lights)
          if (vehicle.lane > 0) {
            // Upper lane - check NW corner
            if (checkIntersection(0, 0, "main-nw")) shouldStop = true;
          } else {
            // Lower lane - check SW corner
            if (checkIntersection(0, 0, "main-sw")) shouldStop = true;
          }
        }
      } else {
        // Vertical path
        if (vehicle.rotation === Math.PI / 2) {
          // Moving NORTH (↑) - check NE and NW corners (top lights)
          if (vehicle.lane > 0) {
            // Right lane - check NE corner
            if (checkIntersection(0, 0, "main-ne")) shouldStop = true;
          } else {
            // Left lane - check NW corner
            if (checkIntersection(0, 0, "main-nw")) shouldStop = true;
          }
        } else {
          // Moving SOUTH (↓) - check SE and SW corners (bottom lights)
          if (vehicle.lane > 0) {
            // Right lane - check SE corner
            if (checkIntersection(0, 0, "main-se")) shouldStop = true;
          } else {
            // Left lane - check SW corner
            if (checkIntersection(0, 0, "main-sw")) shouldStop = true;
          }
        }
      }

      // Check west intersection (-35, 0)
      if (vehicle.path === "horizontal") {
        if (vehicle.rotation === 0) {
          if (vehicle.lane > 0) {
            if (checkIntersection(-35, 0, "west-ne")) shouldStop = true;
          } else {
            if (checkIntersection(-35, 0, "west-se")) shouldStop = true;
          }
        } else {
          if (vehicle.lane > 0) {
            if (checkIntersection(-35, 0, "west-nw")) shouldStop = true;
          } else {
            if (checkIntersection(-35, 0, "west-sw")) shouldStop = true;
          }
        }
      } else {
        if (vehicle.rotation === Math.PI / 2) {
          if (vehicle.lane > 0) {
            if (checkIntersection(-35, 0, "west-ne")) shouldStop = true;
          } else {
            if (checkIntersection(-35, 0, "west-nw")) shouldStop = true;
          }
        } else {
          if (vehicle.lane > 0) {
            if (checkIntersection(-35, 0, "west-se")) shouldStop = true;
          } else {
            if (checkIntersection(-35, 0, "west-sw")) shouldStop = true;
          }
        }
      }

      // Check east intersection (35, 0)
      if (vehicle.path === "horizontal") {
        if (vehicle.rotation === 0) {
          if (vehicle.lane > 0) {
            if (checkIntersection(35, 0, "east-ne")) shouldStop = true;
          } else {
            if (checkIntersection(35, 0, "east-se")) shouldStop = true;
          }
        } else {
          if (vehicle.lane > 0) {
            if (checkIntersection(35, 0, "east-nw")) shouldStop = true;
          } else {
            if (checkIntersection(35, 0, "east-sw")) shouldStop = true;
          }
        }
      } else {
        if (vehicle.rotation === Math.PI / 2) {
          if (vehicle.lane > 0) {
            if (checkIntersection(35, 0, "east-ne")) shouldStop = true;
          } else {
            if (checkIntersection(35, 0, "east-nw")) shouldStop = true;
          }
        } else {
          if (vehicle.lane > 0) {
            if (checkIntersection(35, 0, "east-se")) shouldStop = true;
          } else {
            if (checkIntersection(35, 0, "east-sw")) shouldStop = true;
          }
        }
      }

      // Check north intersection (0, 35)
      if (vehicle.path === "horizontal") {
        if (vehicle.rotation === 0) {
          if (vehicle.lane > 0) {
            if (checkIntersection(0, 35, "north-ne")) shouldStop = true;
          } else {
            if (checkIntersection(0, 35, "north-se")) shouldStop = true;
          }
        } else {
          if (vehicle.lane > 0) {
            if (checkIntersection(0, 35, "north-nw")) shouldStop = true;
          } else {
            if (checkIntersection(0, 35, "north-sw")) shouldStop = true;
          }
        }
      } else {
        if (vehicle.rotation === Math.PI / 2) {
          if (vehicle.lane > 0) {
            if (checkIntersection(0, 35, "north-ne")) shouldStop = true;
          } else {
            if (checkIntersection(0, 35, "north-nw")) shouldStop = true;
          }
        } else {
          if (vehicle.lane > 0) {
            if (checkIntersection(0, 35, "north-se")) shouldStop = true;
          } else {
            if (checkIntersection(0, 35, "north-sw")) shouldStop = true;
          }
        }
      }

      // Check south intersection (0, -35)
      if (vehicle.path === "horizontal") {
        if (vehicle.rotation === 0) {
          if (vehicle.lane > 0) {
            if (checkIntersection(0, -35, "south-ne")) shouldStop = true;
          } else {
            if (checkIntersection(0, -35, "south-se")) shouldStop = true;
          }
        } else {
          if (vehicle.lane > 0) {
            if (checkIntersection(0, -35, "south-nw")) shouldStop = true;
          } else {
            if (checkIntersection(0, -35, "south-sw")) shouldStop = true;
          }
        }
      } else {
        if (vehicle.rotation === Math.PI / 2) {
          if (vehicle.lane > 0) {
            if (checkIntersection(0, -35, "south-ne")) shouldStop = true;
          } else {
            if (checkIntersection(0, -35, "south-nw")) shouldStop = true;
          }
        } else {
          if (vehicle.lane > 0) {
            if (checkIntersection(0, -35, "south-se")) shouldStop = true;
          } else {
            if (checkIntersection(0, -35, "south-sw")) shouldStop = true;
          }
        }
      }

      // IMPROVED: Check for vehicles ahead to maintain safe distance
      let vehicleAhead = false;
      const safeDistance = 3.5; // Minimum distance to maintain

      vehicles.forEach((otherVehicle) => {
        if (otherVehicle.id === vehicle.id) return; // Skip self
        if (otherVehicle.path !== vehicle.path) return; // Different paths don't interfere

        const otherPos = otherVehicle.position;

        if (vehicle.path === "horizontal") {
          // Check if other vehicle is ahead in the same lane
          const sameLane = Math.abs(mesh.position.z - otherPos.z) < 2;
          if (!sameLane) return;

          if (vehicle.rotation === 0) {
            // Moving east - check vehicles ahead (x+)
            const distance = otherPos.x - mesh.position.x;
            if (distance > 0 && distance < safeDistance) {
              vehicleAhead = true;
            }
          } else {
            // Moving west - check vehicles ahead (x-)
            const distance = mesh.position.x - otherPos.x;
            if (distance > 0 && distance < safeDistance) {
              vehicleAhead = true;
            }
          }
        } else {
          // Vertical path
          const sameLane = Math.abs(mesh.position.x - otherPos.x) < 2;
          if (!sameLane) return;

          if (vehicle.rotation === Math.PI / 2) {
            // Moving north - check vehicles ahead (z+)
            const distance = otherPos.z - mesh.position.z;
            if (distance > 0 && distance < safeDistance) {
              vehicleAhead = true;
            }
          } else {
            // Moving south - check vehicles ahead (z-)
            const distance = mesh.position.z - otherPos.z;
            if (distance > 0 && distance < safeDistance) {
              vehicleAhead = true;
            }
          }
        }
      });

      // Update vehicle speed based on traffic lights AND vehicle spacing
      if (shouldStop || vehicleAhead) {
        // Smoother deceleration when slowing down
        const decelerationRate = vehicleAhead ? 0.003 : 0.002;
        vehicle.speed = Math.max(0, vehicle.speed - decelerationRate);
        vehicle.stopped = vehicle.speed < 0.001;
      } else {
        // Gradual acceleration when clear
        vehicle.speed = Math.min(vehicle.baseSpeed, vehicle.speed + 0.0015);
        vehicle.stopped = false;
      }

      if (vehicle.stopped) stoppedCount++;
      totalSpeed += vehicle.speed;

      if (vehicle.path === "horizontal") {
        // Move horizontally
        if (vehicle.rotation === 0) {
          mesh.position.x += vehicle.speed;
          if (mesh.position.x > 70) mesh.position.x = -70;
        } else {
          mesh.position.x -= vehicle.speed;
          if (mesh.position.x < -70) mesh.position.x = 70;
        }
      } else {
        // Move vertically
        if (vehicle.rotation === Math.PI / 2) {
          mesh.position.z += vehicle.speed;
          if (mesh.position.z > 70) mesh.position.z = -70;
        } else {
          mesh.position.z -= vehicle.speed;
          if (mesh.position.z < -70) mesh.position.z = 70;
        }
      }
    });

    // Update congestion data
    trafficCongestionData.totalVehicles = vehicles.length;
    trafficCongestionData.stoppedVehicles = stoppedCount;
    trafficCongestionData.averageSpeed = totalSpeed / vehicles.length;
    trafficCongestionData.congestionLevel = Math.min(
      100,
      (stoppedCount / vehicles.length) * 100
    );
  });

  // Get vehicle dimensions based on type
  const getVehicleSize = (type: "car" | "bus" | "truck") => {
    switch (type) {
      case "bus":
        return { width: 1.2, height: 1.5, length: 3.5 };
      case "truck":
        return { width: 1.3, height: 1.8, length: 4 };
      default: // car
        return { width: 0.9, height: 0.8, length: 2 };
    }
  };

  return (
    <group ref={vehiclesRef}>
      {vehicles.map((vehicle) => {
        const size = getVehicleSize(vehicle.type);

        return (
          <group
            key={vehicle.id}
            position={vehicle.position}
            rotation={[0, vehicle.rotation, 0]}
          >
            {/* Vehicle Body */}
            <mesh castShadow>
              <boxGeometry args={[size.length, size.height, size.width]} />
              <meshStandardMaterial
                color={vehicle.color}
                metalness={0.6}
                roughness={0.3}
              />
            </mesh>

            {/* Windows (darker) */}
            <mesh position={[0, size.height / 4, 0]}>
              <boxGeometry
                args={[size.length * 0.6, size.height * 0.4, size.width * 0.95]}
              />
              <meshStandardMaterial
                color="#1a1a1a"
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Headlights */}
            <pointLight
              position={[size.length / 2 + 0.1, 0, size.width / 3]}
              color="#FFFF88"
              intensity={0.5}
              distance={5}
            />
            <mesh position={[size.length / 2, 0, size.width / 3]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial
                color="#FFFF88"
                emissive="#FFFF88"
                emissiveIntensity={1.5}
              />
            </mesh>
            <pointLight
              position={[size.length / 2 + 0.1, 0, -size.width / 3]}
              color="#FFFF88"
              intensity={0.5}
              distance={5}
            />
            <mesh position={[size.length / 2, 0, -size.width / 3]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial
                color="#FFFF88"
                emissive="#FFFF88"
                emissiveIntensity={1.5}
              />
            </mesh>

            {/* Taillights */}
            <mesh position={[-size.length / 2, 0, size.width / 3]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial
                color="#FF0000"
                emissive="#FF0000"
                emissiveIntensity={1}
              />
            </mesh>
            <mesh position={[-size.length / 2, 0, -size.width / 3]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial
                color="#FF0000"
                emissive="#FF0000"
                emissiveIntensity={1}
              />
            </mesh>

            {/* Wheels */}
            {vehicle.type === "bus"
              ? // Bus has 4 wheels
                [
                  -size.length / 2.5,
                  -size.length / 6,
                  size.length / 6,
                  size.length / 2.5,
                ].map((x, i) => (
                  <group key={i}>
                    <mesh
                      position={[x, -size.height / 2, size.width / 2 + 0.1]}
                      rotation={[Math.PI / 2, 0, 0]}
                    >
                      <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
                      <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                    <mesh
                      position={[x, -size.height / 2, -size.width / 2 - 0.1]}
                      rotation={[Math.PI / 2, 0, 0]}
                    >
                      <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
                      <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                  </group>
                ))
              : // Car and truck have 2 wheels
                [-size.length / 3, size.length / 3].map((x, i) => (
                  <group key={i}>
                    <mesh
                      position={[x, -size.height / 2, size.width / 2 + 0.1]}
                      rotation={[Math.PI / 2, 0, 0]}
                    >
                      <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
                      <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                    <mesh
                      position={[x, -size.height / 2, -size.width / 2 - 0.1]}
                      rotation={[Math.PI / 2, 0, 0]}
                    >
                      <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
                      <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                  </group>
                ))}

            {/* Bus/Truck specific details */}
            {vehicle.type === "bus" && (
              <>
                {/* Bus stripe */}
                <mesh position={[0, size.height / 2, 0]}>
                  <boxGeometry
                    args={[size.length * 0.9, 0.3, size.width * 0.98]}
                  />
                  <meshStandardMaterial color="#FFFFFF" />
                </mesh>
              </>
            )}

            {vehicle.type === "truck" && (
              <>
                {/* Truck cargo area */}
                <mesh position={[-size.length / 4, size.height / 2, 0]}>
                  <boxGeometry
                    args={[size.length / 2, size.height * 0.8, size.width]}
                  />
                  <meshStandardMaterial
                    color={vehicle.color}
                    metalness={0.3}
                    roughness={0.7}
                  />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}
