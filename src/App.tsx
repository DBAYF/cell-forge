import React, { useState, useEffect } from 'react';
import { ViewportCanvas } from './components/viewport';
import { Toolbar } from './components/panels/Toolbar';
import { LibraryBrowser } from './components/panels/LibraryBrowser';
import { PropertiesPanel } from './components/panels/PropertiesPanel';
import { OutlinerPanel } from './components/panels/OutlinerPanel';
import { StatusBar } from './components/panels/StatusBar';
import { TitleBar } from './components/ui/TitleBar';
import { MobileToolbar } from './components/mobile/MobileToolbar';
import { MobileBottomSheet } from './components/mobile/MobileBottomSheet';
import { useUIStore } from './stores';
import { useElectricalSolver } from './hooks/useElectricalSolver';
import { KeyboardShortcuts } from './lib/keyboardShortcuts';
import { Accessibility } from './lib/accessibility';

function App() {
  console.log('🚀 CellForge App starting...');

  const [isMobile, setIsMobile] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState<'library' | 'properties' | 'outliner' | null>(null);

  const sidebarWidth = useUIStore((state) => state.sidebarWidth);
  const propertiesWidth = useUIStore((state) => state.propertiesWidth);
  const setSidebarWidth = useUIStore((state) => state.setSidebarWidth);
  const setPropertiesWidth = useUIStore((state) => state.setPropertiesWidth);

  console.log('📊 UI store values:', { sidebarWidth, propertiesWidth, isMobile });

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      console.log('Mobile detected:', mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ensure electrical calculations are always up to date
  useElectricalSolver();

  // Initialize keyboard shortcuts and accessibility (only on desktop)
  React.useEffect(() => {
    if (!isMobile) {
      KeyboardShortcuts.init();
    }
    Accessibility.init();
  }, [isMobile]);

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white overflow-hidden relative">
        {/* Title Bar - Compact for mobile */}
        <div className="absolute top-0 left-0 right-0 z-50">
          <TitleBar />
        </div>

        {/* Main Canvas - Full Screen Focus */}
        <div className="flex-1 relative mt-12">
          <ViewportCanvas />

          {/* Mobile UI Overlays */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-black/30 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-lg">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <span className="font-semibold text-blue-300 text-xs">Battery CAD</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
              </div>
            </div>
          </div>

          {/* Mobile Status Bar - Top for better visibility */}
          <div className="absolute top-16 left-4 right-4 z-40">
            <StatusBar />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileToolbar
          onPanelOpen={(panel) => setActiveMobilePanel(panel)}
          activePanel={activeMobilePanel}
        />

        {/* Mobile Bottom Sheet Panels */}
        <MobileBottomSheet
          isOpen={activeMobilePanel !== null}
          onClose={() => setActiveMobilePanel(null)}
          title={
            activeMobilePanel === 'library' ? 'Battery Library' :
            activeMobilePanel === 'properties' ? 'Properties' :
            activeMobilePanel === 'outliner' ? 'Scene Outliner' : ''
          }
        >
          {activeMobilePanel === 'library' && <LibraryBrowser />}
          {activeMobilePanel === 'properties' && <PropertiesPanel />}
          {activeMobilePanel === 'outliner' && <OutlinerPanel />}
        </MobileBottomSheet>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white overflow-hidden relative">
      {/* Debug indicator - shows app is loading */}
      <div className="absolute top-2 left-2 z-50 bg-green-500 text-white px-2 py-1 text-xs rounded shadow-lg">
        ✅ CellForge Loaded
      </div>
      {/* Title Bar - Minimal */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <TitleBar />
      </div>

      {/* Main Canvas - Full Screen Focus */}
      <div className="flex-1 relative">
        <ViewportCanvas />

        {/* Floating UI Overlays */}

        {/* Top Toolbar Overlay - Collapsible */}
        <div className="absolute top-16 left-4 right-4 z-40 transition-all duration-300 ease-in-out">
          <Toolbar />
        </div>

        {/* Left Panel - Library (Collapsible) */}
        <div
          className="absolute top-24 bottom-4 left-4 z-30 transition-all duration-300 ease-in-out"
          style={{
            width: sidebarWidth,
            transform: `translateX(${sidebarWidth > 0 ? '0' : '-100%'})`
          }}
        >
          <div className="bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl h-full overflow-hidden">
            <LibraryBrowser />
          </div>
        </div>

        {/* Right Panel - Properties (Collapsible) */}
        <div
          className="absolute top-24 bottom-4 right-4 z-30 transition-all duration-300 ease-in-out"
          style={{
            width: propertiesWidth,
            transform: `translateX(${propertiesWidth > 0 ? '0' : '100%'})`
          }}
        >
          <div className="bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl h-full overflow-hidden">
            <PropertiesPanel />
          </div>
        </div>

        {/* Bottom Panel - Outliner (Collapsible from bottom) */}
        <div className="absolute bottom-4 left-4 right-4 z-30 transition-all duration-300 ease-in-out">
          <div className="bg-gradient-to-t from-slate-900/95 to-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl h-48 overflow-hidden">
            <OutlinerPanel />
          </div>
        </div>

        {/* Status Bar - Bottom overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <StatusBar />
        </div>

        {/* Design Workspace Indicator */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/30 backdrop-blur-md rounded-full px-6 py-3 border border-white/10 shadow-lg">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="font-semibold text-blue-300">3D Battery Design Canvas</span>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
            </div>
            <div className="text-xs text-slate-400 mt-1 text-center">Drag • Connect • Export</div>
          </div>
        </div>

        {/* Panel Toggle Buttons - Corner overlays */}
        <div className="absolute top-24 left-4 z-40 flex flex-col space-y-2">
          <button
            onClick={() => setSidebarWidth(sidebarWidth > 0 ? 0 : 320)}
            className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          >
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center text-xs font-bold text-blue-600">
              L
            </div>
          </button>
        </div>

        <div className="absolute top-24 right-4 z-40 flex flex-col space-y-2">
          <button
            onClick={() => setPropertiesWidth(propertiesWidth > 0 ? 0 : 320)}
            className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          >
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center text-xs font-bold text-purple-600">
              P
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
