const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Dark background
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, size, size);
  
  // Gold "MC" text
  ctx.fillStyle = '#c9a962';
  ctx.font = `bold ${size * 0.4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MC', size / 2, size / 2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Generated ${filename} (${size}x${size})`);
}

// Generate both icon sizes
generateIcon(192, 'public/icon-192.png');
generateIcon(512, 'public/icon-512.png');

console.log('✓ PWA icons generated successfully!');
