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
  const gridVisible = useUIStore((state) => state.gridVisible);
  const gridSize = useUIStore((state) => state.gridSize);
  const activeTool = useUIStore((state) => state.activeTool);
  const selectedUuids = useSceneStore((state) => state.selectedUuids);
  const addCell = useSceneStore((state) => state.addCell);

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
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
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
        <Suspense fallback={null}>
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