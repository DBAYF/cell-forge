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
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 flex items-center space-x-6 text-xs shadow-2xl">
      {/* Left side - Object counts */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
          <span className="text-slate-300">
            <span className="text-blue-300 font-bold">{objectCount}</span> objects
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
          <span className="text-slate-300">
            <span className="text-green-300 font-bold">{selectedCount}</span> selected
          </span>
        </div>
      </div>

      {/* Center - Electrical info */}
      <div className="flex items-center space-x-4">
        {topology ? (
          <>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              <span className="text-emerald-300 font-medium">
                {topology.configuration}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span className="text-blue-300">
                {topology.nominalVoltage.toFixed(1)}V
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              <span className="text-purple-300">
                {(topology.totalCapacityAh * 1000).toFixed(0)}mAh
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse"></div>
            <span className="text-slate-500">No circuit</span>
          </div>
        )}
      </div>

      {/* Right side - Settings */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${snapEnabled ? 'bg-cyan-400' : 'bg-slate-600'}`}></div>
          <span className="text-slate-300">
            Snap: <span className={`font-bold ${snapEnabled ? 'text-cyan-300' : 'text-slate-500'}`}>
              {snapEnabled ? `${snapIncrement}mm` : 'off'}
            </span>
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
          <span className="text-slate-300">
            Grid: <span className="text-slate-400 font-bold">{gridSize}mm</span>
          </span>
        </div>
      </div>
    </div>
  );
}