import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class GifCompressorPage extends BasePage {
  readonly uploadArea: Locator;
  readonly selectFilesButton: Locator;
  readonly fileInput: Locator;
  readonly clearButton: Locator;
  readonly compressButton: Locator;
  readonly downloadButton: Locator;
  readonly originalSizeText: Locator;
  readonly previewSection: Locator;
  readonly animationPreview: Locator;

  constructor(page: Page) {
    super(page);
    this.uploadArea = page.locator('text=Drag and drop your file here').first();
    this.selectFilesButton = page.getByRole('button', { name: /select gif/i });
    this.fileInput = page.locator('input[type="file"]').first();
    this.clearButton = page.getByRole('button', { name: /clear/i });
    this.compressButton = page.getByRole('button', { name: /^compress$/i });
    this.downloadButton = page.getByRole('button', { name: /download/i });
    this.originalSizeText = page.locator('text=/Size|Original/i');
    this.previewSection = page.locator('text=Preview').first();
    this.animationPreview = page.locator('img[src*=".gif"], img[src*="blob"], img[alt="preview"]').first();
  }

  async navigateToGifCompressor() {
    await this.goto('/gif-compressor');
  }

  async uploadGif(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(2000);
  }

  async verifyUploadSuccess() {
    // After upload the Compress button becomes available
    await this.compressButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async verifyUploadFailure() {
    await this.uploadArea.waitFor({ state: 'visible', timeout: 3000 });
  }

  async clickDownload() {
    // Click Compress to start compression, then wait for Download GIF button and click it
    await this.compressButton.click();
    await this.downloadButton.waitFor({ state: 'visible', timeout: 15000 });
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

  async verifyAnimationPreview() {
    await this.animationPreview.waitFor({ state: 'visible', timeout: 5000 });
  }
}
