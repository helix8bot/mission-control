const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Configuration
const DARK_BG = '#0a0d14';
const GOLD = '#c9a962';

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = DARK_BG;
  ctx.fillRect(0, 0, size, size);
  
  // Configure text
  const fontSize = Math.floor(size * 0.45); // 45% of canvas size
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = GOLD;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw "MC" text centered
  ctx.fillText('MC', size / 2, size / 2);
  
  return canvas;
}

// Generate both icons
console.log('Generating icons...');

const icon192 = generateIcon(192);
const icon512 = generateIcon(512);

const publicDir = path.join(__dirname, 'public');
const icon192Path = path.join(publicDir, 'icon-192.png');
const icon512Path = path.join(publicDir, 'icon-512.png');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Save icons
const buffer192 = icon192.toBuffer('image/png');
const buffer512 = icon512.toBuffer('image/png');

fs.writeFileSync(icon192Path, buffer192);
fs.writeFileSync(icon512Path, buffer512);

console.log('✓ Generated icon-192.png');
console.log('✓ Generated icon-512.png');
console.log('Icons created successfully!');
