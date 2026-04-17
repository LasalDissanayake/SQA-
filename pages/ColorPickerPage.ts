import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ColorPickerPage extends BasePage {
  readonly colorWheel: Locator;
  readonly colorCanvas: Locator;
  readonly colorSlider: Locator;
  readonly hexInput: Locator;
  readonly rgbInput: Locator;
  readonly hslInput: Locator;
  readonly colorPreview: Locator;
  readonly hexCopyButton: Locator;
  readonly rgbCopyButton: Locator;
  readonly hslCopyButton: Locator;
  readonly resetButton: Locator;
  readonly clearButton: Locator;
  readonly hexCodeDisplay: Locator;
  readonly rgbCodeDisplay: Locator;
  readonly hslCodeDisplay: Locator;

  constructor(page: Page) {
    super(page);
    
    // Color selection elements
    this.colorWheel = page.locator('canvas, .color-wheel, .color-picker-canvas').first();
    this.colorCanvas = page.locator('canvas').first();
    this.colorSlider = page.locator('input[type="range"]').first();
    
    // Input fields
    this.hexInput = page.locator('input[placeholder*="hex" i], input[name*="hex" i], input[id*="hex" i]').first();
    this.rgbInput = page.locator('input[placeholder*="rgb" i], input[name*="rgb" i]').first();
    this.hslInput = page.locator('input[placeholder*="hsl" i], input[name*="hsl" i]').first();
    
    // Color preview
    this.colorPreview = page.locator('.color-preview, .selected-color, [class*="preview"]').first();
    
    // Copy buttons
    this.hexCopyButton = page.getByRole('button', { name: /copy/i }).first();
    this.rgbCopyButton = page.getByRole('button', { name: /copy/i }).nth(1);
    this.hslCopyButton = page.getByRole('button', { name: /copy/i }).nth(2);
    
    // Reset/Clear buttons
    this.resetButton = page.getByRole('button', { name: /reset/i });
    this.clearButton = page.getByRole('button', { name: /clear/i });
    
    // Color code displays
    this.hexCodeDisplay = page.locator('text=/^#[0-9A-Fa-f]{6}$/').first();
    this.rgbCodeDisplay = page.locator('text=/rgb\\(/i').first();
    this.hslCodeDisplay = page.locator('text=/hsl\\(/i').first();
  }

  async navigateToColorPicker() {
    await this.goto('/color-picker');
  }

  async clickColorWheel(x: number, y: number) {
    // Click at specific coordinates on the color wheel/canvas
    const canvas = await this.colorCanvas.boundingBox();
    if (canvas) {
      await this.page.mouse.click(canvas.x + x, canvas.y + y);
      await this.page.waitForTimeout(500);
    }
  }

  async clickColorWheelCenter() {
    // Click at the center of the color wheel
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
    // Ensure hex code starts with #
    const formattedHex = hexCode.startsWith('#') ? hexCode : `#${hexCode}`;
    
    // Try to find and fill hex input
    if (await this.hexInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.hexInput.fill(formattedHex);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(500);
      return;
    }
    
    // Fallback: try any input that might accept hex codes
    const anyInput = this.page.locator('input[type="text"]').first();
    if (await anyInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await anyInput.fill(formattedHex);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(500);
    }
  }

  async enterInvalidHexCode(invalidCode: string) {
    await this.enterHexCode(invalidCode);
  }

  async getHexCode(): Promise<string> {
    // Try to get hex code from display
    if (await this.hexCodeDisplay.isVisible({ timeout: 2000 }).catch(() => false)) {
      return await this.hexCodeDisplay.textContent() || '';
    }
    
    // Try to get from input
    if (await this.hexInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      return await this.hexInput.inputValue();
    }
    
    // Try to find any text that looks like a hex code
    const hexText = await this.page.locator('text=/^#[0-9A-Fa-f]{6}$/').first().textContent().catch(() => '');
    return hexText || '';
  }

  async getRgbCode(): Promise<string> {
    if (await this.rgbCodeDisplay.isVisible({ timeout: 2000 }).catch(() => false)) {
      return await this.rgbCodeDisplay.textContent() || '';
    }
    
    const rgbText = await this.page.locator('text=/rgb\\(/i').first().textContent().catch(() => '');
    return rgbText || '';
  }

  async getHslCode(): Promise<string> {
    if (await this.hslCodeDisplay.isVisible({ timeout: 2000 }).catch(() => false)) {
      return await this.hslCodeDisplay.textContent() || '';
    }
    
    const hslText = await this.page.locator('text=/hsl\\(/i').first().textContent().catch(() => '');
    return hslText || '';
  }

  async clickCopyButton(format: 'hex' | 'rgb' | 'hsl' = 'hex') {
    let copyButton: Locator;
    
    if (format === 'hex') {
      copyButton = this.hexCopyButton;
    } else if (format === 'rgb') {
      copyButton = this.rgbCopyButton;
    } else {
      copyButton = this.hslCopyButton;
    }
    
    await copyButton.click();
    await this.page.waitForTimeout(500);
  }

  async getClipboardContent(): Promise<string> {
    // Use Playwright's clipboard API
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
    await this.colorPreview.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getColorPreviewBackground(): Promise<string> {
    // Get the background color of the preview element
    return await this.colorPreview.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
  }

  async verifyErrorMessage() {
    // Check for error message or invalid state
    const errorMessage = this.page.locator('text=/error|invalid/i').first();
    return await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
  }
}
