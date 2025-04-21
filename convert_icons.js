const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function convertIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Create a simple icon programmatically
  ctx.fillStyle = '#2196F3';
  ctx.fillRect(0, 0, size, size);
  
  // Draw triangle
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(size/2, size/4);
  ctx.lineTo(size*3/4, size*3/4);
  ctx.lineTo(size/4, size*3/4);
  ctx.closePath();
  ctx.fill();
  
  // Draw circle
  ctx.beginPath();
  ctx.arc(size/2, size*5/6, size/8, 0, Math.PI * 2);
  ctx.fill();
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icons/icon${size}.png`, buffer);
}

// Create icons of different sizes
[16, 48, 128].forEach(size => {
  convertIcon(size);
}); 