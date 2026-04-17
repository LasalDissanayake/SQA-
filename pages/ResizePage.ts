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
    this.widthInput = page.locator('input').filter({ hasText: '' }).first(); // Will need to be more specific
    this.heightInput = page.locator('input').filter({ hasText: '' }).nth(1);
    this.keepAspectCheckbox = page.locator('input[type="checkbox"]').first();
    this.downloadButton = page.getByRole('button', { name: /download png/i });
    this.originalDimensionsText = page.locator('text=/Original:.*×.*/');
    this.previewSection = page.locator('text=Preview').first();
  }

  async navigateToResize() {
    await this.goto('/resize-image');
  }

  async uploadImage(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1000); // Wait for upload processing
  }

  async uploadViaDrop(filePath: string) {
    const buffer = require('fs').readFileSync(filePath);
    const dataTransfer = await this.page.evaluateHandle((data: number[]) => {
      const dt = new DataTransfer();
      const file = new File([new Uint8Array(data)], 'test-file.png', { type: 'image/png' });
      dt.items.add(file);
      return dt;
    }, Array.from(buffer));

    await this.uploadArea.dispatchEvent('drop', { dataTransfer });
    await this.page.waitForTimeout(1000);
  }

  async verifyUploadSuccess() {
    // After successful upload, the original dimensions should be visible
    await this.originalDimensionsText.waitFor({ state: 'visible', timeout: 5000 });
  }

  async verifyUploadFailure() {
    // Upload area should still show the initial state
    await this.uploadArea.waitFor({ state: 'visible', timeout: 3000 });
  }

  async setWidth(width: string) {
    // Find the width input more specifically
    const widthField = this.page.locator('input').filter({ has: this.page.locator('text=/width/i') }).or(
      this.page.locator('label:has-text("Width") + input')
    ).or(this.widthInput);
    await widthField.first().fill(width);
  }

  async setHeight(height: string) {
    const heightField = this.page.locator('input').filter({ has: this.page.locator('text=/height/i') }).or(
      this.page.locator('label:has-text("Height") + input')
    ).or(this.heightInput);
    await heightField.first().fill(height);
  }

  async getWidth(): Promise<string> {
    const widthField = this.page.locator('input').filter({ has: this.page.locator('text=/width/i') }).or(
      this.page.locator('label:has-text("Width") + input')
    ).or(this.widthInput);
    return await widthField.first().inputValue();
  }

  async getHeight(): Promise<string> {
    const heightField = this.page.locator('input').filter({ has: this.page.locator('text=/height/i') }).or(
      this.page.locator('label:has-text("Height") + input')
    ).or(this.heightInput);
    return await heightField.first().inputValue();
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
