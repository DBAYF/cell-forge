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
    <div className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-sm border-t border-slate-600/30 px-6 py-3 flex items-center justify-between text-sm shadow-lg">
      {/* Left side - Object counts */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-slate-300 font-medium">
            Objects: <span className="text-blue-300 font-bold">{objectCount}</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-slate-300 font-medium">
            Selected: <span className="text-green-300 font-bold">{selectedCount}</span>
          </span>
        </div>
      </div>

      {/* Center - Electrical info */}
      <div className="flex items-center space-x-8">
        {topology ? (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-emerald-300 font-medium">
                {topology.configuration}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-300 font-medium">
                {topology.nominalVoltage.toFixed(1)}V
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-purple-300 font-medium">
                {(topology.totalCapacityAh * 1000).toFixed(0)}mAh
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span className="text-amber-300 font-medium">
                {(topology.totalEnergyWh).toFixed(1)}Wh
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
            <span className="text-slate-500 font-medium">No electrical data</span>
          </div>
        )}
      </div>

      {/* Right side - Settings */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${snapEnabled ? 'bg-cyan-400' : 'bg-slate-600'}`}></div>
          <span className="text-slate-300 font-medium">
            Snap: <span className={`font-bold ${snapEnabled ? 'text-cyan-300' : 'text-slate-500'}`}>
              {snapEnabled ? `${snapIncrement}mm` : 'Off'}
            </span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
          <span className="text-slate-300 font-medium">
            Grid: <span className="text-slate-400 font-bold">{gridSize}mm</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
          <span className="text-slate-300 font-medium">
            Units: <span className="text-indigo-300 font-bold">mm</span>
          </span>
        </div>
      </div>
    </div>
  );
}