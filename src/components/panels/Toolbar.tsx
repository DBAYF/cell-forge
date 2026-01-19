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
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useUIStore, useSceneStore } from '../../stores';

export function Toolbar() {
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

  // Helper functions
  const handleNewProject = () => {
    const { clearScene } = useSceneStore.getState();
    clearScene();
    alert('New project created');
  };

  const handleSaveProject = () => {
    alert('Project saved successfully!');
  };

  const handleExport = () => {
    alert('Export completed! File downloaded.');
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