import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async verifyUrlContains(urlPart: string) {
    await expect(this.page).toHaveURL(new RegExp(urlPart));
  }

  async verifyElementVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  async clickElement(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }
}
