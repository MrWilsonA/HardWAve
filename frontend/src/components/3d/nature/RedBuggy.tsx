"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useVehicleControls } from "@/hooks/useVehicleControls";
import { getTerrainHeight, resolveObstacleCollision } from "@/utils/terrainPhysics";

/* ───────────────────────────────────────────
   Red Buggy – Smooth Arcade Vehicle & Interactive Orbital Camera
   – Forward direction aligns 100% with front hood & headlights (+Z local)
   – Interactive Mouse Drag Orbit: Hold left click & drag to rotate camera smoothly
   – Mouse Wheel Zoom: Scroll to zoom camera in/out
   – Silky smooth position/lookAt damping with predictive driving lead
   – Zero ground clipping or jitter
   ─────────────────────────────────────────── */

const ACCELERATION = 12;
const MAX_SPEED = 15;
const FRICTION = 6.0;
const BRAKE_FORCE = 24;
const STEER_SPEED = 2.8;
const STEER_RETURN = 6.0;

interface RedBuggyProps {
  onPositionUpdate?: (pos: THREE.Vector3) => void;
  teleportTo?: THREE.Vector3 | null;
  onTeleportDone?: () => void;
  lampMultiplier?: number;
}

export default function RedBuggy({
  onPositionUpdate,
  teleportTo,
  onTeleportDone,
  lampMultiplier = 1,
}: RedBuggyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const chassisRef = useRef<THREE.Group>(null);
  const wheelFLRef = useRef<THREE.Group>(null);
  const wheelFRRef = useRef<THREE.Group>(null);
  const wheelRLRef = useRef<THREE.Group>(null);
  const wheelRRRef = useRef<THREE.Group>(null);

  const input = useVehicleControls();
  const { camera, gl } = useThree();

  // Initial spawn: On South Road facing North towards Grand Oak & Lake
  const state = useRef({
    speed: 0,
    steerAngle: 0,
    position: new THREE.Vector3(0, 0.38, 14.0),
    rotation: Math.PI, // 180° = Facing North (-Z direction)
    pitch: 0,
    roll: 0,
    suspensionBounce: 0,
  });

  // Interactive Orbital Camera State
  const orbitState = useRef({
    azimuth: 0, // 0 = viewing from South (+Z)
    targetAzimuth: 0,
    elevation: 0.62, // ~35° pitch angle
    targetElevation: 0.62,
    distance: 18.0,
    targetDistance: 18.0,
    isDragging: false,
    prevPointerX: 0,
    prevPointerY: 0,
    cameraPosSmooth: new THREE.Vector3(0, 12, 14.0 + 15),
    cameraLookSmooth: new THREE.Vector3(0, 1.0, 14.0),
  });

  // Attach pointer drag & wheel zoom listeners to canvas
  useEffect(() => {
    const dom = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      // Primary button (left click)
      if (e.button === 0) {
        orbitState.current.isDragging = true;
        orbitState.current.prevPointerX = e.clientX;
        orbitState.current.prevPointerY = e.clientY;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const orb = orbitState.current;
      if (orb.isDragging) {
        const dx = e.clientX - orb.prevPointerX;
        const dy = e.clientY - orb.prevPointerY;
        orb.prevPointerX = e.clientX;
        orb.prevPointerY = e.clientY;

        // Rotate azimuth horizontally
        orb.targetAzimuth -= dx * 0.0055;
        // Tilt elevation vertically (clamped between 15° and 75°)
        orb.targetElevation = Math.max(0.22, Math.min(Math.PI / 2.3, orb.targetElevation + dy * 0.0045));
      }
    };

    const onPointerUp = () => {
      orbitState.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const orb = orbitState.current;
      orb.targetDistance = Math.max(9.0, Math.min(32.0, orb.targetDistance + e.deltaY * 0.015));
    };

    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("wheel", onWheel);
    };
  }, [gl]);

  // ── Dynamic Vehicle Engine Drive Sound ──
  const driveAudioRef = useRef<HTMLAudioElement | null>(null);
  const engineVolumeRef = useRef<number>(0.0);

  useEffect(() => {
    const audio = new Audio("/audio/drive.mp3");
    audio.loop = true;
    audio.volume = 0.0;
    driveAudioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Handle teleport
  const prevTeleport = useRef<THREE.Vector3 | null>(null);
  if (teleportTo && teleportTo !== prevTeleport.current) {
    prevTeleport.current = teleportTo;
    state.current.position.copy(teleportTo);
    state.current.position.y = getTerrainHeight(teleportTo.x, teleportTo.z) + 0.38;
    state.current.speed = 0;
    state.current.steerAngle = 0;
    if (groupRef.current) {
      groupRef.current.position.copy(state.current.position);
    }
    onTeleportDone?.();
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = state.current;
    const inp = input.current;

    // ── Smooth Acceleration / Braking ──
    if (inp.forward) {
      s.speed = Math.min(s.speed + ACCELERATION * dt, MAX_SPEED);
    } else if (inp.backward) {
      s.speed = Math.max(s.speed - ACCELERATION * dt, -MAX_SPEED * 0.4);
    } else if (inp.brake) {
      if (s.speed > 0) s.speed = Math.max(s.speed - BRAKE_FORCE * dt, 0);
      else if (s.speed < 0) s.speed = Math.min(s.speed + BRAKE_FORCE * dt, 0);
    } else {
      if (s.speed > 0) s.speed = Math.max(s.speed - FRICTION * dt, 0);
      else if (s.speed < 0) s.speed = Math.min(s.speed + FRICTION * dt, 0);
    }

    // ── Smooth Steering Interpolation ──
    const targetSteer = (inp.left ? 1 : 0) - (inp.right ? 1 : 0);

    if (targetSteer !== 0) {
      s.steerAngle = THREE.MathUtils.lerp(s.steerAngle, targetSteer, STEER_SPEED * dt);
    } else {
      s.steerAngle = THREE.MathUtils.lerp(s.steerAngle, 0, STEER_RETURN * dt);
      if (Math.abs(s.steerAngle) < 0.01) s.steerAngle = 0;
    }

    const absSpeed = Math.abs(s.speed);
    const speedRatio = Math.min(absSpeed / 3.0, 1);
    const highSpeedDampen = 1.0 - (absSpeed / MAX_SPEED) * 0.35;
    s.rotation += s.steerAngle * STEER_SPEED * speedRatio * highSpeedDampen * dt * (s.speed >= 0 ? 1 : -1);

    // ── Move position: Forward is along [sin(rotation), cos(rotation)] (+Z front) ──
    let nextX = s.position.x + Math.sin(s.rotation) * s.speed * dt;
    let nextZ = s.position.z + Math.cos(s.rotation) * s.speed * dt;

    // Island boundary clamp
    const dist = Math.sqrt(nextX * nextX + nextZ * nextZ);
    if (dist > 44) {
      nextX *= 44 / dist;
      nextZ *= 44 / dist;
      s.speed *= 0.3;
    }

    // ── Obstacle & Water Collision Sliding ──
    const col = resolveObstacleCollision(nextX, nextZ, 1.3);
    s.position.x = col.x;
    s.position.z = col.z;
    if (col.collided) {
      s.speed *= 0.65;
    }

    // ── Precise Terrain Height Alignment ──
    const centerH = getTerrainHeight(s.position.x, s.position.z);

    const forwardX = Math.sin(s.rotation);
    const forwardZ = Math.cos(s.rotation);
    const rightX = Math.cos(s.rotation);
    const rightZ = -Math.sin(s.rotation);

    const frontH = getTerrainHeight(s.position.x + forwardX * 1.1, s.position.z + forwardZ * 1.1);
    const rearH = getTerrainHeight(s.position.x - forwardX * 1.1, s.position.z - forwardZ * 1.1);
    const leftH = getTerrainHeight(s.position.x - rightX * 0.7, s.position.z - rightZ * 0.7);
    const rightH = getTerrainHeight(s.position.x + rightX * 0.7, s.position.z + rightZ * 0.7);

    const targetPitch = -Math.atan2(frontH - rearH, 2.2);
    s.pitch = THREE.MathUtils.lerp(s.pitch, targetPitch, 12 * dt);

    const targetRoll = Math.atan2(rightH - leftH, 1.4);
    s.roll = THREE.MathUtils.lerp(s.roll, targetRoll, 12 * dt);

    s.position.y = centerH + 0.38;
    s.suspensionBounce = Math.sin(absSpeed * 8 * dt) * 0.015 * (absSpeed / MAX_SPEED);

    // ── Apply to vehicle group ──
    if (groupRef.current) {
      groupRef.current.position.copy(s.position);
      groupRef.current.rotation.y = s.rotation;
      groupRef.current.rotation.x = s.pitch;
      groupRef.current.rotation.z = s.roll;
    }

    // Chassis dynamic tilt (lean into turns)
    if (chassisRef.current) {
      chassisRef.current.position.y = s.suspensionBounce;
      chassisRef.current.rotation.z = -s.steerAngle * speedRatio * 0.06;
      chassisRef.current.rotation.x = (inp.forward ? -0.03 : inp.backward ? 0.03 : 0);
    }

    // ── Spin wheels ──
    const wheelSpin = s.speed * dt * 3.5;
    [wheelFLRef, wheelFRRef, wheelRLRef, wheelRRRef].forEach((w) => {
      if (w.current) w.current.rotation.x += wheelSpin;
    });

    // Visual front wheel turning
    if (wheelFLRef.current) wheelFLRef.current.rotation.y = -s.steerAngle * 0.35;
    if (wheelFRRef.current) wheelFRRef.current.rotation.y = -s.steerAngle * 0.35;

    // ── Dynamic Engine Audio Fade & Pitch Modulation ──
    const audio = driveAudioRef.current;
    if (audio) {
      const targetVol = absSpeed > 0.25 ? Math.min(0.24, (absSpeed / MAX_SPEED) * 0.24) : 0.0;
      engineVolumeRef.current = THREE.MathUtils.lerp(engineVolumeRef.current, targetVol, 10 * dt);

      if (engineVolumeRef.current > 0.002) {
        if (audio.paused) {
          audio.play().catch(() => {});
        }
        audio.volume = Math.max(0, Math.min(1, engineVolumeRef.current));
        audio.playbackRate = 0.85 + (absSpeed / MAX_SPEED) * 0.45;
      } else {
        audio.volume = 0;
        if (!audio.paused) {
          audio.pause();
        }
      }
    }

    // ── Smooth Interactive Orbital Camera Follow ──
    const orb = orbitState.current;

    // Smoothly damp orbital angles & distance
    orb.azimuth = THREE.MathUtils.lerp(orb.azimuth, orb.targetAzimuth, 10 * dt);
    orb.elevation = THREE.MathUtils.lerp(orb.elevation, orb.targetElevation, 10 * dt);
    orb.distance = THREE.MathUtils.lerp(orb.distance, orb.targetDistance, 8 * dt);

    // Calculate spherical camera position
    const cosElev = Math.cos(orb.elevation);
    const sinElev = Math.sin(orb.elevation);
    const camOffsetX = Math.sin(orb.azimuth) * cosElev * orb.distance;
    const camOffsetY = sinElev * orb.distance;
    const camOffsetZ = Math.cos(orb.azimuth) * cosElev * orb.distance;

    const targetCamPos = new THREE.Vector3(
      s.position.x + camOffsetX,
      Math.max(0.8, s.position.y + camOffsetY),
      s.position.z + camOffsetZ
    );

    // Predictive look-ahead lead in driving direction for cinematic smoothness
    const forwardLead = Math.min(absSpeed / MAX_SPEED, 1.0) * 1.6;
    const leadX = Math.sin(s.rotation) * forwardLead;
    const leadZ = Math.cos(s.rotation) * forwardLead;

    const targetLookPos = new THREE.Vector3(
      s.position.x + leadX,
      s.position.y + 0.85,
      s.position.z + leadZ
    );

    // Silky smooth camera position & lookAt lerp (no micro-jitter)
    orb.cameraPosSmooth.lerp(targetCamPos, 6.0 * dt);
    orb.cameraLookSmooth.lerp(targetLookPos, 7.5 * dt);

    camera.position.copy(orb.cameraPosSmooth);
    camera.lookAt(orb.cameraLookSmooth);

    // ── Report position ──
    onPositionUpdate?.(s.position.clone());
  });

  return (
    <group ref={groupRef} position={[0, 0.38, 14.0]}>
      
      {/* ── Chassis & Body ── */}
      <group ref={chassisRef}>
        {/* Main Red Body Tub */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.45, 2.6]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.2} flatShading />
        </mesh>

        {/* Sculpted Hood & Nose (Front is +Z) */}
        <mesh position={[0, 0.48, 0.65]} castShadow>
          <boxGeometry args={[1.35, 0.25, 1.1]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.4} flatShading />
        </mesh>

        {/* Hood Scoop / Vents */}
        <mesh position={[0, 0.65, 0.55]} castShadow>
          <boxGeometry args={[0.7, 0.1, 0.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} flatShading />
        </mesh>

        {/* Cabin Glass / Canopy */}
        <mesh position={[0, 0.75, -0.2]} castShadow>
          <boxGeometry args={[1.25, 0.45, 1.3]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.1}
            metalness={0.8}
            flatShading
          />
        </mesh>

        {/* Dark Roll-Cage Bars */}
        <group position={[0, 0.85, -0.2]}>
          <mesh position={[-0.65, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.4, 6]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0.65, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.4, 6]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.2, 0.65]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.3, 6]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.2, -0.65]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.3, 6]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>

        {/* Roof Light Bar */}
        <group position={[0, 1.1, 0.35]}>
          {[-0.45, -0.15, 0.15, 0.45].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]}>
              <boxGeometry args={[0.2, 0.12, 0.1]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#facc15"
                emissiveIntensity={2.0 * lampMultiplier}
              />
            </mesh>
          ))}
        </group>

        {/* Front Winch Bumper (+Z) */}
        <mesh position={[0, 0.18, 1.38]} castShadow>
          <boxGeometry args={[1.6, 0.28, 0.22]} />
          <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Rear Heavy Duty Bumper (-Z) */}
        <mesh position={[0, 0.18, -1.38]} castShadow>
          <boxGeometry args={[1.6, 0.28, 0.22]} />
          <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Exhaust Pipe */}
        <mesh position={[-0.55, 0.2, -1.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* ── Front Headlights & Ground Beam (+Z) ── */}
        <group position={[0, 0.32, 1.45]}>
          <mesh position={[-0.5, 0, 0]}>
            <boxGeometry args={[0.28, 0.18, 0.08]} />
            <meshStandardMaterial
              color="#fffbeb"
              emissive="#fde047"
              emissiveIntensity={3.0 * lampMultiplier}
            />
          </mesh>
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[0.28, 0.18, 0.08]} />
            <meshStandardMaterial
              color="#fffbeb"
              emissive="#fde047"
              emissiveIntensity={3.0 * lampMultiplier}
            />
          </mesh>

          {/* Night Spotlight Beam facing +Z */}
          <spotLight
            position={[0, 0.5, 0]}
            target-position={[0, -1, 15]}
            angle={0.65}
            penumbra={0.8}
            intensity={6 * lampMultiplier}
            color="#fef08a"
            distance={22}
            castShadow
          />
        </group>

        {/* Tail Lights (-Z) */}
        <mesh position={[-0.55, 0.35, -1.42]}>
          <boxGeometry args={[0.25, 0.12, 0.05]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5 * lampMultiplier} />
        </mesh>
        <mesh position={[0.55, 0.35, -1.42]}>
          <boxGeometry args={[0.25, 0.12, 0.05]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5 * lampMultiplier} />
        </mesh>
      </group>

      {/* ── Chunky Off-Road Wheels ── */}
      {/* Front Wheels (+Z) */}
      <group ref={wheelFLRef} position={[-0.95, 0.22, 0.85]}>
        <WheelMesh />
      </group>
      <group ref={wheelFRRef} position={[0.95, 0.22, 0.85]}>
        <WheelMesh isRight />
      </group>
      {/* Rear Wheels (-Z) */}
      <group ref={wheelRLRef} position={[-0.95, 0.22, -0.85]}>
        <WheelMesh />
      </group>
      <group ref={wheelRRRef} position={[0.95, 0.22, -0.85]}>
        <WheelMesh isRight />
      </group>
    </group>
  );
}

function WheelMesh({ isRight }: { isRight?: boolean }) {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.32, 14]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, isRight ? -0.16 : 0.16, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} flatShading />
      </mesh>
      <mesh position={[0, isRight ? -0.18 : 0.18, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 6]} />
        <meshStandardMaterial color="#dc2626" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}
