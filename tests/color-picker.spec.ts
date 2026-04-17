import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ColorPickerPage } from '../pages/ColorPickerPage';

test.describe('Color Picker Feature Tests', () => {
  let homePage: HomePage;
  let colorPickerPage: ColorPickerPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    colorPickerPage = new ColorPickerPage(page);
    await homePage.navigateToHome();
    await colorPickerPage.navigateToColorPicker();
    
    // Grant clipboard permissions for copy tests
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  });

  // Test Case 1: Successful Color Selection via Color Wheel
  test('TC01: Successful Color Selection via Color Wheel', async ({ page }) => {
    // 1. Open the Color Picker feature (done in beforeEach)
    
    // 2. Click or drag on the color wheel to select a color
    await colorPickerPage.clickColorWheelCenter();

    // 3. Verify that the selected color is displayed in the preview
    await colorPickerPage.verifyColorPreviewVisible();

    // 4. Verify that the color code (HEX, RGB, etc.) is updated accordingly
    const hexCode = await colorPickerPage.getHexCode();
    expect(hexCode).toMatch(/^#[0-9A-Fa-f]{6}$/);

    const rgbCode = await colorPickerPage.getRgbCode();
    expect(rgbCode).toMatch(/rgb\(/i);
  });

  // Test Case 2: Successful Color Selection via Input Field
  test('TC02: Successful Color Selection via Input Field', async ({ page }) => {
    // 1. Open the Color Picker feature (done in beforeEach)
    
    // 2. Enter a valid color code (e.g., HEX code like #FF5733) in the input field
    const testHexCode = '#FF5733';
    await colorPickerPage.enterHexCode(testHexCode);

    // 3. Verify that the selected color is displayed in the preview
    await colorPickerPage.verifyColorPreviewVisible();

    // 4. Verify that other color code formats (RGB, HSL) are updated accordingly
    const hexCode = await colorPickerPage.getHexCode();
    expect(hexCode.toUpperCase()).toContain('FF5733');

    const rgbCode = await colorPickerPage.getRgbCode();
    expect(rgbCode).toBeTruthy();
    expect(rgbCode).toMatch(/rgb\(/i);
  });

  // Test Case 3: Copying Color Code to Clipboard
  test('TC03: Copying Color Code to Clipboard', async ({ page }) => {
    // 1. Select a color using the color wheel or input field
    const testHexCode = '#00FF00';
    await colorPickerPage.enterHexCode(testHexCode);

    // 2. Click the copy button next to the desired color code format (HEX)
    await colorPickerPage.clickCopyButton('hex');

    // 3. Verify that the color code is copied to the clipboard
    await page.waitForTimeout(500); // Wait for clipboard operation
    const clipboardContent = await colorPickerPage.getClipboardContent();

    // 4. Verify it matches the selected color
    expect(clipboardContent.toUpperCase()).toContain('00FF00');
  });

  // Test Case 3b: Copying RGB Color Code to Clipboard
  test('TC03b: Copying RGB Color Code to Clipboard', async ({ page }) => {
    // 1. Select a color
    await colorPickerPage.enterHexCode('#FF0000');

    // 2. Click the copy button for RGB format
    await colorPickerPage.clickCopyButton('rgb');

    // 3. Verify that the RGB code is copied to the clipboard
    await page.waitForTimeout(500);
    const clipboardContent = await colorPickerPage.getClipboardContent();

    // 4. Verify it contains RGB format
    expect(clipboardContent.toLowerCase()).toMatch(/rgb/);
  });

  // Test Case 4: Invalid Color Code Input
  test('TC04: Invalid Color Code Input', async ({ page }) => {
    // 1. Open the Color Picker feature (done in beforeEach)
    
    // 2. Enter an invalid color code (e.g., "ZZZZZZ" or an incorrect format)
    await colorPickerPage.enterInvalidHexCode('ZZZZZZ');

    // 3. Verify that an error message is displayed or the input is rejected
    await page.waitForTimeout(1000);
    
    // Check if error message is displayed
    const hasError = await colorPickerPage.verifyErrorMessage();
    
    // OR verify that the hex code was not updated to the invalid value
    const hexCode = await colorPickerPage.getHexCode();
    expect(hexCode.toUpperCase()).not.toContain('ZZZZZZ');

    // 4. Verify that the preview and other color codes are not updated
    // The color should remain at default or previous valid value
  });

  // Test Case 4b: Invalid Color Code Format
  test('TC04b: Invalid Color Code Format', async ({ page }) => {
    // Enter invalid format (missing #, wrong length, etc.)
    await colorPickerPage.enterInvalidHexCode('12345'); // Too short

    await page.waitForTimeout(1000);
    
    // Verify the input was rejected or corrected
    const hexCode = await colorPickerPage.getHexCode();
    
    // Should either show error or maintain valid format
    if (hexCode) {
      expect(hexCode).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  // Test Case 5: Reset/Clear Color Selection
  test('TC05: Reset/Clear Color Selection', async ({ page }) => {
    // 1. Select a color using the color wheel or input field
    await colorPickerPage.enterHexCode('#FF5733');
    await page.waitForTimeout(500);

    // Verify color was selected
    let hexCode = await colorPickerPage.getHexCode();
    expect(hexCode.toUpperCase()).toContain('FF5733');

    // 2. Click the "Reset" or "Clear" button (if available)
    await colorPickerPage.clickReset();
    await colorPickerPage.clickClear();

    // 3. Verify that the color selection is reset to a default value
    await page.waitForTimeout(500);
    hexCode = await colorPickerPage.getHexCode();

    // 4. Verify that the preview and color codes are updated to the default state
    // Default is typically #000000 (black) or #FFFFFF (white)
    if (hexCode) {
      expect(hexCode).toMatch(/^#[0-9A-Fa-f]{6}$/);
      // Should be different from the previously selected color
      expect(hexCode.toUpperCase()).not.toContain('FF5733');
    }
  });

  // Additional Test: Selecting Multiple Colors Sequentially
  test('TC06: Selecting Multiple Colors Sequentially', async ({ page }) => {
    const colors = ['#FF0000', '#00FF00', '#0000FF'];

    for (const color of colors) {
      await colorPickerPage.enterHexCode(color);
      await page.waitForTimeout(500);

      const hexCode = await colorPickerPage.getHexCode();
      expect(hexCode.toUpperCase()).toContain(color.substring(1));
    }
  });

  // Additional Test: Color Wheel Click at Different Positions
  test('TC07: Color Wheel Click at Different Positions', async ({ page }) => {
    // Click at different positions on the color wheel
    const positions = [
      { x: 50, y: 50 },
      { x: 100, y: 100 },
      { x: 150, y: 50 }
    ];

    for (const pos of positions) {
      await colorPickerPage.clickColorWheel(pos.x, pos.y);
      await page.waitForTimeout(500);

      // Verify color code is updated
      const hexCode = await colorPickerPage.getHexCode();
      expect(hexCode).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
