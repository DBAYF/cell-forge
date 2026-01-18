import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useSceneStore } from '../../stores';
import { Scene } from './Scene';
import { CameraController } from './CameraController';
import { SelectionHandler } from './SelectionHandler';
import { TransformGizmo } from './TransformGizmo';
import { useUIStore } from '../../stores';

export function ViewportCanvas() {
  console.log('ViewportCanvas rendering...');

  const gridVisible = useUIStore((state) => state.gridVisible);
  const gridSize = useUIStore((state) => state.gridSize);
  const activeTool = useUIStore((state) => state.activeTool);
  const selectedUuids = useSceneStore((state) => state.selectedUuids);
  const addCell = useSceneStore((state) => state.addCell);

  console.log('Canvas state:', { gridVisible, gridSize, activeTool, selectedUuids: selectedUuids.size });

  // Handle drag and drop from library
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();

    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));

      if (data.type === 'cell') {
        // Calculate drop position (simplified - should use raycasting)
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 200 - 100;
        const z = ((event.clientY - rect.top) / rect.height) * 200 - 100;

        addCell(data.cellId, [x, 0, z]);
      }
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div
      className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      </div>

      {/* Fallback for when WebGL fails */}
      <div className="absolute inset-0 flex items-center justify-center text-white text-center p-8 z-50 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 max-w-md">
          <div className="text-2xl font-bold mb-2">CellForge 3D</div>
          <div className="text-sm opacity-75">Loading 3D workspace...</div>
          <div className="mt-4 text-xs opacity-50">If this persists, try refreshing the page</div>
        </div>
      </div>

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
        {/* Professional Lighting Setup */}
        <ambientLight intensity={0.3} color="#e8f4fd" />
        <directionalLight
          position={[10, 10, 8]}
          intensity={1.2}
          color="#ffffff"
          castShadow={false}
        />
        <directionalLight
          position={[-8, -8, -5]}
          intensity={0.4}
          color="#a5d6ff"
          castShadow={false}
        />
        <pointLight
          position={[0, 5, 0]}
          intensity={0.5}
          color="#87ceeb"
          distance={50}
        />

        {/* Environment for reflections */}
        <mesh position={[0, 0, 0]} visible={false}>
          <sphereGeometry args={[100, 32, 32]} />
          <meshBasicMaterial color="#e8f4fd" side={THREE.BackSide} />
        </mesh>

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
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#4a90e2" />
          </mesh>
        }>
          <Scene />
        </Suspense>

        {/* Selection Handler */}
        <SelectionHandler />

        {/* Transform Gizmo */}
        {selectedUuids.size > 0 && activeTool === 'transform' && (
          <TransformGizmo />
        )}

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