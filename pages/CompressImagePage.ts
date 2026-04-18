import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CompressImagePage extends BasePage {
  readonly uploadArea: Locator;
  readonly selectFilesButton: Locator;
  readonly fileInput: Locator;
  readonly clearButton: Locator;
  readonly qualitySlider: Locator;
  readonly downloadButton: Locator;
  readonly originalSizeText: Locator;
  readonly compressedSizeText: Locator;
  readonly previewSection: Locator;
  readonly formatDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.uploadArea = page.locator('text=Drag and drop your file here').first();
    this.selectFilesButton = page.getByRole('button', { name: /select files/i });
    this.fileInput = page.locator('input[type="file"]').first();
    this.clearButton = page.getByRole('button', { name: /clear/i });
    this.qualitySlider = page.locator('input[type="range"]').first();
    this.downloadButton = page.getByRole('button', { name: /download/i });
    this.originalSizeText = page.locator('text=/Size:.*×.*/').first();
    this.compressedSizeText = page.locator('text=/Compressed|New.*:/i').first();
    this.previewSection = page.locator('text=Preview').first();
    this.formatDropdown = page.locator('select').first();
  }

  async navigateToCompressImage() {
    await this.goto('/compress-image');
  }

  async uploadImage(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1500);
  }

  async verifyUploadSuccess() {
    await this.qualitySlider.waitFor({ state: 'visible', timeout: 5000 });
  }

  async verifyUploadFailure() {
    await this.uploadArea.waitFor({ state: 'visible', timeout: 3000 });
  }

  async setQuality(percentage: number) {
    // Slider uses 0.05-1 range (not 0-100)
    const min = parseFloat(await this.qualitySlider.getAttribute('min') || '0.05');
    const max = parseFloat(await this.qualitySlider.getAttribute('max') || '1');
    const value = Math.max(min, Math.min(max, percentage / 100));
    await this.qualitySlider.fill(value.toString());
    await this.page.waitForTimeout(500);
  }

  async getQuality(): Promise<string> {
    const val = parseFloat(await this.qualitySlider.inputValue());
    return Math.round(val * 100).toString();
  }

  async getOriginalSize(): Promise<string> {
    const text = await this.originalSizeText.textContent().catch(() => '');
    return text || '';
  }

  async getCompressedSize(): Promise<string> {
    const text = await this.compressedSizeText.textContent().catch(() => '');
    return text || '';
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

  async selectFormat(format: string) {
    if (await this.formatDropdown.isVisible()) {
      await this.formatDropdown.selectOption({ label: new RegExp(format, 'i') });
    }
  }
}
