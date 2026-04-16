import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly cropDropdownTrigger: Locator;

  constructor(page: Page) {
    super(page);
    this.cropDropdownTrigger = page.locator('text=Crop ▾').first();
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
}

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
