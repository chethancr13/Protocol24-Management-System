import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const HolographicPanel = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <boxGeometry args={[3, 2, 0.05]} />
        <meshPhysicalMaterial
          color="#4f46e5"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.9}
          transmission={0.6}
          thickness={0.5}
          envMapIntensity={1}
        />
      </mesh>
      {/* Screen content glow */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[2.8, 1.8]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.15} />
      </mesh>
      {/* Grid lines on panel */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`h-${i}`} position={[0, -0.8 + i * 0.4, 0.04]}>
          <planeGeometry args={[2.6, 0.005]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.4} />
        </mesh>
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`v-${i}`} position={[-1.2 + i * 0.4, 0, 0.04]}>
          <planeGeometry args={[0.005, 1.6]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.3} />
        </mesh>
      ))}
    </Float>
  );
};

const FloatingOrb = ({ position, color, size = 0.3 }: { position: [number, number, number]; color: string; size?: number }) => {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 1.5 + position[0]) * 0.3;
    }
  });

  return (
    <Float speed={3} floatIntensity={0.4}>
      <mesh ref={ref} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <MeshDistortMaterial color={color} transparent opacity={0.6} distort={0.3} speed={2} roughness={0.2} metalness={0.8} />
      </mesh>
    </Float>
  );
};

const NeonRing = ({ radius, color, speed }: { radius: number; color: string; speed: number }) => {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * speed;
      ref.current.rotation.z = clock.getElapsedTime() * speed * 0.5;
    }
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.01, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
};

const HeroScene = () => {
  return (
    <div className="w-full h-[350px] relative -mt-4">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#818cf8" />
        <pointLight position={[-5, -3, 3]} intensity={0.5} color="#06b6d4" />
        <pointLight position={[0, 3, -3]} intensity={0.3} color="#a855f7" />

        <HolographicPanel />
        <FloatingOrb position={[-2.5, 1, -1]} color="#6366f1" size={0.2} />
        <FloatingOrb position={[2.5, -0.5, -1.5]} color="#06b6d4" size={0.25} />
        <FloatingOrb position={[-1.5, -1.5, -0.5]} color="#a855f7" size={0.15} />
        <FloatingOrb position={[1.8, 1.2, -2]} color="#ec4899" size={0.18} />

        <NeonRing radius={2.5} color="#6366f1" speed={0.2} />
        <NeonRing radius={3} color="#06b6d4" speed={-0.15} />

        <Sparkles count={80} scale={8} size={2} speed={0.4} color="#818cf8" />
        <Sparkles count={40} scale={6} size={1.5} speed={0.3} color="#06b6d4" />

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
      </Canvas>
    </div>
  );
};

export default HeroScene;
