"use client";

import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Sparkles, ContactShadows, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Procedural Fallback Hardware (Cyber GPU) if GLB is loading or not present
function ProceduralGPU() {
  const meshRef = useRef<THREE.Group>(null);
  const fan1Ref = useRef<THREE.Mesh>(null);
  const fan2Ref = useRef<THREE.Mesh>(null);
  const fan3Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (fan1Ref.current) fan1Ref.current.rotation.z += delta * 6;
    if (fan2Ref.current) fan2Ref.current.rotation.z += delta * 6;
    if (fan3Ref.current) fan3Ref.current.rotation.z += delta * 6;
  });

  return (
    <group ref={meshRef}>
      {/* GPU PCB / Base Plate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.2, 1.8, 0.15]} />
        <meshStandardMaterial color="#0c1018" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Heatsink Fins (Stylized) */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[4.0, 1.6, 0.25]} />
        <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Shroud Frame */}
      <mesh position={[0, 0, 0.38]}>
        <boxGeometry args={[4.1, 1.7, 0.12]} />
        <meshStandardMaterial color="#090d16" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Cyber Neon Accents */}
      <mesh position={[0, 0.86, 0.39]}>
        <boxGeometry args={[3.8, 0.05, 0.05]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, -0.86, 0.39]}>
        <boxGeometry args={[3.8, 0.05, 0.05]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2} />
      </mesh>

      {/* Fan 1 */}
      <group position={[-1.3, 0, 0.44]}>
        <mesh ref={fan1Ref}>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} wireframe />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.09, 16]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Fan 2 (Center) */}
      <group position={[0, 0, 0.44]}>
        <mesh ref={fan2Ref}>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} wireframe />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.09, 16]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Fan 3 */}
      <group position={[1.3, 0, 0.44]}>
        <mesh ref={fan3Ref}>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} wireframe />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.09, 16]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* PCIe Gold Connector */}
      <mesh position={[-0.5, -0.98, 0]}>
        <boxGeometry args={[2.5, 0.15, 0.05]} />
        <meshStandardMaterial color="#eab308" metalness={0.99} roughness={0.1} />
      </mesh>

      {/* Metal Bracket */}
      <mesh position={[-2.12, 0, 0.2]}>
        <boxGeometry args={[0.08, 2.2, 0.5]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Model Loader from .glb file with fallback
function ModelRenderer({ modelPath }: { modelPath?: string }) {
  if (!modelPath) {
    return <ProceduralGPU />;
  }

  return <GLTFModel path={modelPath} />;
}

function GLTFModel({ path }: { path: string }) {
  try {
    const gltf = useGLTF(path);
    return <primitive object={gltf.scene} scale={1.5} />;
  } catch {
    return <ProceduralGPU />;
  }
}

// Looping animated container
function AnimatedScene({ modelPath }: { modelPath?: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth continuous 360 rotation
      groupRef.current.rotation.y += delta * 0.4;
      // Gentle wobble / pitch
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.8}>
        <ModelRenderer modelPath={modelPath} />
      </Float>
    </group>
  );
}

export interface HeroHardwareCanvasProps {
  modelPath?: string;
  className?: string;
}

export default function HeroHardwareCanvas({ modelPath, className }: HeroHardwareCanvasProps) {
  return (
    <div className={`w-full h-full min-h-[420px] relative ${className || ""}`}>
      <Canvas
        camera={{ position: [0, 1.2, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 6, 4]} intensity={1.8} color="#ffffff" />
        <pointLight position={[-4, 2, 2]} intensity={2.5} color="#06b6d4" />
        <pointLight position={[4, -2, -2]} intensity={2.5} color="#8b5cf6" />
        <spotLight position={[0, 5, 2]} intensity={1.5} angle={0.6} penumbra={1} color="#38bdf8" />

        <Suspense fallback={<ProceduralGPU />}>
          <AnimatedScene modelPath={modelPath} />
        </Suspense>

        {/* Ambient Web3 Sci-Fi Particles */}
        <Sparkles count={45} scale={6} size={2.5} speed={0.4} opacity={0.6} color="#38bdf8" />
        
        {/* Soft Floor Shadow */}
        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.6}
          scale={8}
          blur={2.4}
          far={4}
          color="#06b6d4"
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.6}
        />
      </Canvas>
    </div>
  );
}
