import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useSceneStore } from '../../stores';

export function PropertiesPanel() {
  const selectedUuids = useSceneStore((state) => state.selectedUuids);
  const cells = useSceneStore((state) => state.cells);
  const components = useSceneStore((state) => state.components);

  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(['identity', 'transform'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Get selected object (first one for now)
  const selectedUuid = Array.from(selectedUuids)[0];
  const selectedCell = selectedUuid ? cells.get(selectedUuid) : null;
  const selectedComponent = selectedUuid ? components.get(selectedUuid) : null;
  const selectedObject = selectedCell || selectedComponent;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-600/30 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center text-xs font-bold text-blue-600">
              P
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              Properties
            </h2>
            <p className="text-sm text-slate-400">Object details & settings</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedObject ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-slate-500 border-t-blue-400 rounded-full animate-spin"></div>
            </div>
            <div className="text-slate-400 font-medium mb-2">No Selection</div>
            <div className="text-slate-500 text-sm">Click on a battery or component to view its properties</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Identity Section */}
            <Section
              title="Identity"
              expanded={expandedSections.has('identity')}
              onToggle={() => toggleSection('identity')}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                    value={selectedCell?.customLabel || `${selectedCell?.manufacturer || 'Component'} ${selectedCell?.model || ''}`}
                    onChange={() => {
                      // TODO: Update custom label
                    }}
                  />
                </div>

                {selectedCell && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Manufacturer
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                        value={selectedCell.manufacturer || 'Unknown'}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                        value={selectedCell.model || 'Cell'}
                        readOnly
                      />
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* Transform Section */}
            <Section
              title="Transform"
              expanded={expandedSections.has('transform')}
              onToggle={() => toggleSection('transform')}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Position
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">X</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                        value={selectedObject.position[0].toFixed(1)}
                        onChange={() => {
                          // TODO: Update position
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Y</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                        value={selectedObject.position[1].toFixed(1)}
                        onChange={() => {
                          // TODO: Update position
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Z</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                        value={selectedObject.position[2].toFixed(1)}
                        onChange={() => {
                          // TODO: Update position
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Rotation
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">X</label>
                      <input
                        type="number"
                        step="1"
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                        value={((selectedObject.rotation[0] * 180) / Math.PI).toFixed(1)}
                        onChange={(e) => {
                          // TODO: Update rotation
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Y</label>
                      <input
                        type="number"
                        step="1"
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                        value={((selectedObject.rotation[1] * 180) / Math.PI).toFixed(1)}
                        onChange={(e) => {
                          // TODO: Update rotation
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Z</label>
                      <input
                        type="number"
                        step="1"
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                        value={((selectedObject.rotation[2] * 180) / Math.PI).toFixed(1)}
                        onChange={(e) => {
                          // TODO: Update rotation
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Electrical Section (for cells) */}
            {selectedCell && (
              <Section
                title="Electrical"
                expanded={expandedSections.has('electrical')}
                onToggle={() => toggleSection('electrical')}
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Nominal Voltage
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                        value={selectedCell.nominalVoltage || 3.6}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Capacity
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                        value={`${selectedCell.capacityMah || 3000}mAh`}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Max Discharge
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                        value={selectedCell.maxDischargeA || 15}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Chemistry
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                        value={selectedCell.chemistry || 'NMC'}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* Appearance Section */}
            <Section
              title="Appearance"
              expanded={expandedSections.has('appearance')}
              onToggle={() => toggleSection('appearance')}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Color Override
                  </label>
                  <input
                    type="color"
                    className="w-full h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                    defaultValue="#4a90e2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="visible"
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    defaultChecked
                  />
                  <label htmlFor="visible" className="text-sm text-gray-300">
                    Visible
                  </label>
                </div>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, expanded, onToggle, children }: SectionProps) {
  return (
    <div className="border border-gray-600 rounded">
      <button
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700 transition-colors"
        onClick={onToggle}
      >
        <span className="font-medium">{title}</span>
        {expanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}