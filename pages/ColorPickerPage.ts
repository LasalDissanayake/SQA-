import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ColorPickerPage extends BasePage {
  readonly colorCanvas: Locator;
  readonly colorSlider: Locator;
  readonly hexInput: Locator;
  readonly colorPreview: Locator;
  readonly hexCopyButton: Locator;
  readonly rgbCopyButton: Locator;
  readonly hslCopyButton: Locator;
  readonly resetButton: Locator;
  readonly clearButton: Locator;
  readonly hexCodeDisplay: Locator;
  readonly rgbCodeDisplay: Locator;

  constructor(page: Page) {
    super(page);
    this.colorCanvas = page.locator('canvas').first();
    this.colorSlider = page.locator('input[type="range"]').first();

    // Hex input may be a hidden/contenteditable element
    this.hexInput = page.locator('input[type="text"], [contenteditable="true"]').first();

    // Color preview is shown under "Selected Color" heading
    this.colorPreview = page.locator('text=Selected Color').first();

    // Copy buttons: first is for Hex, second is for the other format
    this.hexCopyButton = page.getByRole('button', { name: /copy/i }).first();
    this.rgbCopyButton = page.getByRole('button', { name: /copy/i }).nth(1);
    this.hslCopyButton = page.getByRole('button', { name: /copy/i }).nth(2);

    this.resetButton = page.getByRole('button', { name: /reset/i });
    this.clearButton = page.getByRole('button', { name: /clear/i });

    // Hex code is displayed as text "#rrggbb"
    this.hexCodeDisplay = page.locator('text=/^#[0-9A-Fa-f]{6}$/').first();
    this.rgbCodeDisplay = page.locator('text=/rgb\\(/i').first();
  }

  async navigateToColorPicker() {
    await this.goto('/color-picker');
  }

  async clickColorWheel(x: number, y: number) {
    const canvas = await this.colorCanvas.boundingBox();
    if (canvas) {
      await this.page.mouse.click(canvas.x + x, canvas.y + y);
      await this.page.waitForTimeout(500);
    }
  }

  async clickColorWheelCenter() {
    const canvas = await this.colorCanvas.boundingBox();
    if (canvas) {
      await this.page.mouse.click(
        canvas.x + canvas.width / 2,
        canvas.y + canvas.height / 2
      );
      await this.page.waitForTimeout(500);
    }
  }

  async enterHexCode(hexCode: string) {
    const formattedHex = hexCode.startsWith('#') ? hexCode : `#${hexCode}`;

    // Try clicking on the hex display text and typing (some pickers make it editable)
    const hexDisplay = this.hexCodeDisplay;
    if (await hexDisplay.isVisible({ timeout: 2000 }).catch(() => false)) {
      await hexDisplay.click();
      await this.page.waitForTimeout(300);
      await this.page.keyboard.press('Control+a');
      await this.page.keyboard.type(formattedHex);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(500);
      return;
    }

    // Try any visible text input
    if (await this.hexInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.hexInput.fill(formattedHex);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(500);
    }
  }

  async enterInvalidHexCode(invalidCode: string) {
    const hexDisplay = this.hexCodeDisplay;
    if (await hexDisplay.isVisible({ timeout: 2000 }).catch(() => false)) {
      await hexDisplay.click();
      await this.page.waitForTimeout(300);
      await this.page.keyboard.press('Control+a');
      await this.page.keyboard.type(invalidCode);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(500);
      return;
    }
    if (await this.hexInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.hexInput.fill(invalidCode);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(500);
    }
  }

  async getHexCode(): Promise<string> {
    const el = this.page.locator('text=/^#[0-9A-Fa-f]{6}$/i').first();
    const text = await el.textContent({ timeout: 3000 }).catch(() => '');
    return text?.trim() || '';
  }

  async getRgbCode(): Promise<string> {
    const text = await this.rgbCodeDisplay.textContent({ timeout: 3000 }).catch(() => '');
    return text?.trim() || '';
  }

  async clickCopyButton(format: 'hex' | 'rgb' | 'hsl' = 'hex') {
    if (format === 'hex') {
      await this.hexCopyButton.click();
    } else if (format === 'rgb') {
      await this.rgbCopyButton.click();
    } else {
      await this.hslCopyButton.click();
    }
    await this.page.waitForTimeout(500);
  }

  async getClipboardContent(): Promise<string> {
    return await this.page.evaluate(() => navigator.clipboard.readText());
  }

  async clickReset() {
    if (await this.resetButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.resetButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  async clickClear() {
    if (await this.clearButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.clearButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  async verifyColorPreviewVisible() {
    // "Selected Color" section is always visible on the color picker page
    await this.colorPreview.waitFor({ state: 'visible', timeout: 5000 });
  }

  async verifyErrorMessage() {
    const errorMessage = this.page.locator('text=/error|invalid/i').first();
    return await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
  }
}
