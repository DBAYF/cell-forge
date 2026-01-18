import React from 'react';
import { useSceneStore, useUIStore, useElectricalStore } from '../../stores';

export function StatusBar() {
  const cells = useSceneStore((state) => state.cells);
  const connections = useSceneStore((state) => state.connections);
  const selectedUuids = useSceneStore((state) => state.selectedUuids);

  const snapEnabled = useUIStore((state) => state.snapEnabled);
  const snapIncrement = useUIStore((state) => state.snapIncrement);
  const gridSize = useUIStore((state) => state.gridSize);

  const topology = useElectricalStore((state) => state.topology);

  const objectCount = cells.size + connections.size;
  const selectedCount = selectedUuids.size;

  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm text-gray-300">
      {/* Left side - Object counts */}
      <div className="flex items-center space-x-6">
        <span>Objects: {objectCount}</span>
        <span>Selected: {selectedCount}</span>
      </div>

      {/* Center - Electrical info */}
      <div className="flex items-center space-x-6">
        {topology && (
          <>
            <span className="text-green-400">
              {topology.configuration}
            </span>
            <span className="text-blue-400">
              {topology.nominalVoltage.toFixed(1)}V
            </span>
            <span className="text-purple-400">
              {(topology.totalCapacityAh * 1000).toFixed(0)}mAh
            </span>
            <span className="text-orange-400">
              {(topology.totalEnergyWh).toFixed(1)}Wh
            </span>
          </>
        )}
      </div>

      {/* Right side - Settings */}
      <div className="flex items-center space-x-6">
        <span>Snap: {snapEnabled ? `${snapIncrement}mm` : 'Off'}</span>
        <span>Grid: {gridSize}mm</span>
        <span>Units: mm</span>
      </div>
    </div>
  );
}