import { useMemo } from 'react';
import * as THREE from 'three';
import { Connection } from '../../types/project';

interface ConnectionLinesProps {
  connections: Connection[];
}

export function ConnectionLines({ connections }: ConnectionLinesProps) {
  const lines = useMemo(() => {
    return connections.map(connection => {
      // For now, create simple straight lines between cells
      // In real implementation, we'd have proper terminal positions
      const startPos = new THREE.Vector3(0, 0, 0); // TODO: Get actual terminal position
      const endPos = new THREE.Vector3(10, 0, 0);  // TODO: Get actual terminal position

      // Create line geometry
      const geometry = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);

      // Color based on connection type
      let color = '#ffffff';
      switch (connection.connectionType) {
        case 'series':
          color = '#10b981'; // Green for series
          break;
        case 'parallel':
          color = '#f59e0b'; // Orange for parallel
          break;
        case 'busbar':
          color = '#ef4444'; // Red for busbar
          break;
      }

      return {
        id: connection.uuid,
        geometry,
        color,
      };
    });
  }, [connections]);

  return (
    <group>
      {lines.map(line => (
        <line key={line.id}>
          <bufferGeometry attach="geometry" {...line.geometry} />
          <lineBasicMaterial attach="material" color={line.color} linewidth={2} />
        </line>
      ))}
    </group>
  );
}