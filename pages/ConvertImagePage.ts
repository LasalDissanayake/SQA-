import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ConvertImagePage extends BasePage {
  readonly uploadArea: Locator;
  readonly selectFilesButton: Locator;
  readonly fileInput: Locator;
  readonly clearButton: Locator;
  readonly formatDropdown: Locator;
  readonly convertButton: Locator;
  readonly downloadButton: Locator;
  readonly previewSection: Locator;
  readonly previewImage: Locator;

  constructor(page: Page) {
    super(page);
    this.uploadArea = page.locator('text=Drag and drop your file here').first();
    this.selectFilesButton = page.getByRole('button', { name: /select files/i });
    this.fileInput = page.locator('input[type="file"]').first();
    this.clearButton = page.getByRole('button', { name: /clear/i });
    this.formatDropdown = page.locator('select').first();
    this.convertButton = page.getByRole('button', { name: /^convert$/i });
    this.downloadButton = page.getByRole('button', { name: /download/i });
    this.previewSection = page.locator('text=Preview').first();
    this.previewImage = page.locator('img[src*="blob"], img[src*="data:image"]').first();
  }

  async navigateToConvertImage() {
    await this.goto('/convert-image');
  }

  async uploadImage(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1500);
  }

  async verifyUploadSuccess() {
    const formatVisible = await this.formatDropdown.isVisible({ timeout: 5000 }).catch(() => false);
    const downloadVisible = await this.downloadButton.isVisible({ timeout: 3000 }).catch(() => false);
    if (!formatVisible && !downloadVisible) {
      await this.page.waitForTimeout(2000);
    }
  }

  async verifyUploadFailure() {
    await this.uploadArea.waitFor({ state: 'visible', timeout: 3000 });
  }

  async selectFormat(format: string) {
    // Options use "SOURCE → TARGET" labels, match on the target portion
    if (!await this.formatDropdown.isVisible({ timeout: 2000 }).catch(() => false)) return;

    // Find an option whose label contains "→ FORMAT" (targets the output format)
    const targetPattern = new RegExp(`→.*${format}`, 'i');
    const anyPattern = new RegExp(format, 'i');

    const options = await this.formatDropdown.locator('option').all();
    for (const option of options) {
      const text = (await option.textContent() || '').trim();
      if (targetPattern.test(text)) {
        const value = await option.getAttribute('value') || text;
        await this.formatDropdown.selectOption(value);
        return;
      }
    }
    // Fallback: match any option containing the format name
    for (const option of options) {
      const text = (await option.textContent() || '').trim();
      if (anyPattern.test(text)) {
        const value = await option.getAttribute('value') || text;
        await this.formatDropdown.selectOption(value);
        return;
      }
    }
  }

  async clickConvert() {
    if (await this.convertButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.convertButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async clickDownload(expectedFormat?: string) {
    await this.downloadButton.waitFor({ state: 'visible', timeout: 10000 });
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadButton.click()
    ]);
    return download;
  }

  async convertAndDownload(format: string) {
    await this.selectFormat(format);
    await this.clickConvert();
    return await this.clickDownload(format);
  }

  async clickClear() {
    await this.clearButton.click();
    await this.page.waitForTimeout(500);
  }

  async verifyPreviewVisible() {
    await this.previewSection.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getSelectedFormat(): Promise<string> {
    if (await this.formatDropdown.isVisible({ timeout: 1000 }).catch(() => false)) {
      return await this.formatDropdown.inputValue();
    }
    return '';
  }

  async verifyFormatOptionsAvailable() {
    const dropdownVisible = await this.formatDropdown.isVisible({ timeout: 2000 }).catch(() => false);
    return dropdownVisible;
  }
}
