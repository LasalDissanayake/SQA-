import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class PngCompressorPage extends BasePage {
  readonly uploadArea: Locator;
  readonly selectFilesButton: Locator;
  readonly fileInput: Locator;
  readonly clearButton: Locator;
  readonly downloadButton: Locator;
  readonly originalSizeText: Locator;
  readonly previewSection: Locator;
  readonly compressionInfoText: Locator;

  constructor(page: Page) {
    super(page);
    this.uploadArea = page.locator('text=Drag and drop your file here').first();
    this.selectFilesButton = page.getByRole('button', { name: /select files/i });
    this.fileInput = page.locator('input[type="file"]').first();
    this.clearButton = page.getByRole('button', { name: /clear/i });
    this.downloadButton = page.getByRole('button', { name: /download png/i });
    this.originalSizeText = page.locator('text=/Size|Original/i');
    this.previewSection = page.locator('text=Preview').first();
    this.compressionInfoText = page.locator('text=/lossless|compression/i');
  }

  async navigateToPngCompressor() {
    await this.goto('/png-compressor');
  }

  async uploadImage(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1500); // Wait for upload and processing
  }

  async verifyUploadSuccess() {
    // After successful upload, the download button should be visible
    await this.downloadButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async verifyUploadFailure() {
    // Upload area should still show the initial state
    await this.uploadArea.waitFor({ state: 'visible', timeout: 3000 });
  }

  async clickDownload() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadButton.click()
    ]);
    return download;
  }

  async clickClear() {
    await this.clearButton.click();
    await this.page.waitForTimeout(500);
  }

  async verifyPreviewVisible() {
    await this.previewSection.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getCompressionInfo(): Promise<string> {
    const text = await this.compressionInfoText.textContent();
    return text || '';
  }
}
