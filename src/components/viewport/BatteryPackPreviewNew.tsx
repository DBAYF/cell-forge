import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Html } from '@react-three/drei';
import { PhysicalLayout } from '../../lib/batteryConfigAlgorithm';
import { BatterySpec } from '../../lib/batteryDatabase';
import * as THREE from 'three';
import { X, Eye, Box, Zap, Settings, RotateCcw } from 'lucide-react';

interface BatteryPackPreviewProps {
  layout: PhysicalLayout;
  battery: BatterySpec;
  onClose: () => void;
  onInsertIntoScene?: () => void;
  onGenerateEnclosure?: () => void;
  onExportSTL?: () => void;
}

interface PackVisualizationProps {
  layout: PhysicalLayout;
  battery: BatterySpec;
  showCellBodies: boolean;
  showTerminals: boolean;
  showWiring: boolean;
  showBoundingBox: boolean;
  showEnclosure: boolean;
  showDimensions: boolean;
  viewMode: 'front' | 'top' | 'iso' | 'exploded';
}

function PackVisualization({
  layout,
  battery,
  showCellBodies,
  showTerminals,
  showWiring,
  showBoundingBox,
  showEnclosure,
  showDimensions,
  viewMode
}: PackVisualizationProps) {
  // Helper function to get cell color based on series position
  const getCellColor = (seriesPosition: number) => {
    const hue = (seriesPosition / layout.configuration.series) * 0.7;
    return new THREE.Color().setHSL(hue, 0.7, 0.5).getHex();
  };

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-10, -10, -5]} intensity={0.4} />

      {/* Cell bodies */}
      {showCellBodies && layout.cellPositions.map((position, index) => (
        <group key={`cell-${index}`}>
          {/* Main cell body */}
          {battery.model_type === 'cylinder' ? (
            <mesh position={[position.x, position.y, position.z]}>
              <cylinderGeometry args={[battery.diameter! / 2, battery.diameter! / 2, battery.length!, 24, 1]} />
              <meshStandardMaterial
                color={getCellColor(position.seriesPosition)}
                metalness={0.1}
                roughness={0.8}
              />
            </mesh>
          ) : (
            <mesh position={[position.x, position.y, position.z]}>
              <boxGeometry args={[battery.width!, battery.length!, battery.thickness!]} />
              <meshStandardMaterial
                color={getCellColor(position.seriesPosition)}
                metalness={0.1}
                roughness={0.8}
              />
            </mesh>
          )}

          {/* Terminal visualization */}
          {showTerminals && battery.model_type === 'cylinder' && (
            <mesh position={[
              position.x,
              position.y,
              position.z + (position.polarityUp ? battery.length! / 2 + 0.75 : -battery.length! / 2 - 0.75)
            ]}>
              <cylinderGeometry args={[battery.diameter! / 4, battery.diameter! / 4, 1.5, 16, 1]} />
              <meshStandardMaterial
                color={position.polarityUp ? '#ff4444' : '#4444ff'}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* Bounding box */}
      {showBoundingBox && (
        <mesh>
          <boxGeometry args={[layout.totalDimensions.x, layout.totalDimensions.y, layout.totalDimensions.z]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
        </mesh>
      )}

      {/* Enclosure */}
      {showEnclosure && (
        <mesh>
          <boxGeometry args={[
            layout.totalDimensions.x + 4, // +2 wall thickness on each side
            layout.totalDimensions.y + 4,
            layout.totalDimensions.z + 2  // + wall thickness on bottom
          ]} />
          <meshStandardMaterial color="#cccccc" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Grid */}
      <Grid
        args={[Math.max(layout.totalDimensions.x, layout.totalDimensions.y) * 2, 10]}
        position={[0, 0, -layout.totalDimensions.z / 2 - 5]}
      />
    </group>
  );
}

export function BatteryPackPreview({
  layout,
  battery,
  onClose,
  onInsertIntoScene,
  onGenerateEnclosure,
  onExportSTL
}: BatteryPackPreviewProps) {
  const [showCellBodies, setShowCellBodies] = useState(true);
  const [showTerminals, setShowTerminals] = useState(true);
  const [showWiring, setShowWiring] = useState(false);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [showEnclosure, setShowEnclosure] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const [viewMode, setViewMode] = useState<'front' | 'top' | 'iso' | 'exploded'>('iso');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            3D Preview: {layout.configuration.code} Configuration
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex h-full">
          {/* 3D Viewport */}
          <div className="flex-1 relative">
            <Canvas
              camera={{
                position: [layout.totalDimensions.x * 1.5, layout.totalDimensions.y * 1.5, layout.totalDimensions.z * 1.5],
                fov: 50
              }}
              style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}
            >
              <Suspense fallback={
                <Html center>
                  <div className="text-white text-lg">Loading 3D preview...</div>
                </Html>
              }>
                <PackVisualization
                  layout={layout}
                  battery={battery}
                  showCellBodies={showCellBodies}
                  showTerminals={showTerminals}
                  showWiring={showWiring}
                  showBoundingBox={showBoundingBox}
                  showEnclosure={showEnclosure}
                  showDimensions={showDimensions}
                  viewMode={viewMode}
                />
                <OrbitControls enableDamping dampingFactor={0.05} />
                <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                  <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" />
                </GizmoHelper>
              </Suspense>
            </Canvas>

            {/* View controls overlay */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md rounded-lg p-2">
              <div className="flex space-x-2">
                {[
                  { key: 'front', label: 'Front' },
                  { key: 'top', label: 'Top' },
                  { key: 'iso', label: 'Iso' },
                  { key: 'exploded', label: 'Exploded' }
                ].map(view => (
                  <button
                    key={view.key}
                    onClick={() => setViewMode(view.key as any)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === view.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto">
            {/* Display Options */}
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Display Options</h3>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showCellBodies}
                    onChange={(e) => setShowCellBodies(e.target.checked)}
                  />
                  <span className="text-slate-300">Show cell bodies</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showTerminals}
                    onChange={(e) => setShowTerminals(e.target.checked)}
                  />
                  <span className="text-slate-300">Show cell terminals (+/-)</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showWiring}
                    onChange={(e) => setShowWiring(e.target.checked)}
                    disabled
                  />
                  <span className="text-slate-300 opacity-50">Show wiring diagram (Coming Soon)</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showBoundingBox}
                    onChange={(e) => setShowBoundingBox(e.target.checked)}
                  />
                  <span className="text-slate-300">Show bounding box</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showEnclosure}
                    onChange={(e) => setShowEnclosure(e.target.checked)}
                  />
                  <span className="text-slate-300">Show enclosure</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showDimensions}
                    onChange={(e) => setShowDimensions(e.target.checked)}
                    disabled
                  />
                  <span className="text-slate-300 opacity-50">Show dimensions (Coming Soon)</span>
                </label>
              </div>
            </div>

            {/* Configuration Info */}
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Configuration Details</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Configuration:</span>
                  <span className="text-white font-medium">{layout.configuration.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Voltage:</span>
                  <span className="text-white">{layout.configuration.nominalVoltage.toFixed(1)}V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Capacity:</span>
                  <span className="text-white">{layout.configuration.capacityAh.toFixed(1)}Ah</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Weight:</span>
                  <span className="text-white">{layout.configuration.weightKg.toFixed(2)}kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dimensions:</span>
                  <span className="text-white">
                    {layout.totalDimensions.x.toFixed(0)} × {layout.totalDimensions.y.toFixed(0)} × {layout.totalDimensions.z.toFixed(0)} mm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Volume:</span>
                  <span className="text-white">{layout.volumeCm3.toFixed(1)} cm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cells:</span>
                  <span className="text-white">{layout.configuration.cellsUsed}/{layout.configuration.cellsUsed + layout.configuration.cellsUnused}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 space-y-3">
              <button
                onClick={onInsertIntoScene}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium transition-colors"
              >
                <Box className="w-5 h-5" />
                <span>Insert into Scene</span>
              </button>

              <button
                onClick={onGenerateEnclosure}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Generate Enclosure</span>
              </button>

              <button
                onClick={onExportSTL}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Export to STL</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}