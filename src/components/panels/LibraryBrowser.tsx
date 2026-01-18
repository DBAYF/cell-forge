import React, { useState, useEffect } from 'react';
import { Search, Battery, Cpu, Shapes, Wrench } from 'lucide-react';
import { useUIStore } from '../../stores';
import { Cell } from '../../types/cell';
import { api } from '../../lib/webApi';

export function LibraryBrowser() {
  const libraryTab = useUIStore((state) => state.libraryTab);
  const librarySearch = useUIStore((state) => state.librarySearch);
  const setLibraryTab = useUIStore((state) => state.setLibraryTab);
  const setLibrarySearch = useUIStore((state) => state.setLibrarySearch);

  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch cells from API (Tauri or web fallback)
  useEffect(() => {
    const fetchCells = async () => {
      try {
        const cellData = await api.getCells();
        setCells(cellData);
      } catch (error) {
        console.error('Failed to fetch cells:', error);
        setCells([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCells();
  }, []);

  const filteredCells = cells.filter(cell => {
    if (!librarySearch) return true;
    const searchLower = librarySearch.toLowerCase();
    return (
      cell.manufacturer.toLowerCase().includes(searchLower) ||
      cell.model.toLowerCase().includes(searchLower) ||
      cell.form_factor.toLowerCase().includes(searchLower) ||
      cell.chemistry.toLowerCase().includes(searchLower)
    );
  });

  const tabs = [
    { id: 'cells', label: 'Cells', icon: Battery },
    { id: 'bms', label: 'BMS', icon: Cpu },
    { id: 'shapes', label: 'Shapes', icon: Shapes },
    { id: 'materials', label: 'Materials', icon: Wrench },
  ] as const;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-600/30 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Battery className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              Component Library
            </h2>
            <p className="text-sm text-slate-400">Drag & drop to design</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search batteries, BMS, shapes..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 backdrop-blur-sm placeholder-slate-500"
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex items-center space-x-2 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                  libraryTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50 hover:shadow-md'
                }`}
                onClick={() => setLibraryTab(tab.id)}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {libraryTab === 'cells' && (
          <div className="space-y-2">
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading cells...</div>
            ) : (
              filteredCells.map(cell => (
                <CellItem key={cell.id} cell={cell} />
              ))
            )}
          </div>
        )}

        {libraryTab === 'bms' && (
          <div className="text-center text-gray-400 py-8">
            BMS modules coming soon...
          </div>
        )}

        {libraryTab === 'shapes' && (
          <div className="text-center text-gray-400 py-8">
            Structural shapes coming soon...
          </div>
        )}

        {libraryTab === 'materials' && (
          <div className="text-center text-gray-400 py-8">
            Connection materials coming soon...
          </div>
        )}
      </div>
    </div>
  );
}

interface CellItemProps {
  cell: Cell;
}

function CellItem({ cell }: CellItemProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'cell',
      cellId: cell.id,
    }));
  };

  // Color coding based on chemistry
  const chemistryColor = {
    'NMC': 'from-blue-500 to-blue-600',
    'LFP': 'from-green-500 to-green-600',
    'LCO': 'from-red-500 to-red-600',
    'LMO': 'from-orange-500 to-orange-600',
    'NCA': 'from-purple-500 to-purple-600',
  }[cell.chemistry] || 'from-gray-500 to-gray-600';

  return (
    <div
      className="group relative p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-600/30 hover:border-blue-400/50 cursor-move transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]"
      draggable
      onDragStart={handleDragStart}
    >
      {/* Battery Visual Representation */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* 3D Battery Icon */}
          <div className={`w-10 h-6 bg-gradient-to-r ${chemistryColor} rounded-sm relative shadow-lg`}>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-sm"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-sm"></div>
          </div>

          <div>
            <div className="font-semibold text-white text-sm leading-tight">
              {cell.manufacturer}
            </div>
            <div className="text-blue-300 text-xs font-medium">
              {cell.model}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium">
            {cell.form_factor}
          </div>
          <div className="text-xs text-green-400 font-medium">
            {cell.capacity_mah}mAh
          </div>
        </div>
      </div>

      {/* Battery Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center justify-between bg-slate-700/50 rounded-lg px-2 py-1">
          <span className="text-xs text-slate-400">Voltage</span>
          <span className="text-xs font-semibold text-blue-300">{cell.nominal_voltage}V</span>
        </div>
        <div className="flex items-center justify-between bg-slate-700/50 rounded-lg px-2 py-1">
          <span className="text-xs text-slate-400">Chemistry</span>
          <span className="text-xs font-semibold text-purple-300">{cell.chemistry}</span>
        </div>
      </div>

      {/* Size & Performance */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
          <span className="text-slate-400">
            {cell.diameter_mm}×{cell.length_mm}mm
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-green-400 font-medium">
            {cell.max_discharge_a}A
          </span>
          <span className="text-slate-500">discharge</span>
        </div>
      </div>

      {/* Drag Indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}