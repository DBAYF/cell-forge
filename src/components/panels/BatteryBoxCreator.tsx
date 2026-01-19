import React, { useState, useEffect } from 'react';
import {
  Battery,
  Zap,
  Settings,
  Ruler,
  Box,
  Plus,
  Eye,
  Download,
  Check
} from 'lucide-react';
import { BatteryConfigInputs, ElectricalConfig, PhysicalLayout, calculateConfigurations, generateLayouts, rankLayouts } from '../../lib/batteryConfigAlgorithm';
import { BATTERY_DATABASE, BatterySpec, getBatteryOptions } from '../../lib/batteryDatabase';

interface BatteryBoxCreatorProps {
  onClose?: () => void;
  onGeneratePack?: (layout: PhysicalLayout) => void;
  onPreviewPack?: (layout: PhysicalLayout) => void;
}

export function BatteryBoxCreator({ onClose, onGeneratePack, onPreviewPack }: BatteryBoxCreatorProps) {
  // Form state
  const [inputs, setInputs] = useState<BatteryConfigInputs>({
    batteryType: '18650',
    cellCount: 24,
    targetVoltage: 48.0,
    layoutPriority: 'MINIMIZE_Z',
    cellOrientation: 'STANDING',
    useHoneycomb: false,
    cellGap: 2.0,
    wallClearance: 3.0,
    nickelStripTop: 5.0,
    nickelStripBottom: 5.0,
    showOnlyExact: true
  });

  const [configurations, setConfigurations] = useState<ElectricalConfig[]>([]);
  const [layouts, setLayouts] = useState<PhysicalLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<PhysicalLayout | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [sortBy, setSortBy] = useState<'volume' | 'footprint' | 'height' | 'longest'>('volume');

  const selectedBattery = BATTERY_DATABASE[inputs.batteryType];
  const batteryOptions = getBatteryOptions();

  // Calculate configurations when inputs change
  useEffect(() => {
    if (!selectedBattery) return;

    const configs = calculateConfigurations(selectedBattery, inputs);
    setConfigurations(configs);

    // Find closest configuration to target voltage
    if (configs.length > 0) {
      const closest = configs.reduce((prev, curr) =>
        Math.abs(curr.nominalVoltage - inputs.targetVoltage) < Math.abs(prev.nominalVoltage - inputs.targetVoltage)
          ? curr : prev
      );

      // Update target voltage to closest valid voltage
      setInputs(prev => ({ ...prev, targetVoltage: closest.nominalVoltage }));
    }
  }, [inputs.cellCount, inputs.batteryType, inputs.targetVoltage, inputs.showOnlyExact, selectedBattery]);

  // Generate layouts
  const handleGenerateConfigurations = async () => {
    if (!selectedBattery) return;

    setIsCalculating(true);
    try {
      const allLayouts: PhysicalLayout[] = [];

      for (const config of configurations) {
        const configLayouts = generateLayouts(config, selectedBattery, inputs);
        allLayouts.push(...configLayouts);
      }

      const rankedLayouts = rankLayouts(allLayouts, inputs);
      setLayouts(rankedLayouts);

      if (rankedLayouts.length > 0) {
        setSelectedLayout(rankedLayouts[0]);
      }
    } catch (error) {
      console.error('Error generating configurations:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleInputChange = (field: keyof BatteryConfigInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const sortedLayouts = [...layouts].sort((a, b) => {
    switch (sortBy) {
      case 'volume':
        return a.volumeCm3 - b.volumeCm3;
      case 'footprint':
        return a.footprintCm2 - b.footprintCm2;
      case 'height':
        return a.totalDimensions.z - b.totalDimensions.z;
      case 'longest':
        return Math.max(a.totalDimensions.x, a.totalDimensions.y, a.totalDimensions.z) -
               Math.max(b.totalDimensions.x, b.totalDimensions.y, b.totalDimensions.z);
      default:
        return 0;
    }
  });

  return (
    <div className="w-full h-full bg-slate-900 text-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Battery className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold">Battery Pack Designer</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Battery Selection */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Battery className="w-5 h-5 mr-2" />
            Battery Type
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Battery Model</label>
              <select
                value={inputs.batteryType}
                onChange={(e) => handleInputChange('batteryType', e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
              >
                {batteryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedBattery && (
              <div className="bg-slate-700/50 rounded-lg p-3">
                <h4 className="font-medium mb-2">Specifications</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Diameter:</span>
                    <span className="ml-2">{selectedBattery.diameter || selectedBattery.width} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Length:</span>
                    <span className="ml-2">{selectedBattery.length} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Nominal:</span>
                    <span className="ml-2">{selectedBattery.nominal_voltage}V</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Capacity:</span>
                    <span className="ml-2">{selectedBattery.typical_capacity} mAh</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Max Voltage:</span>
                    <span className="ml-2">{selectedBattery.max_voltage}V</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Weight:</span>
                    <span className="ml-2">{selectedBattery.weight}g</span>
                  </div>
                </div>
              </div>
            )}

            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Custom Battery</span>
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Number of Cells</h3>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="200"
                step="1"
                value={inputs.cellCount}
                onChange={(e) => handleInputChange('cellCount', parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min="1"
                max="200"
                value={inputs.cellCount}
                onChange={(e) => handleInputChange('cellCount', parseInt(e.target.value) || 1)}
                className="w-20 p-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
              />
            </div>

            <div className="flex justify-between text-sm text-slate-400">
              <span>Min: 1</span>
              <span>Max: 200</span>
            </div>
          </div>
        </div>

        {/* Target Voltage */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Target Voltage
          </h3>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min={selectedBattery?.nominal_voltage || 1}
                max={(selectedBattery?.nominal_voltage || 3.7) * inputs.cellCount}
                step="0.1"
                value={inputs.targetVoltage}
                onChange={(e) => handleInputChange('targetVoltage', parseFloat(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                step="0.1"
                value={inputs.targetVoltage.toFixed(1)}
                onChange={(e) => handleInputChange('targetVoltage', parseFloat(e.target.value) || 0)}
                className="w-24 p-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
              />
              <span className="text-slate-400">V</span>
            </div>

            <div className="text-sm text-slate-400">
              Range: {(selectedBattery?.nominal_voltage || 3.7).toFixed(1)}V (1S) to {((selectedBattery?.nominal_voltage || 3.7) * inputs.cellCount).toFixed(1)}V ({inputs.cellCount}S)
            </div>

            {configurations.length > 0 && (
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-sm">
                  <div className="font-medium">Configuration: {configurations[0]?.code}</div>
                  <div>Series: {configurations[0]?.series} cells</div>
                  <div>Parallel: {configurations[0]?.parallel} groups</div>
                  <div>Actual voltage: {configurations[0]?.nominalVoltage.toFixed(1)}V</div>
                  <div>Remaining cells: {configurations[0]?.cellsUnused} unused</div>
                </div>
              </div>
            )}

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={inputs.showOnlyExact}
                onChange={(e) => handleInputChange('showOnlyExact', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show only exact configurations</span>
            </label>
          </div>
        </div>

        {/* Layout Priority */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Layout Priority</h3>

          <div className="space-y-3">
            {[
              { value: 'MINIMIZE_Z', label: 'Minimize Height (Z)', desc: 'Pack will be wide and shallow' },
              { value: 'MINIMIZE_XY', label: 'Minimize Footprint (XY)', desc: 'Pack will be tall and narrow' },
              { value: 'BALANCED', label: 'Balanced', desc: 'Closest to cubic shape' },
              { value: 'CUSTOM', label: 'Custom Constraint', desc: 'Set maximum dimensions' }
            ].map(option => (
              <label key={option.value} className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="layoutPriority"
                  value={option.value}
                  checked={inputs.layoutPriority === option.value}
                  onChange={(e) => handleInputChange('layoutPriority', e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-slate-400">{option.desc}</div>
                  {option.value === 'CUSTOM' && inputs.layoutPriority === 'CUSTOM' && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {['x', 'y', 'z'].map(axis => (
                        <div key={axis}>
                          <label className="block text-xs text-slate-400 mb-1">Max {axis.toUpperCase()} (mm)</label>
                          <input
                            type="number"
                            className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                            placeholder="No limit"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Cell Orientation */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Cell Orientation</h3>

          <div className="space-y-3">
            {[
              { value: 'STANDING', label: 'Standing (axis = Z)', desc: 'Cells vertical ▓▓' },
              { value: 'LAYING', label: 'Laying (axis = X or Y)', desc: 'Cells horizontal ▓▓▓▓▓▓' },
              { value: 'MIXED', label: 'Mixed (auto-optimize)', desc: 'System chooses per configuration' }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="cellOrientation"
                  value={option.value}
                  checked={inputs.cellOrientation === option.value}
                  onChange={(e) => handleInputChange('cellOrientation', e.target.value as any)}
                />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-slate-400">{option.desc}</div>
                </div>
              </label>
            ))}

            <label className="flex items-center space-x-3 mt-4">
              <input
                type="checkbox"
                checked={inputs.useHoneycomb}
                onChange={(e) => handleInputChange('useHoneycomb', e.target.checked)}
              />
              <div>
                <div className="font-medium">Use honeycomb packing</div>
                <div className="text-sm text-slate-400">Offset rows for density</div>
              </div>
            </label>
          </div>
        </div>

        {/* Spacing and Clearance */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Ruler className="w-5 h-5 mr-2" />
            Spacing
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Cell Gap (mm)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.cellGap}
                onChange={(e) => handleInputChange('cellGap', parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
              <div className="text-xs text-slate-400 mt-1">Space between adjacent cells</div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Wall Clearance (mm)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.wallClearance}
                onChange={(e) => handleInputChange('wallClearance', parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
              <div className="text-xs text-slate-400 mt-1">Space from cells to enclosure wall</div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Nickel Strip Top (mm)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.nickelStripTop}
                onChange={(e) => handleInputChange('nickelStripTop', parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Nickel Strip Bottom (mm)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.nickelStripBottom}
                onChange={(e) => handleInputChange('nickelStripBottom', parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
              <div className="text-xs text-slate-400 mt-1">For welding tabs and bus bars</div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <button
            onClick={handleGenerateConfigurations}
            disabled={isCalculating}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <Settings className="w-5 h-5" />
                <span>Generate Configurations</span>
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {layouts.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Configurations ({layouts.length} found)</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              >
                <option value="volume">Sort by Volume</option>
                <option value="footprint">Sort by Footprint</option>
                <option value="height">Sort by Height</option>
                <option value="longest">Sort by Longest Dimension</option>
              </select>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sortedLayouts.slice(0, 10).map((layout, index) => (
                <div
                  key={`${layout.configuration.code}-${index}`}
                  className={`bg-slate-700/50 rounded-lg p-4 border-2 transition-colors cursor-pointer ${
                    selectedLayout === layout ? 'border-blue-400 bg-blue-900/20' : 'border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setSelectedLayout(layout)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">#{index + 1} {layout.configuration.code}</div>
                    <div className="text-sm text-slate-400">
                      {layout.configuration.nominalVoltage.toFixed(1)}V • {layout.configuration.capacityAh.toFixed(1)}Ah • {layout.configuration.weightKg.toFixed(2)}kg
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>Dimensions: {layout.totalDimensions.x.toFixed(0)} × {layout.totalDimensions.y.toFixed(0)} × {layout.totalDimensions.z.toFixed(0)} mm</div>
                    <div>Volume: {layout.volumeCm3.toFixed(1)} cm³</div>
                    <div>Cells used: {layout.configuration.cellsUsed}/{inputs.cellCount}</div>
                    <div>Layout: {layout.cols}×{Math.round(layout.rowsPerLayer)}×{layout.layers}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewPack?.(layout);
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGeneratePack?.(layout);
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Insert</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Export functionality
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}