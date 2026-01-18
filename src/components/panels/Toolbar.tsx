import React from 'react';
import {
  File,
  Save,
  Undo,
  Redo,
  Square,
  Circle,
  Link,
  Scissors,
  Move,
  RotateCw,
  Scaling,
  Grid3X3,
  Magnet,
  Lock
} from 'lucide-react';
import { useUIStore, useSceneStore } from '../../stores';

export function Toolbar() {
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

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center space-x-2">
      {/* File Operations */}
      <div className="flex items-center space-x-1 border-r border-gray-600 pr-2 mr-2">
        <button
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="New Project"
        >
          <File className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Save Project"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>

      {/* Edit Operations */}
      <div className="flex items-center space-x-1 border-r border-gray-600 pr-2 mr-2">
        <button
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Undo"
          onClick={() => undo()}
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Redo"
          onClick={() => redo()}
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Tool Selection */}
      <div className="flex items-center space-x-1 border-r border-gray-600 pr-2 mr-2">
        <button
          className={`p-2 rounded transition-colors ${
            activeTool === 'select' ? 'bg-blue-600' : 'hover:bg-gray-700'
          }`}
          title="Select Tool"
          onClick={() => setActiveTool('select')}
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          className={`p-2 rounded transition-colors ${
            activeTool === 'add' ? 'bg-blue-600' : 'hover:bg-gray-700'
          }`}
          title="Add Cell"
          onClick={() => setActiveTool('add')}
        >
          <Circle className="w-4 h-4" />
        </button>
        <button
          className={`p-2 rounded transition-colors ${
            activeTool === 'connect' ? 'bg-blue-600' : 'hover:bg-gray-700'
          }`}
          title="Connect Tool"
          onClick={() => setActiveTool('connect')}
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          className={`p-2 rounded transition-colors ${
            activeTool === 'transform' ? 'bg-blue-600' : 'hover:bg-gray-700'
          }`}
          title="Transform Tool"
          onClick={() => setActiveTool('transform')}
        >
          <Move className="w-4 h-4" />
        </button>
      </div>

      {/* Transform Modes */}
      <div className="flex items-center space-x-1 border-r border-gray-600 pr-2 mr-2">
        <button
          className={`p-2 rounded transition-colors ${
            transformMode === 'translate' ? 'bg-green-600' : 'hover:bg-gray-700'
          }`}
          title="Translate (G)"
          onClick={() => setTransformMode('translate')}
        >
          <Move className="w-4 h-4" />
        </button>
        <button
          className={`p-2 rounded transition-colors ${
            transformMode === 'rotate' ? 'bg-green-600' : 'hover:bg-gray-700'
          }`}
          title="Rotate (R)"
          onClick={() => setTransformMode('rotate')}
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          className={`p-2 rounded transition-colors ${
            transformMode === 'scale' ? 'bg-green-600' : 'hover:bg-gray-700'
          }`}
          title="Scale (S)"
          onClick={() => setTransformMode('scale')}
        >
          <Scaling className="w-4 h-4" />
        </button>
      </div>

      {/* View Options */}
      <div className="flex items-center space-x-1">
        <button
          className={`p-2 rounded transition-colors ${
            gridVisible ? 'bg-yellow-600' : 'hover:bg-gray-700'
          }`}
          title="Toggle Grid"
          onClick={() => setGridVisible(!gridVisible)}
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button
          className={`p-2 rounded transition-colors ${
            snapEnabled ? 'bg-yellow-600' : 'hover:bg-gray-700'
          }`}
          title="Toggle Snap"
          onClick={() => setSnapEnabled(!snapEnabled)}
        >
          <Magnet className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}