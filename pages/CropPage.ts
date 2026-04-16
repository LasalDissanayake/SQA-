import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import fs from 'fs';

export class CropPage extends BasePage {
  readonly uploadInput: Locator;
  readonly selectFilesButton: Locator;
  readonly previewCanvas: Locator;

  // New Identifiers
  readonly xInput: Locator;
  readonly yInput: Locator;
  readonly widthInput: Locator;
  readonly heightInput: Locator;
  readonly downloadButton: Locator;
  readonly clearButton: Locator;
  
  // Crop Handles (if they exist as divs)
  readonly activeCropBox: Locator;

  constructor(page: Page) {
    super(page);
    this.uploadInput = page.locator('input[type="file"]');
    this.selectFilesButton = page.getByRole('button', { name: 'Select files' });
    this.previewCanvas = page.locator('text=No image yet.').last();

    this.xInput = page.getByLabel('X');
    this.yInput = page.getByLabel('Y');
    this.widthInput = page.getByLabel('Width');
    this.heightInput = page.getByLabel('Height');

    this.downloadButton = page.getByRole('button', { name: /download|crop/i }).last();
    this.clearButton = page.getByRole('button', { name: /clear/i }).last();
    
    // We will target the crop box boundary that receives drag events. Often classes like .ReactCrop__crop-selection
    // or just the generic box container.
    this.activeCropBox = page.locator('.ReactCrop__crop-selection, .cropper-crop-box, [data-testid="crop-box"]').first();
  }

  async uploadImage(filePath: string) {
    await this.uploadInput.waitFor({ state: 'attached' });
    await this.uploadInput.setInputFiles(filePath);
  }

  async uploadViaDrop(filePath: string) {
    // Read file manually
    const buffer = fs.readFileSync(filePath);
    const fileName = require('path').basename(filePath);
    
    // Create data layout
    const mimeType = fileName.endsWith('.png') ? 'image/png' 
      : fileName.endsWith('.jpg') ? 'image/jpeg' 
      : fileName.endsWith('.webp') ? 'image/webp' 
      : 'text/plain';

    // Dispatch synthetic drop event onto the dropzone. We use a more generic text selector for the dropzone parent.
    const dropzone = this.page.locator('text=Drag and drop your file here').first();
    
    // Add file to data transfer payload
    const dataTransfer = await this.page.evaluateHandle(
        ([bufferData, fileName, mimeType]) => {
            const dt = new DataTransfer();
            // In browser context we need to create a File object
            const blob = new Blob([new Uint8Array(bufferData)], { type: mimeType });
            const file = new File([blob], fileName, { type: mimeType });
            dt.items.add(file);
            return dt;
        },
        [Array.from(buffer), fileName, mimeType]
    );

    await dropzone.dispatchEvent('drop', { dataTransfer });
  }

  async verifyUploadSuccess() {
    await expect(this.previewCanvas).toBeHidden({ timeout: 10000 });
  }

  async verifyUploadFailure() {
    // If it fails, the preview canvas should remain indicating "No image yet."
    await expect(this.previewCanvas).toBeVisible({ timeout: 5000 });
  }

  async getScreenshot(screenshotName: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${screenshotName}.png`, fullPage: true });
  }
}
