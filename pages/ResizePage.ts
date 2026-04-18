import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ResizePage extends BasePage {
  readonly uploadArea: Locator;
  readonly selectFilesButton: Locator;
  readonly fileInput: Locator;
  readonly clearButton: Locator;
  readonly widthInput: Locator;
  readonly heightInput: Locator;
  readonly keepAspectCheckbox: Locator;
  readonly downloadButton: Locator;
  readonly originalDimensionsText: Locator;
  readonly previewSection: Locator;

  constructor(page: Page) {
    super(page);
    this.uploadArea = page.locator('text=Drag and drop your file here').first();
    this.selectFilesButton = page.getByRole('button', { name: /select files/i });
    this.fileInput = page.locator('input[type="file"]').first();
    this.clearButton = page.getByRole('button', { name: /clear/i });
    this.widthInput = page.locator('input[type="number"]').first();
    this.heightInput = page.locator('input[type="number"]').nth(1);
    this.keepAspectCheckbox = page.locator('input[type="checkbox"]').first();
    this.downloadButton = page.getByRole('button', { name: /download png/i });
    this.originalDimensionsText = page.locator('text=/Original:.*×.*/').first();
    this.previewSection = page.locator('text=Preview').first();
  }

  async navigateToResize() {
    await this.goto('/resize-image');
  }

  async uploadImage(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1000);
  }

  async verifyUploadSuccess() {
    await this.originalDimensionsText.waitFor({ state: 'visible', timeout: 5000 });
  }

  async verifyUploadFailure() {
    await this.uploadArea.waitFor({ state: 'visible', timeout: 3000 });
  }

  async setWidth(width: string) {
    await this.widthInput.fill(width);
  }

  async setHeight(height: string) {
    await this.heightInput.fill(height);
  }

  async getWidth(): Promise<string> {
    return await this.widthInput.inputValue();
  }

  async getHeight(): Promise<string> {
    return await this.heightInput.inputValue();
  }

  async toggleKeepAspect(checked: boolean) {
    const isChecked = await this.keepAspectCheckbox.isChecked();
    if (isChecked !== checked) {
      await this.keepAspectCheckbox.click();
    }
  }

  async isKeepAspectChecked(): Promise<boolean> {
    return await this.keepAspectCheckbox.isChecked();
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
}
