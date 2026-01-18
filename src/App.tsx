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
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Title Bar */}
      <TitleBar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Library */}
        <div
          className="bg-gray-800 border-r border-gray-700 flex flex-col"
          style={{ width: sidebarWidth }}
        >
          <LibraryBrowser />
        </div>

        {/* Center - 3D Viewport */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <Toolbar />

          {/* Viewport */}
          <div className="flex-1">
            <ViewportCanvas />
          </div>

          {/* Status Bar */}
          <StatusBar />
        </div>

        {/* Right Sidebar - Properties */}
        <div
          className="bg-gray-800 border-l border-gray-700 flex flex-col"
          style={{ width: propertiesWidth }}
        >
          <PropertiesPanel />
        </div>
      </div>

      {/* Bottom Panel - Outliner (could be dockable) */}
      <div className="h-48 bg-gray-800 border-t border-gray-700">
        <OutlinerPanel />
      </div>
    </div>
  );
}

export default App;
