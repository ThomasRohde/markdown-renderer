import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [192, 512];
const colors = { bg: '#0969da', fg: '#ffffff' };

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating icons...');

// Function to create icon with fallback
function createIcon(size) {
  try {
    // Try to use canvas for proper PNG generation
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, size, size);
    
    // Text
    ctx.fillStyle = colors.fg;
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('M', size / 2, size / 2);
    
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.warn('Canvas not available, creating SVG fallback');
    // Fallback to SVG
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${colors.bg}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" 
        text-anchor="middle" dominant-baseline="central" fill="${colors.fg}">M</text>
</svg>`;
  }
}

sizes.forEach(size => {
  try {
    // Generate SVG version
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${colors.bg}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" 
        text-anchor="middle" dominant-baseline="central" fill="${colors.fg}">M</text>
</svg>`;
    
    const svgPath = path.join(publicDir, `icon-${size}.svg`);
    fs.writeFileSync(svgPath, svg);
    console.log(`Generated ${svgPath}`);
    
    // Generate PNG version
    const iconData = createIcon(size);
    const pngPath = path.join(publicDir, `icon-${size}.png`);
    fs.writeFileSync(pngPath, iconData);
    console.log(`Generated ${pngPath}`);
    
  } catch (error) {
    console.warn(`Failed to generate ${size}x${size} icon:`, error.message);
    // Create a simple base64 PNG as absolute fallback
    const fallbackPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const pngPath = path.join(publicDir, `icon-${size}.png`);
    fs.writeFileSync(pngPath, Buffer.from(fallbackPng, 'base64'));
    console.log(`Generated fallback ${pngPath}`);
  }
});
