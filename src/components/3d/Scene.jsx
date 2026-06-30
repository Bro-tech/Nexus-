import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

export default function Scene({ children, className }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className ?? ''}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={Math.min(window.devicePixelRatio, 1.5)} // cap dpr for perf
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[8, 8, 4]} intensity={1.5} />
        <directionalLight position={[-8, -8, -4]} intensity={0.8} color="#E6E6FA" />
        <pointLight position={[0, 4, 0]} intensity={1} color="#FFB09C" />

        <Suspense fallback={null}>
          <Environment preset="city" />
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
