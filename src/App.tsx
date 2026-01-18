import React from 'react';
import { ViewportCanvas } from './components/viewport';
import { Toolbar } from './components/panels/Toolbar';
import { LibraryBrowser } from './components/panels/LibraryBrowser';
import { PropertiesPanel } from './components/panels/PropertiesPanel';
import { OutlinerPanel } from './components/panels/OutlinerPanel';
import { StatusBar } from './components/panels/StatusBar';
import { TitleBar } from './components/ui/TitleBar';
import { useUIStore } from './stores';
import { useElectricalSolver } from './hooks/useElectricalSolver';
import { KeyboardShortcuts } from './lib/keyboardShortcuts';
import { Accessibility } from './lib/accessibility';

function App() {
  const sidebarWidth = useUIStore((state) => state.sidebarWidth);
  const propertiesWidth = useUIStore((state) => state.propertiesWidth);

  // Ensure electrical calculations are always up to date
  useElectricalSolver();

  // Initialize keyboard shortcuts and accessibility
  React.useEffect(() => {
    KeyboardShortcuts.init();
    Accessibility.init();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white overflow-hidden">
      {/* Title Bar */}
      <TitleBar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Library */}
        <div
          className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-r border-slate-700/50 flex flex-col shadow-2xl"
          style={{ width: sidebarWidth }}
        >
          <LibraryBrowser />
        </div>

        {/* Center - 3D Viewport */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <Toolbar />

          {/* Viewport */}
          <div className="flex-1 relative">
            <ViewportCanvas />
            {/* Design Workspace Overlay */}
            <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="flex items-center space-x-2 text-sm text-blue-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Battery Design Workspace</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Drag cells from library • Connect with wires • Export designs</div>
            </div>
          </div>

          {/* Status Bar */}
          <StatusBar />
        </div>

        {/* Right Sidebar - Properties */}
        <div
          className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-l border-slate-700/50 flex flex-col shadow-2xl"
          style={{ width: propertiesWidth }}
        >
          <PropertiesPanel />
        </div>
      </div>

      {/* Bottom Panel - Outliner (could be dockable) */}
      <div className="h-48 bg-gradient-to-t from-slate-900/95 to-slate-800/90 backdrop-blur-sm border-t border-slate-700/50 shadow-2xl">
        <OutlinerPanel />
      </div>
    </div>
  );
}

export default App;
