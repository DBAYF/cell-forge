import React, { Suspense, useEffect, useRef, useCallback, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Grid, GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei';
import { useSceneStore } from '../../stores';
import { Scene } from './Scene';
import { CameraController } from './CameraController';
import { SelectionHandler } from './SelectionHandler';
import { TransformGizmo } from './TransformGizmo';
import { useUIStore } from '../../stores';
import * as THREE from 'three';

// Mouse coordinate tracking for battery design
interface MouseCoords {
  screen: THREE.Vector2;
  normalized: THREE.Vector2;
  world: THREE.Vector3;
  gridSnapped: THREE.Vector3;
  snapPoint: THREE.Vector3;
}

function CanvasContent() {
  const { camera, gl, scene, raycaster } = useThree();
  const gridVisible = useUIStore((state) => state.gridVisible);
  const gridSize = useUIStore((state) => state.gridSize);
  const activeTool = useUIStore((state) => state.activeTool);
  const selectedUuids = useSceneStore((state) => state.selectedUuids);
  const addCell = useSceneStore((state) => state.addCell);
  const selectObjects = useSceneStore((state) => state.select);

  // Mouse coordinate state
  const [mouseCoords, setMouseCoords] = useState<MouseCoords>({
    screen: new THREE.Vector2(),
    normalized: new THREE.Vector2(),
    world: new THREE.Vector3(),
    gridSnapped: new THREE.Vector3(),
    snapPoint: new THREE.Vector3()
  });

  // Mouse interaction state
  const [mouseState, setMouseState] = useState({
    isLeftDown: false,
    isMiddleDown: false,
    isRightDown: false,
    lastClickTime: 0,
    clickCount: 0
  });

  // Cursor state
  const [cursor, setCursor] = useState('default');

  // Update mouse coordinates
  const updateMouseCoords = useCallback((clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect();

    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    const normalizedX = (screenX / rect.width) * 2 - 1;
    const normalizedY = -(screenY / rect.height) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), camera);

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const worldPos = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, worldPos);

    const snapped = new THREE.Vector3(
      Math.round(worldPos.x / gridSize) * gridSize,
      Math.round(worldPos.y / gridSize) * gridSize,
      Math.round(worldPos.z / gridSize) * gridSize
    );

    setMouseCoords({
      screen: new THREE.Vector2(screenX, screenY),
      normalized: new THREE.Vector2(normalizedX, normalizedY),
      world: worldPos,
      gridSnapped: snapped,
      snapPoint: snapped.clone()
    });
  }, [camera, gl, raycaster, gridSize]);

  // Raycast against battery components
  const raycastBatteryComponents = useCallback((normalizedX: number, normalizedY: number) => {
    raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), camera);

    const intersectableObjects: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj.userData?.type === 'battery-cell' || obj.userData?.type === 'bms' || obj.userData?.selectable !== false) {
        intersectableObjects.push(obj);
      }
    });

    const intersects = raycaster.intersectObjects(intersectableObjects, true);

    if (intersects.length > 0) {
      return {
        object: intersects[0].object,
        point: intersects[0].point,
        normal: intersects[0].face?.normal,
        distance: intersects[0].distance
      };
    }
    return null;
  }, [camera, raycaster, scene]);

  // Update cursor based on what's under mouse
  const updateCursor = useCallback((normalizedX: number, normalizedY: number) => {
    const intersection = raycastBatteryComponents(normalizedX, normalizedY);

    if (activeTool) {
      switch (activeTool) {
        case 'add-cell':
        case 'add-bms':
          setCursor('crosshair');
          return;
      }
    }

    if (intersection) {
      setCursor('pointer');
    } else {
      setCursor('default');
    }
  }, [activeTool, raycastBatteryComponents]);

  return (
    <>
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

      {/* Camera Controls - Touch enabled */}
      <OrbitControls
        enableDamping={true}
        dampingFactor={0.05}
        screenSpacePanning={false}
        minDistance={5}
        maxDistance={500}
        maxPolarAngle={Math.PI}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        zoomSpeed={1}
        panSpeed={1}
        rotateSpeed={1}
        // Touch-specific settings
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        }}
      />

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
    </>
  );
}

export function ViewportCanvas() {
  console.log('ViewportCanvas rendering...');
  console.log('THREE available:', typeof THREE);
  console.log('THREE.Vector3 available:', typeof THREE?.Vector3);

  const gridVisible = useUIStore((state) => state.gridVisible);
  const gridSize = useUIStore((state) => state.gridSize);
  const activeTool = useUIStore((state) => state.activeTool);
  const selectedUuids = useSceneStore((state) => state.selectedUuids);
  const addCell = useSceneStore((state) => state.addCell);

  console.log('Canvas state:', { gridVisible, gridSize, activeTool, selectedUuids: selectedUuids.size });

  // Ensure THREE.js is available
  useEffect(() => {
    if (typeof THREE === 'undefined') {
      console.error('THREE.js is not available!');
    } else {
      console.log('THREE.js is available, version:', THREE.REVISION);
    }
  }, []);

  // Handle drag and drop from library
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();

    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));

      if (data.type === 'cell') {
        // Use advanced raycasting for precise drop position
        const rect = event.currentTarget.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const normalizedX = (screenX / rect.width) * 2 - 1;
        const normalizedY = -(screenY / rect.height) * 2 + 1;

        // Create a temporary raycaster for drop position
        const tempRaycaster = new THREE.Raycaster();
        const tempCamera = new THREE.PerspectiveCamera(50, rect.width / rect.height, 0.1, 10000);
        tempCamera.position.set(100, 100, 100);
        tempCamera.lookAt(0, 0, 0);

        tempRaycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), tempCamera);

        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const worldPos = new THREE.Vector3();
        tempRaycaster.ray.intersectPlane(groundPlane, worldPos);

        addCell(data.cellId, [worldPos.x, 0, worldPos.z]);
      }
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Touch and mouse event handlers for battery design
  const [cursor, setCursor] = useState('default');
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [isMultiTouch, setIsMultiTouch] = useState(false);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    // Update coordinates and cursor for battery design interactions
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX = event.clientX;
    const clientY = event.clientY;
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    // Update cursor based on active tool and what's under mouse/touch
    if (activeTool === 'add-cell' || activeTool === 'add-bms') {
      setCursor('crosshair');
    } else {
      setCursor('default');
    }
  }, [activeTool]);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    event.preventDefault();

    if (event.button === 0 || event.pointerType === 'touch') { // Left click or touch for battery component interaction
      const rect = event.currentTarget.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;
      const normalizedX = (screenX / rect.width) * 2 - 1;
      const normalizedY = -(screenY / rect.height) * 2 + 1;

      const intersection = raycastBatteryComponents(normalizedX, normalizedY);

      if (activeTool === 'add-cell') {
        // Add a new battery cell at the clicked position
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const worldPos = new THREE.Vector3();
        raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), camera);
        raycaster.ray.intersectPlane(groundPlane, worldPos);

        // Add cell at grid-snapped position
        const gridSnapped = new THREE.Vector3(
          Math.round(worldPos.x / gridSize) * gridSize,
          0,
          Math.round(worldPos.z / gridSize) * gridSize
        );

        addCell(1, [gridSnapped.x, gridSnapped.y, gridSnapped.z]); // Default cell ID = 1
        console.log('Added battery cell at:', gridSnapped);
      } else if (intersection) {
        // Select the intersected object
        const uuid = intersection.object.userData?.uuid;
        if (uuid) {
          selectObjects([uuid], 'replace');
          console.log('Selected object:', uuid);
        }
      } else {
        // Clicked on empty space - clear selection
        selectObjects([], 'replace');
        console.log('Cleared selection');
      }
    }
  }, [activeTool, raycastBatteryComponents, camera, raycaster, gridSize, addCell, selectObjects]);

  // Touch-specific handlers
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();

    const touches = event.touches;
    if (touches.length === 1) {
      // Single touch
      const touch = touches[0];
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      });
      setIsMultiTouch(false);
    } else if (touches.length === 2) {
      // Multi-touch (pinch)
      setIsMultiTouch(true);
      setTouchStart(null);
    }
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    event.preventDefault();

    const touches = event.touches;
    if (touches.length === 2 && isMultiTouch) {
      // Handle pinch-to-zoom
      const touch1 = touches[0];
      const touch2 = touches[1];

      // Calculate pinch distance for zoom
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      // Implement pinch-to-zoom logic here
      console.log('Pinch distance:', distance);
    }
  }, [isMultiTouch]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    event.preventDefault();

    if (touchStart && event.changedTouches.length === 1) {
      const touch = event.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStart.x);
      const deltaY = Math.abs(touch.clientY - touchStart.y);
      const deltaTime = Date.now() - touchStart.time;

      // Detect tap vs swipe
      if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
        // This is a tap - handle selection
        console.log('Tap detected for battery component');
      }
    }

    setTouchStart(null);
    setIsMultiTouch(false);
  }, [touchStart]);

  return (
    <div
      className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden"
      style={{ cursor }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      </div>

      {/* Conditionally render Canvas only if THREE.js is available */}
      {typeof THREE !== 'undefined' ? (
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
        <CanvasContent />
      </Canvas>
      ) : (
        /* Fallback for when THREE.js is not available */
        <div className="absolute inset-0 flex items-center justify-center text-white text-center p-8">
          <div className="bg-red-900/50 backdrop-blur-sm rounded-lg p-6 max-w-md border border-red-500/50">
            <div className="text-2xl font-bold mb-2 text-red-400">⚠️ 3D Engine Error</div>
            <div className="text-sm opacity-75 mb-2">THREE.js library failed to load</div>
            <div className="text-xs opacity-50 mb-4">This prevents the 3D canvas from rendering</div>
            <div className="text-xs opacity-75 bg-slate-800 p-2 rounded">
              Check browser console for details. Try refreshing or using a different browser.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}