import {
  File,
  Save,
  Undo,
  Redo,
  Square,
  Circle,
  Link,
  Move,
  RotateCw,
  Scaling,
  Grid3X3,
  Magnet,
  Copy,
  Download
} from 'lucide-react';
import { useUIStore, useSceneStore } from '../../stores';
import { ArrayTool } from '../../lib/tools';
import { CellInstance } from '../../types/project';
import { Exporters } from '../../lib/exporters';
import { api } from '../../lib/webApi';
import { ProjectManager } from '../../lib/projectManager';

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
  const selectedUuids = useSceneStore((state) => state.selectedUuids);
  const cells = useSceneStore((state) => state.cells);
  const addCell = useSceneStore((state) => state.addCell);
  const checkpoint = useSceneStore((state) => state.checkpoint);

  const handleNewProject = async () => {
    try {
      const project = await api.createNewProject('New Project');
      ProjectManager.loadProjectIntoStores(project);
    } catch (error) {
      console.error('Failed to create new project:', error);
      alert('Failed to create new project');
    }
  };

  const handleSaveProject = async () => {
    try {
      const project = ProjectManager.getCurrentProject();
      // In web version, save to localStorage
      const path = 'project.cellforge';
      await api.saveProject(project, path);
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project');
    }
  };

  const handleArrayTool = () => {
    const selectedCells = Array.from(selectedUuids)
      .map(uuid => cells.get(uuid))
      .filter(Boolean) as CellInstance[];

    if (selectedCells.length === 0) {
      alert('Please select at least one cell to create an array.');
      return;
    }

    // Simple array creation - in real implementation, show a modal
    const config = {
      pattern: 'rectangular' as const,
      rows: 3,
      cols: 3,
      rowSpacing: 20,
      colSpacing: 20,
      radius: 0,
      count: 0,
      startAngle: 0,
      includeSource: false,
      autoConnect: 'none' as const,
    };

    checkpoint('Create Array');
    const result = ArrayTool.createArray(selectedCells, config);

    // Add new cells to scene
    result.cells.forEach(cell => {
      addCell(cell.cellId, cell.position);
    });
  };

  const handleExport = async () => {
    const scene = useSceneStore.getState().getScene();

    try {
      // Export as STL
      const stlData = Exporters.exportSTL(scene, {
        selection: 'all',
        mergeGeometries: true,
        applyTransforms: true,
        scale: 1,
        fileName: 'export.stl'
      });

      // Use unified API for export
      await api.exportSTL(stlData, 'export.stl');

      // Show success message
      alert('Export completed! File downloaded.');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error);
    }
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center space-x-2">
      {/* File Operations */}
      <div className="flex items-center space-x-1 border-r border-gray-600 pr-2 mr-2">
        <button
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="New Project"
          onClick={handleNewProject}
        >
          <File className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Save Project"
          onClick={handleSaveProject}
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Export"
          onClick={handleExport}
        >
          <Download className="w-4 h-4" />
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
        <button
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Array Tool"
          onClick={handleArrayTool}
        >
          <Copy className="w-4 h-4" />
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