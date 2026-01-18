import { TopologyResult, TopologyNode, TopologyEdge, ValidationError, ValidationWarning, TopologyGraph } from '../types/electrical';
import { CellInstance, Connection } from '../types/project';

export class ElectricalSolver {
  private cells: Map<string, CellInstance>;
  private connections: Map<string, Connection>;
  private cellSpecs: Map<number, any>; // Would be loaded from database

  constructor(cells: Map<string, CellInstance>, connections: Map<string, Connection>) {
    this.cells = cells;
    this.connections = connections;
    this.cellSpecs = new Map(); // TODO: Load from database
  }

  /**
   * Main solver function - analyzes the entire electrical topology
   */
  solve(): TopologyResult {
    try {
      // Build topology graph
      const graph = this.buildTopologyGraph();

      // Validate topology
      const errors = this.validateTopology(graph);
      const warnings = this.validateWarnings(graph);

      // Calculate electrical properties
      const electricalProps = this.calculateElectricalProperties(graph);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        ...electricalProps,
        graph,
      };
    } catch (error) {
      console.error('Electrical solver error:', error);
      return {
        isValid: false,
        errors: [{
          type: 'FLOATING_CELL',
          cells: Array.from(this.cells.keys()),
        }],
        warnings: [],
        totalSeriesCells: 0,
        totalParallelGroups: 0,
        configuration: '0S0P',
        nominalVoltage: 0,
        maxVoltage: 0,
        minVoltage: 0,
        totalCapacityAh: 0,
        totalEnergyWh: 0,
        maxDischargeCurrent: 0,
        graph: {
          nodes: new Map(),
          edges: new Map(),
        },
      };
    }
  }

  /**
   * Build the topology graph from cells and connections
   */
  private buildTopologyGraph(): TopologyGraph {
    const nodes = new Map<string, TopologyNode>();
    const edges = new Map<string, TopologyEdge>();

    // Create nodes for all cells
    this.cells.forEach((cell, uuid) => {
      nodes.set(uuid, {
        uuid,
        type: 'cell',
        cellId: cell.cellId,
        positiveConnections: [],
        negativeConnections: [],
      });
    });

    // Create edges from connections
    this.connections.forEach((connection, uuid) => {
      edges.set(uuid, {
        sourceUuid: connection.sourceUuid,
        targetUuid: connection.targetUuid,
        connectionType: connection.connectionType,
        materialId: connection.materialId,
      });

      // Update node connections
      const sourceNode = nodes.get(connection.sourceUuid);
      const targetNode = nodes.get(connection.targetUuid);

      if (sourceNode && targetNode) {
        if (connection.sourceTerminal === 'positive') {
          sourceNode.positiveConnections.push(connection.targetUuid);
        } else {
          sourceNode.negativeConnections.push(connection.targetUuid);
        }

        if (connection.targetTerminal === 'positive') {
          targetNode.positiveConnections.push(connection.sourceUuid);
        } else {
          targetNode.negativeConnections.push(connection.sourceUuid);
        }
      }
    });

    return { nodes, edges };
  }

  /**
   * Validate the electrical topology for errors
   */
  private validateTopology(graph: TopologyGraph): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for floating cells (no connections)
    const floatingCells = Array.from(graph.nodes.values())
      .filter(node =>
        node.positiveConnections.length === 0 &&
        node.negativeConnections.length === 0
      )
      .map(node => node.uuid);

    if (floatingCells.length > 0) {
      errors.push({
        type: 'FLOATING_CELL',
        cells: floatingCells,
      });
    }

    // Check for voltage mismatches in parallel groups
    const parallelGroups = this.findParallelGroups(graph);
    parallelGroups.forEach(group => {
      const voltages = group.map(uuid => {
        const node = graph.nodes.get(uuid);
        return node?.cellId ? this.getCellVoltage(node.cellId) : 0;
      }).filter(v => v > 0);

      if (voltages.length > 1) {
        const avgVoltage = voltages.reduce((a, b) => a + b, 0) / voltages.length;
        const maxDiff = Math.max(...voltages) - Math.min(...voltages);

        if (maxDiff > 0.1) { // 100mV tolerance
          errors.push({
            type: 'VOLTAGE_MISMATCH',
            cells: group,
            delta: maxDiff,
          });
        }
      }
    });

    // Check for capacity mismatches in series groups
    const seriesGroups = this.findSeriesGroups(graph);
    seriesGroups.forEach(group => {
      const capacities = group.map(uuid => {
        const node = graph.nodes.get(uuid);
        return node?.cellId ? this.getCellCapacity(node.cellId) : 0;
      }).filter(c => c > 0);

      if (capacities.length > 1) {
        const minCapacity = Math.min(...capacities);
        const maxCapacity = Math.max(...capacities);

        if (maxCapacity / minCapacity > 1.1) { // 10% tolerance
          errors.push({
            type: 'CAPACITY_MISMATCH',
            cells: group,
            delta: maxCapacity - minCapacity,
          });
        }
      }
    });

    // Check for mixed chemistries
    const chemistries = new Map<string, string[]>();
    graph.nodes.forEach((node, uuid) => {
      if (node.cellId) {
        const chemistry = this.getCellChemistry(node.cellId);
        if (!chemistries.has(chemistry)) {
          chemistries.set(chemistry, []);
        }
        chemistries.get(chemistry)!.push(uuid);
      }
    });

    if (chemistries.size > 1) {
      errors.push({
        type: 'MIXED_CHEMISTRY',
        cells: Array.from(chemistries.values()).flat(),
      });
    }

    return errors;
  }

  /**
   * Generate warnings for potential issues
   */
  private validateWarnings(graph: TopologyGraph): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check for unbalanced parallel groups
    const parallelGroups = this.findParallelGroups(graph);
    parallelGroups.forEach(group => {
      if (group.length > 2) {
        const capacities = group.map(uuid => {
          const node = graph.nodes.get(uuid);
          return node?.cellId ? this.getCellCapacity(node.cellId) : 0;
        });

        const avgCapacity = capacities.reduce((a, b) => a + b, 0) / capacities.length;
        const maxDeviation = Math.max(...capacities.map(c => Math.abs(c - avgCapacity)));

        if (maxDeviation / avgCapacity > 0.05) { // 5% tolerance
          warnings.push({
            type: 'UNBALANCED_PARALLEL',
            groups: [group],
            delta: maxDeviation,
          });
        }
      }
    });

    // Check for high series count
    const seriesCount = this.calculateSeriesCount(graph);
    if (seriesCount > 12) {
      warnings.push({
        type: 'HIGH_SERIES_COUNT',
        count: seriesCount,
        maxRecommended: 12,
      });
    }

    return warnings;
  }

  /**
   * Calculate electrical properties of the topology
   */
  private calculateElectricalProperties(graph: TopologyGraph) {
    const parallelGroups = this.findParallelGroups(graph);
    const seriesGroups = this.findSeriesGroups(graph);

    const totalSeriesCells = seriesGroups.reduce((sum, group) => sum + group.length, 0);
    const totalParallelGroups = parallelGroups.length;

    // Calculate configuration string
    const configuration = `${totalSeriesCells}S${totalParallelGroups}P`;

    // Calculate voltage (series cells add up)
    const nominalVoltage = seriesGroups.reduce((sum, group) => {
      const groupVoltage = group.reduce((groupSum, uuid) => {
        const node = graph.nodes.get(uuid);
        return groupSum + (node?.cellId ? this.getCellVoltage(node.cellId) : 0);
      }, 0);
      return sum + groupVoltage;
    }, 0);

    // Calculate capacity (parallel groups add up)
    const totalCapacityAh = parallelGroups.reduce((sum, group) => {
      const groupCapacity = group.reduce((groupSum, uuid) => {
        const node = graph.nodes.get(uuid);
        return groupSum + (node?.cellId ? this.getCellCapacity(node.cellId) / 1000 : 0); // Convert mAh to Ah
      }, 0);
      return sum + groupCapacity;
    }, 0);

    // Calculate max discharge current
    const maxDischargeCurrent = parallelGroups.reduce((sum, group) => {
      const groupCurrent = group.reduce((groupSum, uuid) => {
        const node = graph.nodes.get(uuid);
        return groupSum + (node?.cellId ? this.getCellDischargeCurrent(node.cellId) : 0);
      }, 0);
      return sum + groupCurrent;
    }, 0);

    // Calculate energy
    const totalEnergyWh = nominalVoltage * totalCapacityAh;

    return {
      totalSeriesCells,
      totalParallelGroups,
      configuration,
      nominalVoltage,
      maxVoltage: nominalVoltage * 1.05, // Approximate max voltage
      minVoltage: nominalVoltage * 0.8,  // Approximate min voltage
      totalCapacityAh,
      totalEnergyWh,
      maxDischargeCurrent,
    };
  }

  /**
   * Find parallel groups in the topology
   */
  private findParallelGroups(graph: TopologyGraph): string[][] {
    const visited = new Set<string>();
    const groups: string[][] = [];

    graph.nodes.forEach((node, uuid) => {
      if (!visited.has(uuid)) {
        const group = this.traverseParallel(uuid, graph, visited);
        if (group.length > 0) {
          groups.push(group);
        }
      }
    });

    return groups;
  }

  /**
   * Traverse parallel connections from a starting node
   */
  private traverseParallel(startUuid: string, graph: TopologyGraph, visited: Set<string>): string[] {
    const group: string[] = [];
    const queue = [startUuid];

    while (queue.length > 0) {
      const currentUuid = queue.shift()!;
      if (visited.has(currentUuid)) continue;

      visited.add(currentUuid);
      group.push(currentUuid);

      const currentNode = graph.nodes.get(currentUuid);
      if (!currentNode) continue;

      // Find parallel connections (cells sharing both terminals)
      currentNode.positiveConnections.forEach(connectedUuid => {
        if (!visited.has(connectedUuid)) {
          // Check if this connection is parallel
          const connectedNode = graph.nodes.get(connectedUuid);
          if (connectedNode &&
              connectedNode.positiveConnections.includes(currentUuid) &&
              connectedNode.negativeConnections.includes(currentUuid)) {
            queue.push(connectedUuid);
          }
        }
      });
    }

    return group;
  }

  /**
   * Find series groups in the topology
   */
  private findSeriesGroups(graph: TopologyGraph): string[][] {
    const visited = new Set<string>();
    const groups: string[][] = [];

    // Find series chains
    graph.nodes.forEach((node, uuid) => {
      if (!visited.has(uuid)) {
        const chain = this.traverseSeries(uuid, graph, visited);
        if (chain.length > 1) {
          groups.push(chain);
        }
      }
    });

    return groups;
  }

  /**
   * Traverse series connections from a starting node
   */
  private traverseSeries(startUuid: string, graph: TopologyGraph, visited: Set<string>): string[] {
    const chain: string[] = [];
    let currentUuid: string | null = startUuid;

    while (currentUuid && !visited.has(currentUuid)) {
      visited.add(currentUuid);
      chain.push(currentUuid);

      const currentNode = graph.nodes.get(currentUuid);
      if (!currentNode) break;

      // Find next cell in series (only one connection per terminal)
      let nextUuid: string | null = null;

      if (currentNode.positiveConnections.length === 1) {
        const nextCandidate = currentNode.positiveConnections[0];
        const nextNode = graph.nodes.get(nextCandidate);
        if (nextNode && nextNode.negativeConnections.length === 1 &&
            nextNode.negativeConnections[0] === currentUuid) {
          nextUuid = nextCandidate;
        }
      }

      currentUuid = nextUuid;
    }

    return chain;
  }

  /**
   * Calculate total series count
   */
  private calculateSeriesCount(graph: TopologyGraph): number {
    const seriesGroups = this.findSeriesGroups(graph);
    return seriesGroups.reduce((sum, group) => sum + group.length, 0);
  }

  // Helper methods to get cell specifications
  private getCellVoltage(cellId: number): number {
    // TODO: Load from database
    return 3.6; // Default nominal voltage
  }

  private getCellCapacity(cellId: number): number {
    // TODO: Load from database
    return 3000; // Default capacity in mAh
  }

  private getCellChemistry(cellId: number): string {
    // TODO: Load from database
    return 'NMC'; // Default chemistry
  }

  private getCellDischargeCurrent(cellId: number): number {
    // TODO: Load from database
    return 15; // Default max discharge current
  }
}