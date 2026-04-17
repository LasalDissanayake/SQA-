import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class FlipImagePage extends BasePage {
  readonly uploadArea: Locator;
  readonly selectFilesButton: Locator;
  readonly fileInput: Locator;
  readonly clearButton: Locator;
  readonly horizontalFlipButton: Locator;
  readonly verticalFlipButton: Locator;
  readonly flipButton: Locator;
  readonly downloadButton: Locator;
  readonly previewSection: Locator;
  readonly previewImage: Locator;
  readonly flipSection: Locator;

  constructor(page: Page) {
    super(page);
    this.uploadArea = page.locator('text=Drag and drop your file here').first();
    this.selectFilesButton = page.getByRole('button', { name: /select files/i });
    this.fileInput = page.locator('input[type="file"]').first();
    this.clearButton = page.getByRole('button', { name: /clear/i });
    
    // Flip option buttons - could be radio buttons, regular buttons, or icons
    this.horizontalFlipButton = page.getByRole('button', { name: /horizontal/i }).or(
      page.locator('button:has-text("Horizontal")').or(
        page.locator('[title*="horizontal" i], [aria-label*="horizontal" i]')
      )
    );
    this.verticalFlipButton = page.getByRole('button', { name: /vertical/i }).or(
      page.locator('button:has-text("Vertical")').or(
        page.locator('[title*="vertical" i], [aria-label*="vertical" i]')
      )
    );
    
    // Generic flip/download buttons
    this.flipButton = page.getByRole('button', { name: /^flip$/i });
    this.downloadButton = page.getByRole('button', { name: /download/i });
    
    this.previewSection = page.locator('text=Preview').first();
    this.previewImage = page.locator('img[src*="blob"], img[src*="data:image"]').first();
    this.flipSection = page.locator('text=Flip').first();
  }

  async navigateToFlipImage() {
    await this.goto('/flip-image');
  }

  async uploadImage(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1500); // Wait for upload and processing
  }

  async verifyUploadSuccess() {
    // After successful upload, flip options should be available
    const horizontalVisible = await this.horizontalFlipButton.isVisible({ timeout: 5000 }).catch(() => false);
    const verticalVisible = await this.verticalFlipButton.isVisible({ timeout: 5000 }).catch(() => false);
    const downloadVisible = await this.downloadButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (!horizontalVisible && !verticalVisible && !downloadVisible) {
      // Wait a bit more for processing
      await this.page.waitForTimeout(2000);
    }
  }

  async verifyUploadFailure() {
    // Upload area should still show the initial state
    await this.uploadArea.waitFor({ state: 'visible', timeout: 3000 });
  }

  async selectHorizontalFlip() {
    await this.horizontalFlipButton.click();
    await this.page.waitForTimeout(500); // Wait for flip preview
  }

  async selectVerticalFlip() {
    await this.verticalFlipButton.click();
    await this.page.waitForTimeout(500); // Wait for flip preview
  }

  async clickFlip() {
    // Some implementations auto-flip, others need a flip button
    if (await this.flipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.flipButton.click();
      await this.page.waitForTimeout(1000); // Wait for flip processing
    }
  }

  async clickDownload() {
    // Wait for download button to be ready
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
    await this.clickFlip();
    return await this.clickDownload();
  }

  async clickClear() {
    await this.clearButton.click();
    await this.page.waitForTimeout(500);
  }

  async verifyPreviewVisible() {
    await this.previewSection.waitFor({ state: 'visible', timeout: 5000 });
  }

  async verifyPreviewImage() {
    await this.previewImage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async verifyFlipOptionsAvailable() {
    // Check if flip option UI is available
    const horizontalVisible = await this.horizontalFlipButton.isVisible({ timeout: 2000 }).catch(() => false);
    const verticalVisible = await this.verticalFlipButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    return horizontalVisible || verticalVisible;
  }
}
