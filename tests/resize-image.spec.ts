import { test, expect } from './fixtures';
import path from 'path';
import { HomePage } from '../pages/HomePage';
import { ResizePage } from '../pages/ResizePage';

test.describe('Resize Image Feature Tests', () => {
  let homePage: HomePage;
  let resizePage: ResizePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    resizePage = new ResizePage(page);
    await homePage.navigateToHome();
    await resizePage.navigateToResize();
  });

  // Test Case 1: Successful Resize with Aspect Ratio Maintained
  test('TC01: Successful Resize with Aspect Ratio Maintained', async ({ page }) => {
    // 1. Upload a supported image file (e.g., a PNG within 20MB)
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await resizePage.uploadImage(imagePath);
    await resizePage.verifyUploadSuccess();

    // 2. Ensure the "Keep aspect" checkbox is checked
    const isChecked = await resizePage.isKeepAspectChecked();
    if (!isChecked) {
      await resizePage.toggleKeepAspect(true);
    }

    // Get original dimensions to calculate expected aspect ratio
    const originalWidth = await resizePage.getWidth();
    const originalHeight = await resizePage.getHeight();
    const aspectRatio = parseFloat(originalWidth) / parseFloat(originalHeight);

    // 3. Change the width input field to a new value (e.g., 800)
    await resizePage.setWidth('800');
    await page.waitForTimeout(500); // Wait for auto-calculation

    // 4. Verify that the height input field automatically updates to maintain the aspect ratio
    const newHeight = await resizePage.getHeight();
    const expectedHeight = Math.round(800 / aspectRatio);
    
    // Allow small rounding differences
    expect(Math.abs(parseFloat(newHeight) - expectedHeight)).toBeLessThan(2);

    // 5. Click the "Download PNG" button
    const download = await resizePage.clickDownload();

    // 6. Verify that the downloaded image has the correct file extension
    expect(download.suggestedFilename()).toContain('.png');
  });

  // Test Case 2: Successful Resize without Aspect Ratio Maintained
  test('TC02: Successful Resize without Aspect Ratio Maintained', async ({ page }) => {
    // 1. Upload a supported image file (e.g., a JPG within 20MB)
    const imagePath = path.resolve(__dirname, '../test-data/valid.jpg');
    await resizePage.uploadImage(imagePath);
    await resizePage.verifyUploadSuccess();

    // 2. Uncheck the "Keep aspect" checkbox
    await resizePage.toggleKeepAspect(false);

    // 3. Change the width input field to a new value (e.g., 500)
    await resizePage.setWidth('500');

    // 4. Change the height input field to a new value (e.g., 1000)
    await resizePage.setHeight('1000');

    // Verify the values are set correctly
    const width = await resizePage.getWidth();
    const height = await resizePage.getHeight();
    expect(width).toBe('500');
    expect(height).toBe('1000');

    // 5. Click the "Download PNG" button
    const download = await resizePage.clickDownload();

    // 6. Verify that the downloaded image has the correct file extension
    expect(download.suggestedFilename()).toContain('.png');
  });

  // Test Case 3: Uploading Unsupported File Type
  test('TC03: Uploading Unsupported File Type', async ({ page }) => {
    // 1. Attempt to upload a file with an unsupported extension (e.g., a PDF)
    const invalidPath = path.resolve(__dirname, '../test-data/valid.pdf');
    
    // Set up dialog handler for potential error alerts
    page.on('dialog', dialog => dialog.accept());
    
    await resizePage.uploadImage(invalidPath);

    // 2. Verify that an error message is displayed or the file is not processed
    // The upload area should remain visible (not replaced by preview)
    await resizePage.verifyUploadFailure();
  });

  // Test Case 4: Uploading File Exceeding Max Size
  test('TC04: Uploading File Exceeding Max Size', async ({ page }) => {
    // Mark as fixme due to browser limitations with large file uploads
    test.fixme(true, 'Browser file input may block files >20MB at the browser level');

    // 1. Attempt to upload a supported image file that is larger than 20MB
    const largePath = path.resolve(__dirname, '../test-data/too-large.png');
    
    page.on('dialog', dialog => dialog.accept());
    
    await resizePage.uploadImage(largePath);

    // 2. Verify that an error message is displayed
    await resizePage.verifyUploadFailure();
  });

  // Test Case 5: "Clear" Functionality
  test('TC05: Clear Functionality', async ({ page }) => {
    // 1. Upload a supported image file
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await resizePage.uploadImage(imagePath);
    await resizePage.verifyUploadSuccess();

    // 2. Verify that the original dimensions are displayed
    const originalDimensions = await resizePage.originalDimensionsText.textContent();
    expect(originalDimensions).toContain('×');

    // 3. Click the "Clear" button
    await resizePage.clickClear();

    // 4. Verify that the drag-and-drop area is reset to its initial state
    await resizePage.verifyUploadFailure();

    // 5. Verify that the download button is not visible
    await expect(resizePage.downloadButton).toBeHidden({ timeout: 3000 });
  });
});
