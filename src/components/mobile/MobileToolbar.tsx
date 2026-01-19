import React from 'react';
import {
  Square,
  Circle,
  Zap,
  Move,
  Settings,
  Layers,
  Package,
  Undo,
  Redo,
  Save,
  Download
} from 'lucide-react';
import { useUIStore, useSceneStore } from '../../stores';

interface MobileToolbarProps {
  onPanelOpen: (panel: 'library' | 'properties' | 'outliner') => void;
  activePanel: 'library' | 'properties' | 'outliner' | null;
}

export function MobileToolbar({ onPanelOpen, activePanel }: MobileToolbarProps) {
  const activeTool = useUIStore((state) => state.activeTool);
  const setActiveTool = useUIStore((state) => state.setActiveTool);
  const undo = useSceneStore((state) => state.undo);
  const redo = useSceneStore((state) => state.redo);

  const mainTools = [
    { id: 'select', icon: Square, label: 'Select' },
    { id: 'add', icon: Circle, label: 'Add Cell' },
    { id: 'connect', icon: Zap, label: 'Connect' },
    { id: 'transform', icon: Move, label: 'Transform' },
  ];

  const panels = [
    { id: 'library', icon: Package, label: 'Library' },
    { id: 'properties', icon: Settings, label: 'Properties' },
    { id: 'outliner', icon: Layers, label: 'Outliner' },
  ];

  const quickActions = [
    { icon: Undo, action: undo, label: 'Undo' },
    { icon: Redo, action: redo, label: 'Redo' },
    { icon: Save, action: () => alert('Save clicked'), label: 'Save' },
    { icon: Download, action: () => alert('Export clicked'), label: 'Export' },
  ];

  return (
    <div className="bg-gradient-to-t from-slate-900/95 to-slate-800/90 backdrop-blur-md border-t border-slate-700/50 px-4 py-2">
      {/* Quick Actions Bar */}
      <div className="flex justify-center space-x-4 mb-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            title={action.label}
          >
            <action.icon className="w-5 h-5 text-slate-300" />
          </button>
        ))}
      </div>

      {/* Main Tools */}
      <div className="flex justify-around items-center">
        {mainTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as any)}
            className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
              activeTool === tool.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <tool.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Panel Access */}
      <div className="flex justify-around items-center mt-2 pt-2 border-t border-slate-600/30">
        {panels.map((panel) => (
          <button
            key={panel.id}
            onClick={() => onPanelOpen(panel.id as any)}
            className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
              activePanel === panel.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
            }`}
          >
            <panel.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{panel.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}