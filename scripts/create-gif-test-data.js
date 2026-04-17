const fs = require('fs');
const path = require('path');

// Create a minimal valid GIF file (1x1 pixel, animated with 2 frames)
// GIF89a format with animation
const animatedGif = Buffer.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a header
  0x01, 0x00, 0x01, 0x00, // Width: 1, Height: 1
  0x80, 0x00, 0x00, // Global Color Table Flag, Color Resolution, Sort Flag, Size
  0xFF, 0xFF, 0xFF, // Background Color (white)
  0x00, 0x00, 0x00, // Black color
  0x21, 0xFF, 0x0B, // Application Extension
  0x4E, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2E, 0x30, // NETSCAPE2.0
  0x03, 0x01, 0x00, 0x00, 0x00, // Loop forever
  0x21, 0xF9, 0x04, // Graphic Control Extension
  0x00, 0x0A, 0x00, 0x00, 0x00, // Delay: 10/100 sec
  0x2C, 0x00, 0x00, 0x00, 0x00, // Image Descriptor
  0x01, 0x00, 0x01, 0x00, 0x00, // Width: 1, Height: 1
  0x02, 0x02, 0x44, 0x01, 0x00, // Image Data
  0x21, 0xF9, 0x04, // Graphic Control Extension (frame 2)
  0x00, 0x0A, 0x00, 0x00, 0x00, // Delay: 10/100 sec
  0x2C, 0x00, 0x00, 0x00, 0x00, // Image Descriptor
  0x01, 0x00, 0x01, 0x00, 0x00, // Width: 1, Height: 1
  0x02, 0x02, 0x44, 0x01, 0x00, // Image Data
  0x3B // Trailer
]);

// Create a static GIF (non-animated)
const staticGif = Buffer.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a header
  0x01, 0x00, 0x01, 0x00, // Width: 1, Height: 1
  0x80, 0x00, 0x00, // Global Color Table Flag
  0xFF, 0xFF, 0xFF, // White
  0x00, 0x00, 0x00, // Black
  0x2C, 0x00, 0x00, 0x00, 0x00, // Image Descriptor
  0x01, 0x00, 0x01, 0x00, 0x00, // Width: 1, Height: 1
  0x02, 0x02, 0x44, 0x01, 0x00, // Image Data
  0x3B // Trailer
]);

const testDataDir = path.join(__dirname, '../test-data');

// Ensure test-data directory exists
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
}

// Write animated GIF
fs.writeFileSync(path.join(testDataDir, 'animated.gif'), animatedGif);
console.log('Created animated.gif');

// Write static GIF
fs.writeFileSync(path.join(testDataDir, 'valid.gif'), staticGif);
console.log('Created valid.gif');

// Create a larger animated GIF by repeating the pattern
const largeAnimatedGif = Buffer.concat([
  animatedGif,
  Buffer.alloc(5000, 0x00) // Add padding to make it larger
]);
fs.writeFileSync(path.join(testDataDir, 'large-animated.gif'), largeAnimatedGif);
console.log('Created large-animated.gif');

console.log('GIF test data files created successfully!');
