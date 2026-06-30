import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function BreathingSphere({
  color = "#A8A8E8",
  cycleDuration = 8,
}) {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    // Breathing: scale pulses with sine
    const breathe = 1 + (Math.sin((t / cycleDuration) * Math.PI * 2) * 0.5 + 0.5) * 0.5;
    meshRef.current.scale.setScalar(breathe * 1.5);
    meshRef.current.rotation.y = t * 0.1;

    // Softly shift opacity
    if (materialRef.current) {
      materialRef.current.opacity = 0.4 + Math.sin(t * 0.5) * 0.2;

      const c1 = new THREE.Color("#A8A8E8");
      const c2 = new THREE.Color("#FF937A");
      const blend = (Math.sin((t / cycleDuration) * Math.PI * 2) + 1) * 0.5;
      materialRef.current.color.lerpColors(c1, c2, blend);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        ref={materialRef}
        color={color}
        speed={1}
        distort={0.3}
        roughness={0.0}
        metalness={0.1}
        transmission={0.9}
        ior={1.5}
        thickness={1}
        clearcoat={1}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}
