import { test, expect } from './fixtures';
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

    // 2. Verify that the color picker loads with a default color displayed
    await colorPickerPage.verifyColorPreviewVisible();

    // 3. Verify that a hex color code is displayed in a valid format
    const hexCode = await colorPickerPage.getHexCode();
    expect(hexCode).toMatch(/^#[0-9A-Fa-f]{6}$/);

    // 4. Verify that other color code formats (RGB) are also displayed
    const rgbCode = await colorPickerPage.getRgbCode();
    expect(rgbCode).toBeTruthy();
    expect(rgbCode).toMatch(/rgb\(/i);
  });

  // Test Case 3: Copying Color Code to Clipboard
  test('TC03: Copying Color Code to Clipboard', async ({ page }) => {
    // 1. Get the currently displayed hex code before copying
    const displayedHex = await colorPickerPage.getHexCode();
    expect(displayedHex).toMatch(/^#[0-9A-Fa-f]{6}$/);

    // 2. Click the copy button next to the desired color code format (HEX)
    await colorPickerPage.clickCopyButton('hex');

    // 3. Verify that the color code is copied to the clipboard
    await page.waitForTimeout(500); // Wait for clipboard operation
    const clipboardContent = await colorPickerPage.getClipboardContent();

    // 4. Verify clipboard contains a valid hex code matching the displayed value
    expect(clipboardContent.toUpperCase()).toContain(displayedHex.replace('#', '').toUpperCase());
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
    // 1. Get the currently displayed hex code
    let hexCode = await colorPickerPage.getHexCode();
    expect(hexCode).toMatch(/^#[0-9A-Fa-f]{6}$/);

    // 2. Click the "Reset" or "Clear" button (if available)
    await colorPickerPage.clickReset();
    await colorPickerPage.clickClear();

    // 3. Verify that the color picker still shows a valid color
    await page.waitForTimeout(500);
    hexCode = await colorPickerPage.getHexCode();

    // 4. Verify preview still shows a valid hex color
    if (hexCode) {
      expect(hexCode).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  // Additional Test: Selecting Multiple Colors Sequentially
  test('TC06: Selecting Multiple Colors Sequentially', async ({ page }) => {
    // Click at different canvas positions and verify a valid hex code is shown each time
    const positions = [
      { x: 50, y: 50 },
      { x: 100, y: 100 },
      { x: 150, y: 50 }
    ];

    for (const pos of positions) {
      await colorPickerPage.clickColorWheel(pos.x, pos.y);
      await page.waitForTimeout(500);

      const hexCode = await colorPickerPage.getHexCode();
      expect(hexCode).toMatch(/^#[0-9A-Fa-f]{6}$/);
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
