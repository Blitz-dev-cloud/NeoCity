"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Traffic light state manager for synchronization
export class TrafficLightManager {
  private static instance: TrafficLightManager;
  public lights: Map<
    string,
    { state: "red" | "yellow" | "green"; timer: number }
  > = new Map();

  private constructor() {}

  static getInstance(): TrafficLightManager {
    if (!TrafficLightManager.instance) {
      TrafficLightManager.instance = new TrafficLightManager();
    }
    return TrafficLightManager.instance;
  }

  getState(id: string): "red" | "yellow" | "green" {
    return this.lights.get(id)?.state || "green";
  }

  updateLights(deltaTime: number) {
    this.lights.forEach((light) => {
      light.timer += deltaTime;

      // Traffic light cycle: Red (4s) -> Green (5s) -> Yellow (1s)
      if (light.state === "red" && light.timer > 4) {
        light.state = "green";
        light.timer = 0;
      } else if (light.state === "green" && light.timer > 5) {
        light.state = "yellow";
        light.timer = 0;
      } else if (light.state === "yellow" && light.timer > 1) {
        light.state = "red";
        light.timer = 0;
      }
    });
  }

  registerLight(id: string, initialDelay: number = 0) {
    if (!this.lights.has(id)) {
      // Offset the initial state based on delay
      let state: "red" | "yellow" | "green" = "red";
      let timer = initialDelay;

      if (initialDelay > 4) {
        state = "green";
        timer = initialDelay - 4;
      }
      if (initialDelay > 9) {
        state = "yellow";
        timer = initialDelay - 9;
      }

      this.lights.set(id, { state, timer });
    }
  }
}

interface TrafficLightProps {
  position: [number, number, number];
  id: string;
  delay?: number;
}

export function TrafficLight({ position, id, delay = 0 }: TrafficLightProps) {
  const redLightRef = useRef<THREE.Mesh>(null);
  const yellowLightRef = useRef<THREE.Mesh>(null);
  const greenLightRef = useRef<THREE.Mesh>(null);
  const redPointLightRef = useRef<THREE.PointLight>(null);
  const yellowPointLightRef = useRef<THREE.PointLight>(null);
  const greenPointLightRef = useRef<THREE.PointLight>(null);

  const manager = TrafficLightManager.getInstance();
  manager.registerLight(id, delay);

  useFrame(() => {
    const currentState = manager.getState(id);

    if (
      redLightRef.current &&
      yellowLightRef.current &&
      greenLightRef.current
    ) {
      // Update light colors based on state
      if (currentState === "red") {
        (
          redLightRef.current.material as THREE.MeshStandardMaterial
        ).emissive.setHex(0xff0000);
        (
          redLightRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 2.0;
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

        if (
          redPointLightRef.current &&
          yellowPointLightRef.current &&
          greenPointLightRef.current
        ) {
          redPointLightRef.current.intensity = 2;
          yellowPointLightRef.current.intensity = 0;
          greenPointLightRef.current.intensity = 0;
        }
      } else if (currentState === "yellow") {
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
        ).emissiveIntensity = 2.0;
        (
          greenLightRef.current.material as THREE.MeshStandardMaterial
        ).emissive.setHex(0x000000);
        (
          greenLightRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = 0;

        if (
          redPointLightRef.current &&
          yellowPointLightRef.current &&
          greenPointLightRef.current
        ) {
          redPointLightRef.current.intensity = 0;
          yellowPointLightRef.current.intensity = 2;
          greenPointLightRef.current.intensity = 0;
        }
      } else {
        // green
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
        ).emissiveIntensity = 2.0;

        if (
          redPointLightRef.current &&
          yellowPointLightRef.current &&
          greenPointLightRef.current
        ) {
          redPointLightRef.current.intensity = 0;
          yellowPointLightRef.current.intensity = 0;
          greenPointLightRef.current.intensity = 2;
        }
      }
    }
  });

  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 4, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Signal box */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <boxGeometry args={[0.4, 1.2, 0.3]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} />
      </mesh>

      {/* Red light */}
      <mesh ref={redLightRef} position={[0, 4.9, 0.16]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#220000"
          emissive="#ff0000"
          emissiveIntensity={0}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      <pointLight
        ref={redPointLightRef}
        position={[0, 4.9, 0.3]}
        color="#ff0000"
        intensity={0}
        distance={8}
      />

      {/* Yellow light */}
      <mesh ref={yellowLightRef} position={[0, 4.5, 0.16]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#222200"
          emissive="#ffff00"
          emissiveIntensity={0}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      <pointLight
        ref={yellowPointLightRef}
        position={[0, 4.5, 0.3]}
        color="#ffff00"
        intensity={0}
        distance={8}
      />

      {/* Green light */}
      <mesh ref={greenLightRef} position={[0, 4.1, 0.16]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#002200"
          emissive="#00ff00"
          emissiveIntensity={0}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      <pointLight
        ref={greenPointLightRef}
        position={[0, 4.1, 0.3]}
        color="#00ff00"
        intensity={0}
        distance={8}
      />
    </group>
  );
}

// Component to update all traffic lights
export function TrafficLightController() {
  const manager = TrafficLightManager.getInstance();

  useFrame((state, delta) => {
    manager.updateLights(delta);
  });

  return null;
}
