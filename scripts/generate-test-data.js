const fs = require('fs');
const path = require('path');

const testDataDir = path.join(__dirname, '../test-data');
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir);
}

// 1. Create valid.pdf
// Simple tiny valid PDF buffer
const pdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n199\n%%EOF\n";
fs.writeFileSync(path.join(testDataDir, 'valid.pdf'), pdfContent);

// 2. Create empty.png (0 bytes)
fs.writeFileSync(path.join(testDataDir, 'empty.png'), '');

// 3. Create large.jpg (Copying a valid image to bypass valid Image Data checks on Canvas)
const testImagePath = path.join(__dirname, '../test-data/test-image.png');
if (fs.existsSync(testImagePath)) {
  fs.copyFileSync(testImagePath, path.join(testDataDir, 'large.jpg'));
} else {
  // fallback if somehow missing
  fs.writeFileSync(path.join(testDataDir, 'large.jpg'), '');
}

console.log("Test data generated successfully.");
