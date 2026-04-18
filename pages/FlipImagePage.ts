import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class FlipImagePage extends BasePage {
  readonly uploadArea: Locator;
  readonly selectFilesButton: Locator;
  readonly fileInput: Locator;
  readonly clearButton: Locator;
  readonly horizontalFlipButton: Locator;
  readonly verticalFlipButton: Locator;
  readonly downloadButton: Locator;
  readonly previewSection: Locator;
  readonly previewImage: Locator;

  constructor(page: Page) {
    super(page);
    this.uploadArea = page.locator('text=Drag and drop your file here').first();
    this.selectFilesButton = page.getByRole('button', { name: /select files/i });
    this.fileInput = page.locator('input[type="file"]').first();
    this.clearButton = page.getByRole('button', { name: /clear/i });

    // Flip options are checkboxes
    this.horizontalFlipButton = page.getByRole('checkbox', { name: /flip horizontal/i });
    this.verticalFlipButton = page.getByRole('checkbox', { name: /flip vertical/i });

    this.downloadButton = page.getByRole('button', { name: /download png/i });
    this.previewSection = page.locator('text=Preview').first();
    this.previewImage = page.locator('img[src*="blob"], img[src*="data:image"]').first();
  }

  async navigateToFlipImage() {
    await this.goto('/flip-image');
  }

  async uploadImage(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1500);
  }

  async verifyUploadSuccess() {
    await this.downloadButton.waitFor({ state: 'visible', timeout: 5000 });
  }

  async verifyUploadFailure() {
    await this.uploadArea.waitFor({ state: 'visible', timeout: 3000 });
  }

  async selectHorizontalFlip() {
    const isChecked = await this.horizontalFlipButton.isChecked();
    if (!isChecked) {
      await this.horizontalFlipButton.click();
    }
    await this.page.waitForTimeout(500);
  }

  async selectVerticalFlip() {
    const isChecked = await this.verticalFlipButton.isChecked();
    if (!isChecked) {
      await this.verticalFlipButton.click();
    }
    await this.page.waitForTimeout(500);
  }

  async clickDownload() {
    await this.downloadButton.waitFor({ state: 'visible', timeout: 10000 });
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadButton.click()
    ]);
    return download;
  }

  async flipAndDownload(direction: 'horizontal' | 'vertical') {
    if (direction === 'horizontal') {
      await this.selectHorizontalFlip();
    } else {
      await this.selectVerticalFlip();
    }
    return await this.clickDownload();
  }

  async clickClear() {
    await this.clearButton.click();
    await this.page.waitForTimeout(500);
  }

  async verifyPreviewVisible() {
    await this.previewSection.waitFor({ state: 'visible', timeout: 5000 });
  }

  async verifyFlipOptionsAvailable() {
    const horizontalVisible = await this.horizontalFlipButton.isVisible({ timeout: 2000 }).catch(() => false);
    const verticalVisible = await this.verticalFlipButton.isVisible({ timeout: 2000 }).catch(() => false);
    return horizontalVisible || verticalVisible;
  }
}
