/**
 * Accessibility utilities for CellForge
 */
export class Accessibility {
  private static highContrastMode = false;
  private static reducedMotion = false;

  /**
   * Initialize accessibility features
   */
  static init(): void {
    this.detectPreferences();
    this.setupFocusManagement();
    this.setupKeyboardNavigation();
  }

  /**
   * Detect user accessibility preferences
   */
  private static detectPreferences(): void {
    // Check for high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    this.highContrastMode = prefersHighContrast;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.reducedMotion = prefersReducedMotion;

    // Apply initial styles
    this.applyAccessibilityStyles();
  }

  /**
   * Apply accessibility-related CSS custom properties
   */
  private static applyAccessibilityStyles(): void {
    const root = document.documentElement;

    if (this.highContrastMode) {
      root.style.setProperty('--border-width', '2px');
      root.style.setProperty('--focus-outline-width', '3px');
    }

    if (this.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    }
  }

  /**
   * Set up focus management
   */
  private static setupFocusManagement(): void {
    // Ensure focus is visible
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Focus trap for modals (if implemented)
    // This would be added to modal components
  }

  /**
   * Set up keyboard navigation
   */
  private static setupKeyboardNavigation(): void {
    // Skip links for screen readers
    this.createSkipLinks();
  }

  /**
   * Create skip links for keyboard navigation
   */
  private static createSkipLinks(): void {
    const skipLinks = document.createElement('div');
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#toolbar" class="skip-link">Skip to toolbar</a>
      <a href="#library" class="skip-link">Skip to library</a>
    `;
    skipLinks.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      z-index: 1000;
    `;

    const style = document.createElement('style');
    style.textContent = `
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.2s;
      }
      .skip-link:focus {
        top: 6px;
      }
    `;

    document.head.appendChild(style);
    document.body.insertBefore(skipLinks, document.body.firstChild);
  }

  /**
   * Announce content changes to screen readers
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Set focus to an element safely
   */
  static setFocus(element: HTMLElement | null): void {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }

  /**
   * Check if high contrast mode is enabled
   */
  static isHighContrastMode(): boolean {
    return this.highContrastMode;
  }

  /**
   * Check if reduced motion is preferred
   */
  static prefersReducedMotion(): boolean {
    return this.reducedMotion;
  }

  /**
   * Get accessible label for an element
   */
  static getAccessibleLabel(element: HTMLElement): string {
    const label = element.getAttribute('aria-label') ||
                  element.getAttribute('aria-labelledby') ||
                  element.textContent ||
                  element.getAttribute('title') ||
                  '';

    return label.trim();
  }

  /**
   * Make element keyboard accessible
   */
  static makeKeyboardAccessible(element: HTMLElement, handler: (event: KeyboardEvent) => void): void {
    element.setAttribute('tabindex', '0');
    element.addEventListener('keydown', (event) => {
      // Only handle Enter and Space
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler(event);
      }
    });
  }
}