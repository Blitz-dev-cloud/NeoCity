"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { trafficCongestionData } from "./CityVehicles";

// Traffic light state manager for synchronization
export class TrafficLightManager {
  private static instance: TrafficLightManager;
  public lights: Map<
    string,
    { state: "red" | "yellow" | "green"; timer: number }
  > = new Map();

  // Dynamic timing based on congestion
  private greenDuration = 5;
  private redDuration = 4;
  private yellowDuration = 1;

  // Congestion recovery mode
  private congestionRecoveryMode = false;
  private recoveryPhase: "horizontal" | "vertical" = "horizontal";
  private recoveryTimer = 0;
  private congestionStartTime = 0;

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
    // Update timing based on congestion level
    const congestionLevel = trafficCongestionData.congestionLevel || 0;

    // Activate congestion recovery mode when congestion exceeds 70%
    if (congestionLevel > 70 && !this.congestionRecoveryMode) {
      console.log("🚦 ACTIVATING CONGESTION RECOVERY MODE");
      this.congestionRecoveryMode = true;
      this.recoveryPhase = "horizontal";
      this.recoveryTimer = 0;
      this.congestionStartTime = Date.now();
    }

    // Deactivate recovery mode when congestion drops below 30%
    if (congestionLevel < 30 && this.congestionRecoveryMode) {
      console.log("✅ CONGESTION CLEARED - Returning to normal operation");
      this.congestionRecoveryMode = false;
      this.recoveryTimer = 0;
    }

    // CONGESTION RECOVERY MODE: Alternating directional releases
    if (this.congestionRecoveryMode) {
      this.recoveryTimer += deltaTime;

      // Phase duration: 6 seconds per direction
      const phaseDuration = 6;

      if (this.recoveryTimer > phaseDuration) {
        // Switch phases
        this.recoveryPhase =
          this.recoveryPhase === "horizontal" ? "vertical" : "horizontal";
        this.recoveryTimer = 0;
        console.log(
          `🔄 Switching recovery phase to: ${this.recoveryPhase.toUpperCase()}`
        );
      }

      // Apply recovery phase: Only one direction gets green at a time
      this.lights.forEach((light, id) => {
        light.timer += deltaTime;

        // Corner light naming: -ne, -nw, -se, -sw
        // For recovery mode:
        // - Vertical phase: NE & NW (north) + SE & SW (south) control vertical traffic
        // - Horizontal phase: NE & SE (east) + NW & SW (west) control horizontal traffic

        // Determine which lights should be active based on phase
        const isNorthSouthLight =
          id.endsWith("-ne") ||
          id.endsWith("-nw") ||
          id.endsWith("-se") ||
          id.endsWith("-sw");

        // In vertical phase: NE/NW pair and SE/SW pair alternate
        // In horizontal phase: NE/SE pair and NW/SW pair alternate
        let isActiveDirection = false;

        if (this.recoveryPhase === "vertical") {
          // Allow vertical traffic: activate north corners (NE, NW) on one cycle
          isActiveDirection = id.endsWith("-ne") || id.endsWith("-nw");
        } else {
          // Allow horizontal traffic: activate east corners (NE, SE) on one cycle
          isActiveDirection = id.endsWith("-ne") || id.endsWith("-se");
        }

        if (isActiveDirection) {
          // Active direction: Allow green lights (shorter cycle)
          if (light.state === "red" && light.timer > 2) {
            light.state = "green";
            light.timer = 0;
          } else if (light.state === "green" && light.timer > 4) {
            light.state = "yellow";
            light.timer = 0;
          } else if (light.state === "yellow" && light.timer > 1) {
            light.state = "red";
            light.timer = 0;
          }
        } else {
          // Inactive direction: Force red to hold traffic
          if (light.state !== "red") {
            light.state = "red";
            light.timer = 0;
          }
        }
      });
    } else {
      // NORMAL MODE: Dynamic timing based on congestion
      if (congestionLevel > 40) {
        // Medium-high congestion: Longer green, shorter red
        this.greenDuration = 6;
        this.redDuration = 3;
        this.yellowDuration = 1;
      } else {
        // Low congestion: Normal timing
        this.greenDuration = 5;
        this.redDuration = 4;
        this.yellowDuration = 1;
      }

      this.lights.forEach((light) => {
        light.timer += deltaTime;

        // Traffic light cycle with dynamic timing
        if (light.state === "red" && light.timer > this.redDuration) {
          light.state = "green";
          light.timer = 0;
        } else if (
          light.state === "green" &&
          light.timer > this.greenDuration
        ) {
          light.state = "yellow";
          light.timer = 0;
        } else if (
          light.state === "yellow" &&
          light.timer > this.yellowDuration
        ) {
          light.state = "red";
          light.timer = 0;
        }
      });
    }
  }

  registerLight(id: string, initialDelay: number = 0) {
    if (!this.lights.has(id)) {
      // Offset the initial state based on delay
      let state: "red" | "yellow" | "green" = "red";
      let timer = initialDelay;

      if (initialDelay > this.redDuration) {
        state = "green";
        timer = initialDelay - this.redDuration;
      }
      if (initialDelay > this.redDuration + this.greenDuration) {
        state = "yellow";
        timer = initialDelay - this.redDuration - this.greenDuration;
      }

      this.lights.set(id, { state, timer });
    }
  }

  // Get current timing configuration for display
  getCurrentTiming() {
    return {
      green: this.greenDuration,
      red: this.redDuration,
      yellow: this.yellowDuration,
    };
  }

  // Get recovery mode status for UI display
  getRecoveryStatus() {
    return {
      isActive: this.congestionRecoveryMode,
      currentPhase: this.recoveryPhase,
      phaseProgress: (this.recoveryTimer / 6) * 100, // 6 seconds per phase
      duration: this.congestionStartTime
        ? Math.floor((Date.now() - this.congestionStartTime) / 1000)
        : 0,
    };
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
