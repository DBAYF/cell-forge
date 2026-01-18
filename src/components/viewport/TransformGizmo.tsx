import { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore, useUIStore } from '../../stores';

export function TransformGizmo() {
  const { scene } = useThree();
  const transformMode = useUIStore((state) => state.transformMode);
  const selectedUuids = useSceneStore((state) => state.selectedUuids);
  const updateTransform = useSceneStore((state) => state.updateTransform);

  const transformControlsRef = useRef<any>();
  const [targetObject, setTargetObject] = useState<THREE.Object3D | null>(null);

  // Find the target object for transformation (first selected object)
  useEffect(() => {
    if (selectedUuids.size === 0) {
      setTargetObject(null);
      return;
    }

    const firstSelectedUuid = Array.from(selectedUuids)[0];
    let targetObj: THREE.Object3D | null = null;

    scene.traverse((child) => {
      if (child.userData?.uuid === firstSelectedUuid) {
        targetObj = child;
      }
    });

    setTargetObject(targetObj);
  }, [selectedUuids, scene]);

  // Handle transform events
  const handleObjectChange = () => {
    if (!transformControlsRef.current || !targetObject) return;

    const uuid = targetObject.userData?.uuid;
    if (!uuid) return;

    const newPosition = transformControlsRef.current.object.position.toArray();
    const newRotation = transformControlsRef.current.object.rotation.toArray();
    const newScale = transformControlsRef.current.object.scale.toArray();

    updateTransform(uuid, {
      position: newPosition,
      rotation: newRotation.slice(0, 3), // Only take XYZ components
      scale: newScale,
    });
  };

  // Configure transform mode
  useEffect(() => {
    if (transformControlsRef.current) {
      transformControlsRef.current.setMode(transformMode);
    }
  }, [transformMode]);

  if (!targetObject) return null;

  return (
    <TransformControls
      ref={transformControlsRef}
      object={targetObject}
      mode={transformMode}
      onObjectChange={handleObjectChange}
    />
  );
}