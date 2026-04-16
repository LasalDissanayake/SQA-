import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly cropDropdownTrigger: Locator;
  readonly editorDropdownTrigger: Locator;
  readonly compressDropdownTrigger: Locator;
  readonly moreDropdownTrigger: Locator;

  constructor(page: Page) {
    super(page);
    this.cropDropdownTrigger = page.locator('text=Crop ▾').first();
    this.editorDropdownTrigger = page.locator('text=Editor ▾').first();
    this.compressDropdownTrigger = page.locator('text=Compress ▾').first();
    this.moreDropdownTrigger = page.locator('text=More ▾').first();
  }

  async navigateToHome() {
    await this.goto('/');
  }

  async navigateToCropFormat(format: 'png' | 'jpg' | 'webp') {
    // According to the test case "Navigate to Crop dropdown in the Header. Click each sub-option."
    // We hover or click the dropdown, then select the format.
    const formatTextLabel = format.toUpperCase();
    await this.cropDropdownTrigger.click();
    
    // Wait for the dropdown menu to expand and click the sub option
    const subOption = this.page.getByRole('button', { name: `Crop ${formatTextLabel}` }).last();
    // Sometimes sub dropdown items are links, buttons, or divs so fallback to basic text locator
    const fallbackOption = this.page.locator(`text=Crop ${formatTextLabel}`).last();
    
    // Playwright handles visibility automatically on click
    if (await submitSafeClick(subOption)) {
        return;
    }
    await processSafeClick(fallbackOption);
  }

  async hoverNavMenuAndGetItems(menuName: 'Editor' | 'Compress' | 'More'): Promise<string[]> {
    let triggerLocator: Locator;
    if (menuName === 'Editor') triggerLocator = this.editorDropdownTrigger;
    else if (menuName === 'Compress') triggerLocator = this.compressDropdownTrigger;
    else triggerLocator = this.moreDropdownTrigger;

    // We do hover to trigger CSS visibility
    await triggerLocator.hover();
    
    // Once hovered, the dropdown items should be attached. 
    // They are usually sibling items or nested absolute divs. 
    // Wait for the animation
    await this.page.waitForTimeout(500); 

    // Find the next sibling `ul` or direct dropdown container near the hovered trigger.
    // We'll rely on text elements being rendered within the active dropdown.
    // Instead of risking generic locators, we'll extract all visible link texts in the header that appeared
    const dropdownTexts = await triggerLocator.locator('xpath=following-sibling::*').allInnerTexts();
    if (dropdownTexts.length > 0 && dropdownTexts[0]) {
      return dropdownTexts[0].split('\n').map(t => t.trim()).filter(Boolean);
    }
    return [];
  }

  async navigateToPdfEditor() {
    await this.editorDropdownTrigger.click();
    const pdfEditorOption = this.page.getByRole('button', { name: 'PDF Editor' }).last();
    const fallbackOption = this.page.locator('text=PDF Editor').last();
    
    if (await submitSafeClick(pdfEditorOption)) return;
    await processSafeClick(fallbackOption);
  }

  async navigateToCompressorFormat(formatStr: string) {
    await this.compressDropdownTrigger.click();
    // Sometimes 'To PNG', 'Compress Image', 'PNG Compressor'
    const option = this.page.getByRole('button', { name: formatStr }).last();
    const fallbackOption = this.page.locator(`text=${formatStr}`).last();
    
    if (await submitSafeClick(option)) return;
    await processSafeClick(fallbackOption);
  }
} // End of class

// Util fallback 
async function submitSafeClick(loc: Locator): Promise<boolean> {
   try {
     await loc.waitFor({ state: 'visible', timeout: 3000 });
     await loc.click({ force: true });
     return true;
   } catch (e) {
     return false;
   }
}

async function processSafeClick(loc: Locator): Promise<boolean> {
   try {
     await loc.waitFor({ state: 'attached', timeout: 3000 });
     await loc.click({ force: true });
     return true;
   } catch (e) {
     return false;
   }
}
