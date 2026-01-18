import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useSceneStore } from '../../stores';
import { Scene } from './Scene';
import { CameraController } from './CameraController';
import { useUIStore } from '../../stores';

export function ViewportCanvas() {
  const gridVisible = useUIStore((state) => state.gridVisible);
  const gridSize = useUIStore((state) => state.gridSize);

  return (
    <div className="w-full h-full bg-gray-900">
      <Canvas
        camera={{
          position: [100, 100, 100],
          fov: 50,
          near: 0.1,
          far: 10000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        shadows={false} // Disable shadows for performance
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow={false}
        />
        <directionalLight
          position={[-10, -10, -5]}
          intensity={0.3}
          castShadow={false}
        />

        {/* Camera Controls */}
        <CameraController />

        {/* Grid */}
        {gridVisible && (
          <Grid
            args={[gridSize * 10, gridSize * 10]}
            cellSize={gridSize}
            cellThickness={0.5}
            cellColor="#404040"
            sectionSize={gridSize * 5}
            sectionThickness={1}
            sectionColor="#606060"
            fadeDistance={1000}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={true}
          />
        )}

        {/* Scene Content */}
        <Suspense fallback={null}>
          <Scene />
        </Suspense>

        {/* Gizmos */}
        <GizmoHelper
          alignment="bottom-right"
          margin={[80, 80]}
        >
          <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="black" />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}