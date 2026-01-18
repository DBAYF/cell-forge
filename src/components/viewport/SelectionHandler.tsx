import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore, useUIStore } from '../../stores';

export function SelectionHandler() {
  const { camera, scene, raycaster, pointer } = useThree();
  const activeTool = useUIStore((state) => state.activeTool);
  const select = useSceneStore((state) => state.select);
  const setHoveredUuid = useSceneStore((state) => state.setHoveredUuid);
  const selectedUuids = useSceneStore((state) => state.selectedUuids);
  const cells = useSceneStore((state) => state.cells);
  const components = useSceneStore((state) => state.components);

  // Handle mouse clicks for selection
  const handlePointerDown = useCallback((event: MouseEvent) => {
    if (activeTool !== 'select') return;

    // Update raycaster
    raycaster.setFromCamera(pointer, camera);

    // Collect all meshes to test against
    const intersectableObjects: THREE.Object3D[] = [];

    // Add cell meshes
    cells.forEach((_, uuid) => {
      scene.traverse((child) => {
        if (child.userData?.uuid === uuid && child instanceof THREE.Mesh) {
          intersectableObjects.push(child);
        }
      });
    });

    // Add component meshes
    components.forEach((_, uuid) => {
      scene.traverse((child) => {
        if (child.userData?.uuid === uuid && child instanceof THREE.Mesh) {
          intersectableObjects.push(child);
        }
      });
    });

    // Perform raycasting
    const intersects = raycaster.intersectObjects(intersectableObjects, false);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      const clickedUuid = clickedObject.userData?.uuid;

      if (clickedUuid) {
        // Handle selection based on modifier keys
        if (event.shiftKey) {
          // Add to selection
          select([clickedUuid], 'add');
        } else if (event.ctrlKey || event.metaKey) {
          // Toggle selection
          select([clickedUuid], 'toggle');
        } else {
          // Replace selection
          select([clickedUuid], 'replace');
        }
      }
    } else if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
      // Clear selection when clicking empty space (unless modifier keys are held)
      select([], 'replace');
    }
  }, [activeTool, camera, cells, components, pointer, raycaster, scene, select]);

  // Handle double clicks for frame selection
  const handleDoubleClick = useCallback(() => {
    if (selectedUuids.size > 0) {
      // TODO: Implement frame selection in camera
      console.log('Frame selection:', Array.from(selectedUuids));
    }
  }, [selectedUuids]);

  // Handle pointer move for hover effects
  const handlePointerMove = useCallback(() => {
    raycaster.setFromCamera(pointer, camera);

    const intersectableObjects: THREE.Object3D[] = [];
    cells.forEach((_, uuid) => {
      scene.traverse((child) => {
        if (child.userData?.uuid === uuid && child instanceof THREE.Mesh) {
          intersectableObjects.push(child);
        }
      });
    });

    components.forEach((_, uuid) => {
      scene.traverse((child) => {
        if (child.userData?.uuid === uuid && child instanceof THREE.Mesh) {
          intersectableObjects.push(child);
        }
      });
    });

    const intersects = raycaster.intersectObjects(intersectableObjects, false);

    if (intersects.length > 0) {
      const hoveredObject = intersects[0].object;
      const hoveredUuid = hoveredObject.userData?.uuid;
      setHoveredUuid(hoveredUuid || null);
    } else {
      setHoveredUuid(null);
    }
  }, [camera, cells, components, pointer, raycaster, scene, setHoveredUuid]);

  // Set up event listeners
  React.useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const handleMouseDown = (event: MouseEvent) => {
      handlePointerDown(event);
    };

    const handleMouseMove = (event: MouseEvent) => {
      handlePointerMove();
    };

    const handleDblClick = (event: MouseEvent) => {
      handleDoubleClick(event);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('dblclick', handleDblClick);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('dblclick', handleDblClick);
    };
  }, [handlePointerDown, handlePointerMove, handleDoubleClick]);

  return null; // This component doesn't render anything
}