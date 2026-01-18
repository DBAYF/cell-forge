import { useMemo } from 'react';
import * as THREE from 'three';
import { Component } from '../../types/project';
import { generateMaterialTexture } from '../../lib/textureGenerators';

interface ComponentsProps {
  components: Component[];
}

export function Components({ components }: ComponentsProps) {
  return (
    <group>
      {components.map(component => (
        <ComponentMesh key={component.uuid} component={component} />
      ))}
    </group>
  );
}

interface ComponentMeshProps {
  component: Component;
}

function ComponentMesh({ component }: ComponentMeshProps) {
  // Generate geometry based on component type
  const geometry = useMemo(() => {
    switch (component.componentType) {
      case 'bms':
        // Simple rectangular BMS module
        return new THREE.BoxGeometry(50, 10, 30);
      case 'shape':
        // Generic shape - in real implementation, load from GLB
        return new THREE.BoxGeometry(20, 20, 20);
      case 'custom':
        // Custom mesh - in real implementation, load from imported file
        return new THREE.BoxGeometry(10, 10, 10);
      default:
        return new THREE.BoxGeometry(10, 10, 10);
    }
  }, [component.componentType]);

  const material = useMemo(() => {
    const texture = generateMaterialTexture('metallic');
    return new THREE.MeshLambertMaterial({ map: texture });
  }, []);

  return (
    <mesh
      position={component.position}
      rotation={component.rotation}
      scale={component.scale}
      geometry={geometry}
      material={material}
      userData={{ uuid: component.uuid }}
    />
  );
}