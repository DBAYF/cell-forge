import React, { useState } from 'react';
import {
  File,
  Save,
  Undo,
  Redo,
  Square,
  Circle,
  Move,
  RotateCw,
  Scaling,
  Grid3X3,
  Magnet,
  Download,
  Zap,
  Copy,
  ChevronUp,
  ChevronDown,
  Battery
} from 'lucide-react';
import { useUIStore, useSceneStore } from '../../stores';

export function Toolbar({ onOpenBatteryCreator }: { onOpenBatteryCreator?: () => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activeTool = useUIStore((state) => state.activeTool);
  const transformMode = useUIStore((state) => state.transformMode);
  const snapEnabled = useUIStore((state) => state.snapEnabled);
  const gridVisible = useUIStore((state) => state.gridVisible);

  const setActiveTool = useUIStore((state) => state.setActiveTool);
  const setTransformMode = useUIStore((state) => state.setTransformMode);
  const setSnapEnabled = useUIStore((state) => state.setSnapEnabled);
  const setGridVisible = useUIStore((state) => state.setGridVisible);

  const undo = useSceneStore((state) => state.undo);
  const redo = useSceneStore((state) => state.redo);
  const addCell = useSceneStore((state) => state.addCell);
  const duplicate = useSceneStore((state) => state.duplicate);
  const selectedUuids = useSceneStore((state) => state.selectedUuids);

  // Helper functions
  const handleNewProject = () => {
    const { clearScene } = useSceneStore.getState();
    clearScene();
    // Reset UI state
    setActiveTool('select');
    setTransformMode('translate');
    setSnapEnabled(true);
    setGridVisible(true);
    console.log('New project created');
  };

  const handleSaveProject = () => {
    // TODO: Implement actual save functionality
    console.log('Save project functionality to be implemented');
  };

  const handleExport = () => {
    // TODO: Implement actual export functionality
    console.log('Export functionality to be implemented');
  };

  const handleCreatePack = () => {
    // Create a basic 4x4 battery pack formation
    const packSize = 4; // 4x4 pack
    const spacing = 20; // 20mm spacing between cells
    const startX = -(packSize - 1) * spacing / 2;
    const startZ = -(packSize - 1) * spacing / 2;

    for (let row = 0; row < packSize; row++) {
      for (let col = 0; col < packSize; col++) {
        const x = startX + col * spacing;
        const z = startZ + row * spacing;
        addCell(1, [x, 0, z]);
      }
    }
    console.log(`Created ${packSize}x${packSize} battery pack`);
  };

  const handleConnectCells = () => {
    // For now, just log that connection mode is active
    // TODO: Implement actual cell connection system
    console.log('Connect cells mode activated');
    setActiveTool('connect');
  };

  const handleDuplicate = () => {
    if (selectedUuids.size > 0) {
      duplicate(Array.from(selectedUuids));
      console.log(`Duplicated ${selectedUuids.size} objects`);
    } else {
      console.log('No objects selected to duplicate');
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-sm border border-slate-600/30 rounded-xl shadow-lg overflow-hidden">
      {/* Header with collapse button */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-slate-600/30">
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white">Battery Design Tools</span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-slate-700/50 rounded transition-colors"
          title={isCollapsed ? "Expand Toolbar" : "Collapse Toolbar"}
        >
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Collapsible content */}
      {!isCollapsed && (
        <div className="px-6 py-3 flex items-center space-x-3">
          {/* File Operations */}
          <div className="flex items-center space-x-2 border-r border-slate-500/30 pr-4 mr-4">
            <button
              className="p-2.5 hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:shadow-md"
              title="New Project"
              onClick={handleNewProject}
            >
              <File className="w-5 h-5 text-slate-300 hover:text-blue-300" />
            </button>
            <button
              className="p-2.5 hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:shadow-md"
              title="Save Project"
              onClick={handleSaveProject}
            >
              <Save className="w-5 h-5 text-slate-300 hover:text-green-300" />
            </button>
            <button
              className="p-2.5 hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:shadow-md"
              title="Export"
              onClick={handleExport}
            >
              <Download className="w-5 h-5 text-slate-300 hover:text-purple-300" />
            </button>
          </div>

          {/* Edit Operations */}
          <div className="flex items-center space-x-1 border-r border-gray-600 pr-2 mr-2">
            <button
              className="p-2.5 hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:shadow-md"
              title="Undo"
              onClick={() => undo()}
            >
              <Undo className="w-5 h-5 text-slate-300 hover:text-orange-300" />
            </button>
            <button
              className="p-2.5 hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:shadow-md"
              title="Redo"
              onClick={() => redo()}
            >
              <Redo className="w-5 h-5 text-slate-300 hover:text-orange-300" />
            </button>
            <button
              className="p-2.5 hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:shadow-md"
              title="Duplicate Selected"
              onClick={handleDuplicate}
            >
              <Copy className="w-5 h-5 text-slate-300 hover:text-purple-300" />
            </button>
          </div>

          {/* Tool Selection */}
          <div className="flex items-center space-x-2 border-r border-slate-500/30 pr-4 mr-4">
            <button
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                activeTool === 'select'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'hover:bg-slate-700/50 text-slate-300 hover:text-blue-300'
              }`}
              title="Select Tool (V)"
              onClick={() => setActiveTool('select')}
            >
              <Square className="w-5 h-5" />
            </button>
            <button
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                activeTool === 'add'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                  : 'hover:bg-slate-700/50 text-slate-300 hover:text-green-300'
              }`}
              title="Add Cell (A)"
              onClick={() => setActiveTool('add')}
            >
              <Circle className="w-5 h-5" />
            </button>
            <button
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                activeTool === 'connect'
                  ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/25'
                  : 'hover:bg-slate-700/50 text-slate-300 hover:text-yellow-300'
              }`}
              title="Connect Wire (C)"
              onClick={() => setActiveTool('connect')}
            >
              <Zap className="w-5 h-5" />
            </button>
            <button
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                activeTool === 'transform'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'hover:bg-slate-700/50 text-slate-300 hover:text-purple-300'
              }`}
              title="Transform (T)"
              onClick={() => setActiveTool('transform')}
            >
              <Move className="w-5 h-5" />
            </button>
          </div>

          {/* Transform Modes */}
          <div className="flex items-center space-x-2 border-r border-slate-500/30 pr-4 mr-4">
            <button
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                transformMode === 'translate'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'hover:bg-slate-700/50 text-slate-400 hover:text-emerald-300'
              }`}
              title="Translate (G)"
              onClick={() => setTransformMode('translate')}
            >
              <Move className="w-5 h-5" />
            </button>
            <button
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                transformMode === 'rotate'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25'
                  : 'hover:bg-slate-700/50 text-slate-400 hover:text-amber-300'
              }`}
              title="Rotate (R)"
              onClick={() => setTransformMode('rotate')}
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                transformMode === 'scale'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/25'
                  : 'hover:bg-slate-700/50 text-slate-400 hover:text-rose-300'
              }`}
              title="Scale (S)"
              onClick={() => setTransformMode('scale')}
            >
              <Scaling className="w-5 h-5" />
            </button>
          </div>

          {/* Battery Operations */}
          <div className="flex items-center space-x-2 border-r border-slate-500/30 pr-4 mr-4">
            <button
              className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 text-white text-sm font-medium mr-2"
              title="Battery Box Creator - Design complete battery packs"
              onClick={onOpenBatteryCreator}
            >
              <Battery className="w-4 h-4 inline mr-1" />
              Box Creator
            </button>
            <button
              className="px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 text-white text-sm font-medium mr-2"
              title="Create Electrical Connections"
              onClick={handleConnectCells}
            >
              Connect
            </button>
            <button
              className="px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 text-white text-sm font-medium"
              title="Create Battery Pack (4x4)"
              onClick={handleCreatePack}
            >
              Create Pack
            </button>
          </div>

          {/* View Options */}
          <div className="flex items-center space-x-2">
            <button
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                gridVisible
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'hover:bg-slate-700/50 text-slate-400 hover:text-cyan-300'
              }`}
              title="Toggle Grid"
              onClick={() => setGridVisible(!gridVisible)}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                snapEnabled
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/25'
                  : 'hover:bg-slate-700/50 text-slate-400 hover:text-pink-300'
              }`}
              title="Toggle Snap"
              onClick={() => setSnapEnabled(!snapEnabled)}
            >
              <Magnet className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}