import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class BulkResizePage extends BasePage {
  readonly uploadArea: Locator;
  readonly selectImagesButton: Locator;
  readonly fileInput: Locator;
  readonly clearButton: Locator;
  readonly widthInput: Locator;
  readonly heightInput: Locator;
  readonly keepAspectCheckbox: Locator;
  readonly processDownloadButton: Locator;
  readonly filesList: Locator;

  constructor(page: Page) {
    super(page);
    this.uploadArea = page.locator('text=Drag and drop your file here').first();
    this.selectImagesButton = page.getByRole('button', { name: /select images/i });
    this.fileInput = page.locator('input[type="file"]').first();
    this.clearButton = page.getByRole('button', { name: /clear/i });
    this.widthInput = page.getByPlaceholder('Width').first();
    this.heightInput = page.getByPlaceholder('Height').first();
    this.keepAspectCheckbox = page.locator('input[type="checkbox"]').first();
    this.processDownloadButton = page.getByRole('button', { name: /process.*download/i });
    this.filesList = page.locator('text=/Screenshot.*png|.*jpg|.*webp/').first();
  }

  async navigateToBulkResize() {
    await this.goto('/bulk-resize');
  }

  async uploadImages(filePaths: string[]) {
    await this.fileInput.setInputFiles(filePaths);
    await this.page.waitForTimeout(1000); // Wait for upload processing
  }

  async uploadSingleImage(filePath: string) {
    await this.uploadImages([filePath]);
  }

  async verifyFilesUploaded(count: number) {
    // Check that files are listed
    const files = this.page.locator('text=/Screenshot|.*\\.png|.*\\.jpg|.*\\.webp/');
    await files.first().waitFor({ state: 'visible', timeout: 5000 });
    const fileCount = await files.count();
    return fileCount >= count;
  }

  async verifyUploadFailure() {
    // Upload area should still show the initial state
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

  async clickProcessDownload() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.processDownloadButton.click();
    return await downloadPromise;
  }

  async clickClear() {
    await this.clearButton.click();
    await this.page.waitForTimeout(500);
  }

  async verifyErrorMessage(expectedMessage: string) {
    const errorLocator = this.page.locator(`text=/${expectedMessage}/i`);
    await errorLocator.waitFor({ state: 'visible', timeout: 5000 });
  }
}
