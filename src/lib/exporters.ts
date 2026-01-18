import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { Scene, CellInstance, Component, Connection, STLExportOptions, ThreeMFExportOptions } from '../types/project';
import { generateCellGeometry } from './meshGenerators';
import { CSGOperations } from './csgOperations';

/**
 * Export utilities for various 3D formats
 */
export class Exporters {
  private static stlExporter = new STLExporter();

  /**
   * Export scene to STL format
   */
  static exportSTL(
    scene: Scene,
    options: STLExportOptions,
    cellSpecs?: Map<number, any>
  ): Uint8Array {
    // Create a temporary scene for export
    const exportScene = new THREE.Scene();

    // Filter objects based on selection
    const cellsToExport = this.filterCells(scene.cells, options.selection);
    const componentsToExport = this.filterComponents(scene.components, options.selection);

    // Add cells to export scene
    cellsToExport.forEach(cell => {
      const geometry = this.createCellGeometry(cell, cellSpecs);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
      mesh.position.set(...cell.position);
      mesh.rotation.set(...cell.rotation);
      mesh.scale.set(1, 1, 1);
      exportScene.add(mesh);
    });

    // Add components to export scene
    componentsToExport.forEach(component => {
      const geometry = this.createComponentGeometry(component);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
      mesh.position.set(...component.position);
      mesh.rotation.set(...component.rotation);
      mesh.scale.set(...component.scale);
      exportScene.add(mesh);
    });

    // Apply transformations
    if (options.applyTransforms) {
      // Transforms are already applied above
    }

    // Export to STL
    const stlString = this.stlExporter.parse(exportScene, { binary: true }) as Uint8Array;

    return stlString;
  }

  /**
   * Export scene to 3MF format (simplified - would need a proper 3MF exporter)
   */
  static exportThreeMF(
    scene: Scene,
    options: ThreeMFExportOptions,
    cellSpecs?: Map<number, any>
  ): string {
    // Create a temporary scene for export
    const exportScene = new THREE.Scene();

    // Filter objects based on selection
    const cellsToExport = this.filterCells(scene.cells, options.selection);
    const componentsToExport = this.filterComponents(scene.components, options.selection);

    // Add cells to export scene
    cellsToExport.forEach(cell => {
      const geometry = this.createCellGeometry(cell, cellSpecs);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
      mesh.position.set(...cell.position);
      mesh.rotation.set(...cell.rotation);
      mesh.scale.set(1, 1, 1);
      exportScene.add(mesh);
    });

    // Add components to export scene
    componentsToExport.forEach(component => {
      const geometry = this.createComponentGeometry(component);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
      mesh.position.set(...component.position);
      mesh.rotation.set(...component.rotation);
      mesh.scale.set(...component.scale);
      exportScene.add(mesh);
    });

    // For now, export as STL and note that 3MF would need a proper exporter
    // In a real implementation, you'd use a 3MF exporter library
    console.warn('3MF export not fully implemented - using STL format');
    const stlData = this.exportSTL(scene, {
      selection: options.selection,
      mergeGeometries: true,
      applyTransforms: true,
      scale: 1,
      fileName: options.fileName.replace('.3mf', '.stl')
    }, cellSpecs);

    // Convert to base64 string for compatibility
    return btoa(String.fromCharCode(...stlData));
  }

  /**
   * Generate holder geometry and export
   */
  static async exportHolder(
    scene: Scene,
    cellSpecs?: Map<number, any>
  ): Promise<Uint8Array> {
    const cells = Array.from(scene.cells.values());
    if (cells.length === 0) {
      throw new Error('No cells in scene to generate holder for');
    }

    // Extract cell positions
    const cellPositions = cells.map(cell => new THREE.Vector3(...cell.position));

    // Generate holder config (simplified)
    const config = {
      cellPositions,
      cellDiameter: 18, // Default 18650
      cellLength: 65,
      wallThickness: 2,
      tolerance: 0.5,
      baseThickness: 3,
      ventHoles: true,
      ventHoleDiameter: 3,
    };

    // Generate holder geometry
    const holderGeometry = await CSGOperations.generateHolder(config);

    // Create mesh and export
    const exportScene = new THREE.Scene();
    const holderMesh = new THREE.Mesh(holderGeometry, new THREE.MeshBasicMaterial());
    exportScene.add(holderMesh);

    const stlData = this.stlExporter.parse(exportScene, { binary: true }) as Uint8Array;
    return stlData;
  }

  /**
   * Filter cells based on export selection
   */
  private static filterCells(
    cells: Map<string, CellInstance>,
    selection: 'all' | 'selected' | 'holders-only' | 'cells-only'
  ): CellInstance[] {
    const cellArray = Array.from(cells.values());

    switch (selection) {
      case 'all':
      case 'cells-only':
        return cellArray;
      case 'selected':
        // TODO: Implement selected cells filtering
        return cellArray;
      case 'holders-only':
        return []; // No cells for holder-only export
      default:
        return cellArray;
    }
  }

  /**
   * Filter components based on export selection
   */
  private static filterComponents(
    components: Map<string, Component>,
    selection: 'all' | 'selected' | 'holders-only' | 'cells-only'
  ): Component[] {
    const componentArray = Array.from(components.values());

    switch (selection) {
      case 'all':
        return componentArray;
      case 'cells-only':
        return []; // No components for cells-only export
      case 'holders-only':
        return componentArray.filter(c => c.componentType === 'shape');
      case 'selected':
        // TODO: Implement selected components filtering
        return componentArray;
      default:
        return componentArray;
    }
  }

  /**
   * Create geometry for a cell
   */
  private static createCellGeometry(cell: CellInstance, cellSpecs?: Map<number, any>): THREE.BufferGeometry {
    // Try to get cell specs, fallback to defaults
    const specs = cellSpecs?.get(cell.cellId);
    const formFactor = specs?.form_factor || '18650';
    const diameter = specs?.diameter_mm;
    const length = specs?.length_mm || 65;

    return generateCellGeometry({
      formFactor: formFactor as any,
      diameter,
      length,
    });
  }

  /**
   * Create geometry for a component
   */
  private static createComponentGeometry(component: Component): THREE.BufferGeometry {
    switch (component.componentType) {
      case 'bms':
        return new THREE.BoxGeometry(50, 10, 30);
      case 'shape':
        // In real implementation, load from GLB or generate procedurally
        return new THREE.BoxGeometry(20, 20, 20);
      case 'custom':
        // Placeholder for custom meshes
        return new THREE.SphereGeometry(10);
      default:
        return new THREE.BoxGeometry(10, 10, 10);
    }
  }

  /**
   * Merge geometries for export optimization
   */
  static mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    if (geometries.length === 0) {
      return new THREE.BufferGeometry();
    }

    if (geometries.length === 1) {
      return geometries[0];
    }

    // Use THREE.BufferGeometryUtils.mergeGeometries if available
    // For now, return the first geometry
    return geometries[0];
  }

  /**
   * Apply unit scaling for export
   */
  static applyScale(geometry: THREE.BufferGeometry, scale: number): THREE.BufferGeometry {
    const scaled = geometry.clone();
    scaled.scale(scale, scale, scale);
    return scaled;
  }
}