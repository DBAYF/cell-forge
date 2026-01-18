import { Menu, Minimize2, Maximize2, X } from 'lucide-react';
import { useUIStore } from '../../stores';

export function TitleBar() {

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between select-none">
      {/* Left side - Menu and title */}
      <div className="flex items-center space-x-4">
        <Menu className="w-5 h-5 text-gray-400" />
        <span className="text-lg font-semibold">CellForge</span>
      </div>

      {/* Center - Menu bar */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-1">
          <button className="px-3 py-1 text-sm hover:bg-gray-700 rounded transition-colors">
            File
          </button>
          <div className="relative">
            <button className="px-3 py-1 text-sm hover:bg-gray-700 rounded transition-colors">
              Edit
            </button>
          </div>
          <button className="px-3 py-1 text-sm hover:bg-gray-700 rounded transition-colors">
            View
          </button>
          <button className="px-3 py-1 text-sm hover:bg-gray-700 rounded transition-colors">
            Tools
          </button>
        </div>
      </div>

      {/* Right side - Window controls */}
      <div className="flex items-center space-x-2">
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded transition-colors"
          title="Minimize"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded transition-colors"
          title="Maximize"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-red-600 rounded transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}