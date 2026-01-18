import { useSceneStore, useUIStore } from '../stores';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

/**
 * Keyboard shortcuts manager
 */
export class KeyboardShortcuts {
  private static shortcuts: Map<string, KeyboardShortcut> = new Map();
  private static initialized = false;

  /**
   * Initialize keyboard shortcuts
   */
  static init(): void {
    if (this.initialized) return;

    this.registerShortcuts();
    this.bindEvents();
    this.initialized = true;
  }

  /**
   * Register all keyboard shortcuts
   */
  private static registerShortcuts(): void {
    const shortcuts: KeyboardShortcut[] = [
      // File operations
      {
        key: 'n',
        ctrl: true,
        action: () => {
          // New project
          console.log('New project shortcut');
        },
        description: 'New Project',
      },
      {
        key: 'o',
        ctrl: true,
        action: () => {
          // Open project
          console.log('Open project shortcut');
        },
        description: 'Open Project',
      },
      {
        key: 's',
        ctrl: true,
        action: () => {
          // Save project
          console.log('Save project shortcut');
        },
        description: 'Save Project',
      },

      // Edit operations
      {
        key: 'z',
        ctrl: true,
        action: () => {
          useSceneStore.getState().undo();
        },
        description: 'Undo',
      },
      {
        key: 'y',
        ctrl: true,
        action: () => {
          useSceneStore.getState().redo();
        },
        description: 'Redo',
      },
      {
        key: 'z',
        ctrl: true,
        shift: true,
        action: () => {
          useSceneStore.getState().redo();
        },
        description: 'Redo (Alternative)',
      },

      // Selection
      {
        key: 'a',
        action: () => {
          // Select all
          const cells = useSceneStore.getState().cells;
          const uuids = Array.from(cells.keys());
          useSceneStore.getState().select(uuids, 'replace');
        },
        description: 'Select All',
      },
      {
        key: 'a',
        alt: true,
        action: () => {
          // Deselect all
          useSceneStore.getState().select([], 'replace');
        },
        description: 'Deselect All',
      },
      {
        key: 'i',
        ctrl: true,
        action: () => {
          // Invert selection
          const selected = useSceneStore.getState().selectedUuids;
          const allCells = useSceneStore.getState().cells;
          const allUuids = Array.from(allCells.keys());
          const inverted = allUuids.filter(uuid => !selected.has(uuid));
          useSceneStore.getState().select(inverted, 'replace');
        },
        description: 'Invert Selection',
      },

      // Tools
      {
        key: 'g',
        action: () => {
          useUIStore.getState().setActiveTool('transform');
          useUIStore.getState().setTransformMode('translate');
        },
        description: 'Translate Tool',
      },
      {
        key: 'r',
        action: () => {
          useUIStore.getState().setActiveTool('transform');
          useUIStore.getState().setTransformMode('rotate');
        },
        description: 'Rotate Tool',
      },
      {
        key: 's',
        action: () => {
          useUIStore.getState().setActiveTool('transform');
          useUIStore.getState().setTransformMode('scale');
        },
        description: 'Scale Tool',
      },

      // View
      {
        key: 'f',
        action: () => {
          // Frame selection
          console.log('Frame selection');
        },
        description: 'Frame Selection',
      },
      {
        key: 'Home',
        action: () => {
          // Frame all
          console.log('Frame all');
        },
        description: 'Frame All',
      },

      // Edit
      {
        key: 'd',
        ctrl: true,
        action: () => {
          const selected = useSceneStore.getState().selectedUuids;
          if (selected.size > 0) {
            const selectedArray = Array.from(selected);
            const newUuids = useSceneStore.getState().duplicate(selectedArray);
            useSceneStore.getState().select(newUuids, 'replace');
          }
        },
        description: 'Duplicate',
      },
      {
        key: 'g',
        ctrl: true,
        action: () => {
          const selected = useSceneStore.getState().selectedUuids;
          if (selected.size > 0) {
            const selectedArray = Array.from(selected);
            const groupUuid = useSceneStore.getState().group(selectedArray, 'Group');
            useSceneStore.getState().select([groupUuid], 'replace');
          }
        },
        description: 'Group',
      },
      {
        key: 'g',
        ctrl: true,
        shift: true,
        action: () => {
          const selected = useSceneStore.getState().selectedUuids;
          const firstSelected = Array.from(selected)[0];
          if (firstSelected) {
            useSceneStore.getState().ungroup(firstSelected);
          }
        },
        description: 'Ungroup',
      },

      // Delete
      {
        key: 'Delete',
        action: () => {
          const selected = useSceneStore.getState().selectedUuids;
          if (selected.size > 0) {
            const selectedArray = Array.from(selected);
            useSceneStore.getState().removeObjects(selectedArray);
          }
        },
        description: 'Delete',
      },
      {
        key: 'Backspace',
        action: () => {
          const selected = useSceneStore.getState().selectedUuids;
          if (selected.size > 0) {
            const selectedArray = Array.from(selected);
            useSceneStore.getState().removeObjects(selectedArray);
          }
        },
        description: 'Delete (Alternative)',
      },

      // Visibility
      {
        key: 'h',
        action: () => {
          // Hide selection
          console.log('Hide selection');
        },
        description: 'Hide',
      },
      {
        key: 'h',
        alt: true,
        action: () => {
          // Show all
          console.log('Show all');
        },
        description: 'Show All',
      },

      // Snap toggle
      {
        key: 'Control',
        action: () => {
          // This is handled by the transform controls
        },
        description: 'Hold for Snap',
      },
    ];

    shortcuts.forEach(shortcut => {
      const key = this.getShortcutKey(shortcut);
      this.shortcuts.set(key, shortcut);
    });
  }

  /**
   * Bind keyboard event listeners
   */
  private static bindEvents(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Handle keydown events
   */
  private static handleKeyDown(event: KeyboardEvent): void {
    // Skip if typing in input fields
    if (event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }

    const shortcut = this.findShortcut(event);
    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
    }
  }

  /**
   * Find matching shortcut for keyboard event
   */
  private static findShortcut(event: KeyboardEvent): KeyboardShortcut | null {
    const key = this.normalizeKey(event.key);
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    // Try exact match first
    const exactKey = this.getShortcutKey({ key, ctrl, shift, alt } as KeyboardShortcut);
    if (this.shortcuts.has(exactKey)) {
      return this.shortcuts.get(exactKey)!;
    }

    // Try without modifiers
    const noModKey = this.getShortcutKey({ key } as KeyboardShortcut);
    if (this.shortcuts.has(noModKey)) {
      return this.shortcuts.get(noModKey)!;
    }

    return null;
  }

  /**
   * Get normalized shortcut key string
   */
  private static getShortcutKey(shortcut: Partial<KeyboardShortcut>): string {
    const parts = [];
    if (shortcut.ctrl) parts.push('ctrl');
    if (shortcut.shift) parts.push('shift');
    if (shortcut.alt) parts.push('alt');
    parts.push(shortcut.key?.toLowerCase() || '');
    return parts.join('+');
  }

  /**
   * Normalize key names
   */
  private static normalizeKey(key: string): string {
    switch (key) {
      case ' ': return 'Space';
      case 'ArrowUp': return 'Up';
      case 'ArrowDown': return 'Down';
      case 'ArrowLeft': return 'Left';
      case 'ArrowRight': return 'Right';
      default: return key;
    }
  }

  /**
   * Get all registered shortcuts
   */
  static getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts grouped by category
   */
  static getShortcutsByCategory(): Record<string, KeyboardShortcut[]> {
    const categories = {
      'File': [] as KeyboardShortcut[],
      'Edit': [] as KeyboardShortcut[],
      'Selection': [] as KeyboardShortcut[],
      'Tools': [] as KeyboardShortcut[],
      'View': [] as KeyboardShortcut[],
    };

    this.shortcuts.forEach(shortcut => {
      if (shortcut.description.includes('Project')) {
        categories.File.push(shortcut);
      } else if (shortcut.description.includes('Undo') || shortcut.description.includes('Redo') || shortcut.description.includes('Duplicate')) {
        categories.Edit.push(shortcut);
      } else if (shortcut.description.includes('Select') || shortcut.description.includes('Deselect') || shortcut.description.includes('Invert')) {
        categories.Selection.push(shortcut);
      } else if (shortcut.description.includes('Tool')) {
        categories.Tools.push(shortcut);
      } else if (shortcut.description.includes('Frame') || shortcut.description.includes('Hide') || shortcut.description.includes('Show')) {
        categories.View.push(shortcut);
      }
    });

    return categories;
  }
}