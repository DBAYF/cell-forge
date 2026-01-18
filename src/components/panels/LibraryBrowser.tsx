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
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-3">Library</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
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
                className={`flex items-center space-x-2 px-3 py-2 text-sm rounded transition-colors ${
                  libraryTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => setLibraryTab(tab.id)}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
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

  return (
    <div
      className="p-3 bg-gray-700 rounded border border-gray-600 hover:border-gray-500 cursor-pointer transition-colors"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-sm">
          {cell.manufacturer} {cell.model}
        </div>
        <div className="text-xs text-gray-400">
          {cell.form_factor}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
        <div>V: {cell.nominal_voltage}V</div>
        <div>C: {cell.capacity_mah}mAh</div>
        <div>Chem: {cell.chemistry}</div>
        <div>Size: {cell.diameter_mm}×{cell.length_mm}mm</div>
      </div>
    </div>
  );
}