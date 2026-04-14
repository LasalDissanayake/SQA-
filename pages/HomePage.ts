import { Page, expect } from '@playwright/test';

export class HomePage {
  constructor(public readonly page: Page) {}

  async navigate() {
    await this.page.goto('/');
    // Wait for the page to be fully loaded
    await this.page.waitForLoadState('networkidle');
  }

  // Component Locators
  // Document Converter
  get documentConverterHeader() { return this.page.getByText('Document Converter').first(); }
  get imgToPdfLink() { return this.page.getByText(/Image.*(to|->)?.*PDF/i).first(); }
  get pdfToWordLink() { return this.page.getByText(/PDF.*(to|->)?.*Word/i).first(); }
  get wordToPdfLink() { return this.page.getByText(/Word.*(to|->)?.*PDF/i).first(); }

  // PDF Editor
  get pdfEditorHeader() { return this.page.getByText('PDF Editor').first(); }
  get openEditorLink() { return this.page.getByRole('link', { name: /Open Editor/i }).first(); }

  // Resize
  get resizeHeader() { return this.page.getByText('Resize', { exact: true }).first(); }
  get resizeLink() { return this.page.locator('.card, .bg-white, .rounded').filter({ hasText: 'Resize' }).getByText('Resize', { exact: true }).nth(1); } // Or fallback
  get batchResizeLink() { return this.page.getByText(/Batch Resize/i).first(); }
  get imageEnlargerLink() { return this.page.getByText(/Image Enlarger/i).first(); }

  // Crop
  get cropHeader() { return this.page.getByText('Crop', { exact: true }).first(); }

  // Compress
  get compressHeader() { return this.page.getByText('Compress', { exact: true }).first(); }
  get compressImageLink() { return this.page.getByText(/Compress Image/i).first(); }

  // Image Converter
  get imageConverterHeader() { return this.page.getByText('Image Converter').first(); }

  // Utilities to get generic links which might have duplicates across sections 
  get toJpgLinks() { return this.page.getByText(/To JPG/i); }
  get toPngLinks() { return this.page.getByText(/To PNG/i); }
  get toWebpLinks() { return this.page.getByText(/To WebP/i); }
  get toGifLinks() { return this.page.getByText(/To GIF/i); }

  // More Tools
  get moreToolsHeader() { return this.page.getByText('More Tools').first(); }
  get rotateLink() { return this.page.getByText(/Rotate/i).first(); }
  get flipLink() { return this.page.getByText(/Flip/i).first(); }
  get memeLink() { return this.page.getByText(/Meme/i).first(); }
  get colorPickerLink() { return this.page.getByText(/Color Picker/i).first(); }
  get imgToTextLink() { return this.page.getByText(/Image.*(to|->|→).*Text/i).first(); }

  // Transliteration
  get transliterationHeader() { return this.page.getByText('Transliteration').first(); }

  // Aggregated assertion workflow
  async verifyAllSupportedToolsVisible() {
    // Assert Headers
    await expect(this.documentConverterHeader).toBeVisible();
    await expect(this.pdfEditorHeader).toBeVisible();
    await expect(this.resizeHeader).toBeVisible();
    await expect(this.cropHeader).toBeVisible();
    await expect(this.compressHeader).toBeVisible();
    await expect(this.imageConverterHeader).toBeVisible();
    await expect(this.moreToolsHeader).toBeVisible();

    // Assert Links in Document Converter
    await expect(this.imgToPdfLink).toBeVisible();
    await expect(this.pdfToWordLink).toBeVisible();
    await expect(this.wordToPdfLink).toBeVisible();

    // Assert Links in PDF Editor
    await expect(this.openEditorLink).toBeVisible();

    // Assert Links in Resize
    await expect(this.resizeLink).toBeVisible();
    await expect(this.batchResizeLink).toBeVisible();
    await expect(this.imageEnlargerLink).toBeVisible();

    // Assert generic conversion links exist on the page
    const jpgCount = await this.toJpgLinks.count();
    expect(jpgCount).toBeGreaterThan(0);
    
    const pngCount = await this.toPngLinks.count();
    expect(pngCount).toBeGreaterThan(0);

    const webpCount = await this.toWebpLinks.count();
    expect(webpCount).toBeGreaterThan(0);

    // Assert Compress
    await expect(this.compressImageLink).toBeVisible();
    
    // Assert More Tools
    await expect(this.rotateLink).toBeVisible();
    await expect(this.flipLink).toBeVisible();
    await expect(this.memeLink).toBeVisible();
    await expect(this.colorPickerLink).toBeVisible();
    await expect(this.imgToTextLink).toBeVisible();
  }
}
