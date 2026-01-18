import * as THREE from 'three';

/**
 * Generate a realistic battery texture for cells
 */
export function generateCellTexture(color: string = '#2563eb', manufacturer?: string, model?: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext('2d')!;

  // Create metallic cylindrical battery appearance
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width * 0.4;

  // Create cylindrical gradient (simulating curved surface)
  for (let y = 0; y < canvas.height; y++) {
    const normalizedY = (y - centerY) / radius;
    const distanceFromCenter = Math.abs(normalizedY);

    // Create cylindrical lighting effect
    const lightIntensity = Math.max(0.3, 1 - distanceFromCenter * 0.7);
    const shadowIntensity = Math.max(0.1, distanceFromCenter * 0.3);

    const r = Math.floor(parseInt(color.slice(1, 3), 16) * lightIntensity * (1 - shadowIntensity * 0.5));
    const g = Math.floor(parseInt(color.slice(3, 5), 16) * lightIntensity * (1 - shadowIntensity * 0.5));
    const b = Math.floor(parseInt(color.slice(5, 7), 16) * lightIntensity * (1 - shadowIntensity * 0.5));

    context.fillStyle = `rgb(${r}, ${g}, ${b})`;
    context.fillRect(0, y, canvas.width, 1);
  }

  // Add metallic highlights
  const highlightGradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  highlightGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)');
  highlightGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

  context.fillStyle = highlightGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Add subtle texture/noise
  context.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 2 + 0.5;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
  }

  // Add manufacturer branding if provided
  if (manufacturer && model) {
    context.save();
    context.translate(centerX, centerY);

    // Manufacturer name
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.font = 'bold 24px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(manufacturer.toUpperCase(), 0, -15);

    // Model name
    context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    context.font = '16px Arial';
    context.fillText(model, 0, 10);

    context.restore();
  }

  // Add warning label
  context.fillStyle = 'rgba(255, 255, 0, 0.8)';
  context.font = 'bold 14px Arial';
  context.textAlign = 'center';
  context.fillText('LITHIUM', centerX, canvas.height - 40);
  context.fillText('BATTERY', centerX, canvas.height - 25);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 16;
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