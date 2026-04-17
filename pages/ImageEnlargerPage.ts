import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ImageEnlargerPage extends BasePage {
  readonly uploadArea: Locator;
  readonly selectFilesButton: Locator;
  readonly fileInput: Locator;
  readonly clearButton: Locator;
  readonly scaleSlider: Locator;
  readonly downloadButton: Locator;
  readonly originalDimensionsText: Locator;
  readonly newDimensionsText: Locator;
  readonly previewSection: Locator;

  constructor(page: Page) {
    super(page);
    this.uploadArea = page.locator('text=Drag and drop your file here').first();
    this.selectFilesButton = page.getByRole('button', { name: /select files/i });
    this.fileInput = page.locator('input[type="file"]').first();
    this.clearButton = page.getByRole('button', { name: /clear/i });
    this.scaleSlider = page.locator('input[type="range"]').first();
    this.downloadButton = page.getByRole('button', { name: /download png/i });
    this.originalDimensionsText = page.locator('text=/Original:.*×.*/');
    this.newDimensionsText = page.locator('text=/New:.*×.*/');
    this.previewSection = page.locator('text=Preview').first();
  }

  async navigateToImageEnlarger() {
    await this.goto('/image-enlarger');
  }

  async uploadImage(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1000); // Wait for upload processing
  }

  async verifyUploadSuccess() {
    // After successful upload, the original dimensions should be visible
    await this.originalDimensionsText.waitFor({ state: 'visible', timeout: 5000 });
  }

  async verifyUploadFailure() {
    // Upload area should still show the initial state
    await this.uploadArea.waitFor({ state: 'visible', timeout: 3000 });
  }

  async setScale(percentage: number) {
    // Slider typically works with value attribute
    await this.scaleSlider.fill(percentage.toString());
    await this.page.waitForTimeout(500); // Wait for dimension update
  }

  async getScale(): Promise<string> {
    return await this.scaleSlider.inputValue();
  }

  async getOriginalDimensions(): Promise<string> {
    return await this.originalDimensionsText.textContent() || '';
  }

  async getNewDimensions(): Promise<string> {
    return await this.newDimensionsText.textContent() || '';
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
}
