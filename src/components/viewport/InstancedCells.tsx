import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CellInstance } from '../../types/project';
import { generateCellGeometry } from '../../lib/meshGenerators';
import { generateCellTexture } from '../../lib/textureGenerators';

interface InstancedCellsProps {
  cells: CellInstance[];
}

interface InstancedGroup {
  cellId: number;
  instances: CellInstance[];
  mesh: THREE.InstancedMesh;
  material: THREE.MeshLambertMaterial;
}

const INSTANCING_THRESHOLD = 10; // Minimum cells to use instancing

export function InstancedCells({ cells }: InstancedCellsProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Group cells by cellId for instancing
  const cellGroups = useMemo(() => {
    const groups = new Map<number, CellInstance[]>();

    cells.forEach(cell => {
      if (!groups.has(cell.cellId)) {
        groups.set(cell.cellId, []);
      }
      groups.get(cell.cellId)!.push(cell);
    });

    return groups;
  }, [cells]);

  // Create instanced meshes for groups above threshold
  const instancedGroups = useMemo(() => {
    const groups: InstancedGroup[] = [];

    cellGroups.forEach((instances, cellId) => {
      if (instances.length >= INSTANCING_THRESHOLD) {
        // Get cell geometry (assume first cell's form factor for now)
        // In real implementation, we'd look up cell specs from database
        const geometry = generateCellGeometry({
          length: 65, // Default 18650 length
          diameter: 18, // Default 18650 diameter
          formFactor: '18650'
        });

        // Create material with texture
        const texture = generateCellTexture('#4a90e2');
        const material = new THREE.MeshLambertMaterial({
          map: texture,
        });

        // Create instanced mesh
        const mesh = new THREE.InstancedMesh(geometry, material, instances.length);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        groups.push({
          cellId,
          instances,
          mesh,
          material,
        });
      }
    });

    return groups;
  }, [cellGroups]);

  // Update instanced mesh transforms
  useEffect(() => {
    instancedGroups.forEach(group => {
      const matrix = new THREE.Matrix4();

      group.instances.forEach((instance, index) => {
        // Create transformation matrix
        matrix.makeRotationFromEuler(new THREE.Euler(...instance.rotation));
        matrix.setPosition(new THREE.Vector3(...instance.position));
        matrix.scale(new THREE.Vector3(1, 1, 1)); // Scale not implemented in CellInstance yet

        group.mesh.setMatrixAt(index, matrix);
      });

      group.mesh.instanceMatrix.needsUpdate = true;
      group.mesh.computeBoundingBox();
      group.mesh.computeBoundingSphere();
    });
  }, [instancedGroups]);

  // Render individual cells for small groups
  const individualCells = useMemo(() => {
    const individuals: CellInstance[] = [];

    cellGroups.forEach((instances, cellId) => {
      if (instances.length < INSTANCING_THRESHOLD) {
        individuals.push(...instances);
      }
    });

    return individuals;
  }, [cellGroups]);

  return (
    <group ref={groupRef}>
      {/* Instanced meshes */}
      {instancedGroups.map(group => (
        <primitive
          key={`instanced-${group.cellId}`}
          object={group.mesh}
        />
      ))}

      {/* Individual meshes for small groups */}
      {individualCells.map(cell => (
        <CellMesh key={cell.uuid} cell={cell} />
      ))}
    </group>
  );
}

// Individual cell mesh component
interface CellMeshProps {
  cell: CellInstance;
}

function CellMesh({ cell }: CellMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate geometry based on cell specs
  // In real implementation, look up from database
  const geometry = useMemo(() => generateCellGeometry({
    length: 65, // Default 18650
    diameter: 18,
    formFactor: '18650'
  }), []);

  const material = useMemo(() => {
    const texture = generateCellTexture('#4a90e2');
    return new THREE.MeshLambertMaterial({ map: texture });
  }, []);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...cell.position);
      meshRef.current.rotation.set(...cell.rotation);
    }
  }, [cell.position, cell.rotation]);

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
}