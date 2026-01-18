import * as THREE from 'three';

/**
 * Generate a simple colored texture for cells
 */
export function generateCellTexture(color: string = '#4a90e2'): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d')!;

  // Create gradient background
  const gradient = context.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.5, lightenColor(color, 0.2));
  gradient.addColorStop(1, darkenColor(color, 0.1));

  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);

  // Add some texture/detail
  context.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const size = Math.random() * 50 + 10;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Generate terminal textures
 */
export function generateTerminalTexture(type: 'positive' | 'negative'): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d')!;

  if (type === 'positive') {
    // Positive terminal - red with + symbol
    context.fillStyle = '#dc2626';
    context.fillRect(0, 0, 128, 128);

    // Add metallic shine
    const gradient = context.createLinearGradient(0, 0, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    // Draw + symbol
    context.fillStyle = '#ffffff';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('+', 64, 64);
  } else {
    // Negative terminal - black with - symbol
    context.fillStyle = '#1f2937';
    context.fillRect(0, 0, 128, 128);

    // Add metallic shine
    const gradient = context.createLinearGradient(0, 0, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    // Draw - symbol
    context.fillStyle = '#ffffff';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('−', 64, 64);
  }

  return new THREE.CanvasTexture(canvas);
}

/**
 * Generate material texture (metallic, plastic, etc.)
 */
export function generateMaterialTexture(type: 'metallic' | 'plastic' | 'rubber' = 'metallic'): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d')!;

  switch (type) {
    case 'metallic':
      // Brushed metal effect
      const metalGradient = context.createLinearGradient(0, 0, 256, 256);
      metalGradient.addColorStop(0, '#c0c0c0');
      metalGradient.addColorStop(0.5, '#a0a0a0');
      metalGradient.addColorStop(1, '#808080');
      context.fillStyle = metalGradient;
      context.fillRect(0, 0, 256, 256);

      // Add brush strokes
      context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      context.lineWidth = 1;
      for (let i = 0; i < 50; i++) {
        context.beginPath();
        context.moveTo(Math.random() * 256, 0);
        context.lineTo(Math.random() * 256, 256);
        context.stroke();
      }
      break;

    case 'plastic':
      // Plastic effect
      context.fillStyle = '#e5e7eb';
      context.fillRect(0, 0, 256, 256);

      // Add subtle pattern
      context.fillStyle = 'rgba(0, 0, 0, 0.05)';
      for (let x = 0; x < 256; x += 16) {
        for (let y = 0; y < 256; y += 16) {
          if ((x + y) % 32 === 0) {
            context.fillRect(x, y, 8, 8);
          }
        }
      }
      break;

    case 'rubber':
      // Rubber effect
      context.fillStyle = '#374151';
      context.fillRect(0, 0, 256, 256);

      // Add texture
      context.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const size = Math.random() * 4 + 1;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
      }
      break;
  }

  return new THREE.CanvasTexture(canvas);
}

/**
 * Utility functions for color manipulation
 */
function lightenColor(color: string, amount: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * amount * 100);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function darkenColor(color: string, amount: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * amount * 100);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
    (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
    (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
}