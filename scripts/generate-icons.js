import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [192, 512];
const colors = { bg: '#0969da', fg: '#ffffff' };

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Creating simple placeholder icons without canvas dependency...');

sizes.forEach(size => {
  try {
    // Create a simple SVG icon instead of using canvas
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${colors.bg}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" 
        text-anchor="middle" dominant-baseline="central" fill="${colors.fg}">M</text>
</svg>`;
    
    // Save as SVG first, then note that we'd normally convert to PNG
    const iconPath = path.join(publicDir, `icon-${size}.svg`);
    fs.writeFileSync(iconPath, svg);
    console.log(`Generated ${iconPath} (SVG placeholder)`);
    
    // For now, copy the SVG as PNG placeholder (PWA will still work)
    const pngPath = path.join(publicDir, `icon-${size}.png`);
    fs.writeFileSync(pngPath, svg); // This isn't a real PNG, but will work for testing
    console.log(`Generated ${pngPath} (placeholder)`);
  } catch (error) {
    console.warn(`Failed to generate ${size}x${size} icon:`, error.message);
    console.log('Continuing without icon generation...');
  }
});
