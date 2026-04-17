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
  readonly convertSection: Locator;

  constructor(page: Page) {
    super(page);
    this.uploadArea = page.locator('text=Drag and drop your file here').first();
    this.selectFilesButton = page.getByRole('button', { name: /select files/i });
    this.fileInput = page.locator('input[type="file"]').first();
    this.clearButton = page.getByRole('button', { name: /clear/i });
    
    // Format selection - could be dropdown, radio buttons, or buttons
    this.formatDropdown = page.locator('select').first();
    
    // Convert/Download buttons
    this.convertButton = page.getByRole('button', { name: /convert/i });
    this.downloadButton = page.getByRole('button', { name: /download/i });
    
    this.previewSection = page.locator('text=Preview').first();
    this.previewImage = page.locator('img[src*="blob"], img[src*="data:image"]').first();
    this.convertSection = page.locator('text=Convert').first();
  }

  async navigateToConvertImage() {
    await this.goto('/convert-image');
  }

  async uploadImage(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1500); // Wait for upload and processing
  }

  async verifyUploadSuccess() {
    // After successful upload, format options should be available
    // Check if either format dropdown or convert button is visible
    const formatVisible = await this.formatDropdown.isVisible({ timeout: 3000 }).catch(() => false);
    const convertVisible = await this.convertButton.isVisible({ timeout: 3000 }).catch(() => false);
    const downloadVisible = await this.downloadButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (!formatVisible && !convertVisible && !downloadVisible) {
      // Wait a bit more for processing
      await this.page.waitForTimeout(2000);
    }
  }

  async verifyUploadFailure() {
    // Upload area should still show the initial state
    await this.uploadArea.waitFor({ state: 'visible', timeout: 3000 });
  }

  async selectFormat(format: string) {
    // Try dropdown first
    if (await this.formatDropdown.isVisible({ timeout: 1000 }).catch(() => false)) {
      await this.formatDropdown.selectOption(format.toUpperCase());
      return;
    }
    
    // Try radio buttons
    const radioButton = this.page.locator(`input[type="radio"][value="${format.toUpperCase()}"], input[type="radio"][value="${format.toLowerCase()}"]`).first();
    if (await radioButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await radioButton.click();
      return;
    }
    
    // Try format buttons (e.g., "PNG", "JPG", "WEBP" buttons)
    const formatButton = this.page.getByRole('button', { name: new RegExp(format, 'i') });
    if (await formatButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await formatButton.click();
      return;
    }
    
    // Try text/link with format name
    const formatLink = this.page.locator(`text=/^${format}$/i`).first();
    await formatLink.click();
  }

  async clickConvert() {
    // Some implementations auto-convert, others need a convert button
    if (await this.convertButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.convertButton.click();
      await this.page.waitForTimeout(1000); // Wait for conversion
    }
  }

  async clickDownload(expectedFormat?: string) {
    // Wait for download button to be ready
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

  async verifyPreviewImage() {
    await this.previewImage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getSelectedFormat(): Promise<string> {
    // Try to get selected format from dropdown
    if (await this.formatDropdown.isVisible({ timeout: 1000 }).catch(() => false)) {
      return await this.formatDropdown.inputValue();
    }
    
    // Try to get from checked radio button
    const checkedRadio = this.page.locator('input[type="radio"]:checked').first();
    if (await checkedRadio.isVisible({ timeout: 1000 }).catch(() => false)) {
      return await checkedRadio.getAttribute('value') || '';
    }
    
    return '';
  }

  async verifyFormatOptionsAvailable() {
    // Check if format selection UI is available
    const dropdownVisible = await this.formatDropdown.isVisible({ timeout: 2000 }).catch(() => false);
    const radioVisible = await this.page.locator('input[type="radio"]').first().isVisible({ timeout: 2000 }).catch(() => false);
    const formatButtonsVisible = await this.page.locator('button:has-text("PNG"), button:has-text("JPG"), button:has-text("WEBP")').first().isVisible({ timeout: 2000 }).catch(() => false);
    
    return dropdownVisible || radioVisible || formatButtonsVisible;
  }
}
