import { Page, expect } from '@playwright/test';

export class DocumentConverterPage {
  constructor(public readonly page: Page) {}

  // Common UI Elements across all converters
  get dragAndDropText() { return this.page.getByText('Drag and drop your file here'); }
  get supportedFormatsText() { return this.page.getByText(/Supported: .* Max 20MB/i); }

  // --- Image -> PDF Locators ---
  get imgToPdfHeader() { return this.page.getByRole('heading', { name: /Image.*(to|->|→).*PDF/i }).or(this.page.getByText(/Image.*(to|->|→).*PDF/i).first()); }
  get selectImagesBtn() { return this.page.getByRole('button', { name: /Select Images/i }).or(this.page.getByText(/Select Images/i)); }
  
  // Selected Images Settings
  get selectedImagesSection() { return this.page.getByText('Selected Images', { exact: true }); }
  get pageSettingA4() { return this.page.getByText('A4', { exact: true }); }
  get pageSettingLetter() { return this.page.getByText('Letter', { exact: true }); }
  get orientationPortrait() { return this.page.getByText('Portrait', { exact: true }); }
  get orientationLandscape() { return this.page.getByText('Landscape', { exact: true }); }
  get arrangeVertical() { return this.page.getByText('Vertical', { exact: true }); }
  get arrangeHorizontal() { return this.page.getByText('Horizontal', { exact: true }); }
  get pagesOne() { return this.page.getByText('One', { exact: true }); }
  get pagesMultiple() { return this.page.getByText('Multiple', { exact: true }); }
  
  get createPdfBtn() { return this.page.getByRole('button', { name: /Create PDF/i }).or(this.page.getByText(/Create PDF/i)); }
  get previewSection() { return this.page.getByText('Preview', { exact: true }); }

  // --- PDF -> Word Locators ---
  get pdfToWordHeader() { return this.page.getByRole('heading', { name: /PDF.*(to|->|→).*Word/i }).or(this.page.getByText(/PDF.*(to|->|→).*Word/i).first()); }
  get selectPdfBtn() { return this.page.getByRole('button', { name: /Select PDF/i }).or(this.page.getByText(/Select PDF/i)); }
  get pdfToWordInstructions() { return this.page.getByText('Choose a text-based PDF exported from Word for best results.'); }

  // --- Word -> PDF Locators ---
  get wordToPdfHeader() { return this.page.getByRole('heading', { name: /Word.*(to|->|→).*PDF/i }).or(this.page.getByText(/Word.*(to|->|→).*PDF/i).first()); }
  // Providing generic locators for "Select Word" button as exact text wasn't in the screenshot
  get selectWordBtn() { return this.page.getByRole('button', { name: /Select (Word|File)/i }).or(this.page.getByText(/Select (Word|File)/i)); }
}
