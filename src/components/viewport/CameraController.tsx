import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useUIStore } from '../../stores';

export function CameraController() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>();
  const snapEnabled = useUIStore((state) => state.snapEnabled);
  const snapIncrement = useUIStore((state) => state.snapIncrement);

  // Custom snap function for orbit controls
  const snapToGrid = (value: number, increment: number): number => {
    if (!snapEnabled) return value;
    return Math.round(value / increment) * increment;
  };

  useEffect(() => {
    if (controlsRef.current) {
      // Set up keyboard shortcuts for camera
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
          return; // Don't handle if typing in input
        }

        switch (event.code) {
          case 'KeyF':
            // Frame selection (TODO: implement frame selection)
            event.preventDefault();
            break;
          case 'Home':
            // Frame all
            event.preventDefault();
            controlsRef.current.reset();
            break;
          case 'Numpad1':
            // Front view
            event.preventDefault();
            camera.position.set(0, 0, 100);
            camera.lookAt(0, 0, 0);
            controlsRef.current.update();
            break;
          case 'Numpad3':
            // Right view
            event.preventDefault();
            camera.position.set(100, 0, 0);
            camera.lookAt(0, 0, 0);
            controlsRef.current.update();
            break;
          case 'Numpad7':
            // Top view
            event.preventDefault();
            camera.position.set(0, 100, 0);
            camera.lookAt(0, 0, 0);
            controlsRef.current.update();
            break;
          case 'Numpad5':
            // Toggle orthographic/perspective
            event.preventDefault();
            if (camera instanceof THREE.PerspectiveCamera) {
              // Switch to orthographic
              const orthoCamera = new THREE.OrthographicCamera(
                -50, 50, 50, -50, 0.1, 10000
              );
              orthoCamera.position.copy(camera.position);
              orthoCamera.rotation.copy(camera.rotation);
              // TODO: Replace camera in scene
            } else {
              // Switch to perspective
              const perspectiveCamera = new THREE.PerspectiveCamera(
                50, window.innerWidth / window.innerHeight, 0.1, 10000
              );
              perspectiveCamera.position.copy(camera.position);
              perspectiveCamera.rotation.copy(camera.rotation);
              // TODO: Replace camera in scene
            }
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [camera, snapEnabled]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      zoomSpeed={0.6}
      panSpeed={0.8}
      rotateSpeed={0.4}
      minDistance={10}
      maxDistance={2000}
      maxPolarAngle={Math.PI}
      target={[0, 0, 0]}
      makeDefault
    />
  );
}