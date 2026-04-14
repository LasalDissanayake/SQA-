import { Page, expect } from '@playwright/test';

export class PdfEditorPage {
  constructor(public readonly page: Page) {}

  // Page Header
  get header() { return this.page.getByRole('heading', { name: /PDF Editor/i }).or(this.page.getByText('PDF Editor', { exact: true }).first()); }

  // Toolbar Section
  get toolbarLabel() { return this.page.getByText('Toolbar', { exact: true }); }
  get chooseFileBtn() { return this.page.getByText(/Choose File/i).first(); }
  get noFileChosenText() { return this.page.getByText(/No file chosen/i).first(); }
  
  // Right side global tools
  get downloadBtn() { return this.page.getByRole('button', { name: /Download/i }).or(this.page.getByText(/Download/i).first()); }

  // Editor tools (Row 2)
  get fontDropdown() { return this.page.getByText('Helvetica (Sans)', { exact: true }).first(); }
  get fontSizeInput() { return this.page.getByText('16', { exact: true }).first(); }
  
  // Alignment & Styles
  get boldStyleBtn() { return this.page.getByText('B', { exact: true }).first(); }
  get alignLeftBtn() { return this.page.getByText('L', { exact: true }).first(); }
  get alignCenterBtn() { return this.page.getByText('C', { exact: true }).first(); }
  get alignRightBtn() { return this.page.getByText('R', { exact: true }).first(); }

  // Zoom
  get zoomLabel() { return this.page.getByText('Zoom', { exact: true }); }
  get zoomPercentage() { return this.page.getByText(/120%/).first(); }

  // Page Section
  get pageSectionLabel() { return this.page.getByText('Page', { exact: true }); }
  get prevBtn() { return this.page.getByRole('button', { name: /Prev/i }).or(this.page.getByText(/Prev/i).first()); }
  get nextBtn() { return this.page.getByRole('button', { name: /Next/i }).or(this.page.getByText(/Next/i).first()); }
  get pageIndicator() { return this.page.getByText('1', { exact: true }); } // Matches the "1" between Prev and Next
}
