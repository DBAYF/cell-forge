import { Menu, Minimize2, Maximize2, X } from 'lucide-react';
import { useUIStore } from '../../stores';
import { useState, useEffect } from 'react';

export function TitleBar() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    // Compact mobile title bar
    return (
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 px-4 py-2 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">CF</span>
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
            CellForge
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-1 text-xs">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-xs">Ready</span>
          </div>
        </div>
      </div>
    );
  }

  // Desktop title bar
  return (
    <div className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-2 flex items-center justify-between select-none">
      {/* Left side - Logo and title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">CF</span>
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
          CellForge
        </span>
        <span className="text-xs text-slate-400 font-medium">3D Battery Designer</span>
      </div>

      {/* Center - Quick actions */}
      <div className="flex items-center space-x-2">
        <button className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200 font-medium">
          File
        </button>
        <button className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200 font-medium">
          Edit
        </button>
        <button className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200 font-medium">
          View
        </button>
        <button className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200 font-medium">
          Tools
        </button>
      </div>

      {/* Right side - Status and controls */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 font-medium">Ready</span>
        </div>

        <div className="w-px h-4 bg-white/20"></div>

        <button
          className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
          title="Minimize"
        >
          <Minimize2 className="w-3 h-3 text-slate-400" />
        </button>
        <button
          className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
          title="Maximize"
        >
          <Maximize2 className="w-3 h-3 text-slate-400" />
        </button>
        <button
          className="w-6 h-6 flex items-center justify-center hover:bg-red-500/80 rounded transition-colors"
          title="Close"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
  );
}