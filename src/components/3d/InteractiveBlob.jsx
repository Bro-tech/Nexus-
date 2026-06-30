import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function InteractiveBlob({
  baseColor = "#FF937A",
  hoverColor = "#8E8ED6",
  scale = 1,
  position = [0, 0, 0],
  speed = 1.2,
  distort = 0.4,
}) {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    // Gentle idle rotation (GPU-based, no vertex manipulation)
    meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.3;
    meshRef.current.rotation.y = t * 0.15;

    // Parallax with mouse
    const mouse = state.mouse;
    meshRef.current.position.x = position[0] + mouse.x * 0.5;
    meshRef.current.position.y = position[1] + mouse.y * 0.5;
    meshRef.current.position.z = position[2];

    // Shift color over time
    if (materialRef.current) {
      const color1 = new THREE.Color(baseColor);
      const color2 = new THREE.Color(hoverColor);
      const t01 = (Math.sin(t * 0.3) + 1) * 0.5; // cycles 0→1
      materialRef.current.color.lerpColors(color1, color2, t01);
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1.5, 4]} />
      <MeshDistortMaterial
        ref={materialRef}
        color={baseColor}
        speed={speed}
        distort={distort}
        roughness={0.1}
        metalness={0.1}
        transmission={0.85}
        ior={1.5}
        thickness={0.5}
        clearcoat={1}
        clearcoatRoughness={0.05}
      />
    </mesh>
  );
}
