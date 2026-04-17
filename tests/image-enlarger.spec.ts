import { test, expect } from '@playwright/test';
import path from 'path';
import { HomePage } from '../pages/HomePage';
import { ImageEnlargerPage } from '../pages/ImageEnlargerPage';

test.describe('Image Enlarger Feature Tests', () => {
  let homePage: HomePage;
  let enlargerPage: ImageEnlargerPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    enlargerPage = new ImageEnlargerPage(page);
    await homePage.navigateToHome();
    await enlargerPage.navigateToImageEnlarger();
  });

  // Test Case 1: Successful Image Enlargement
  test('TC01: Successful Image Enlargement', async ({ page }) => {
    // 1. Upload a supported image file (e.g., PNG, JPG, WEBP within 20MB)
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await enlargerPage.uploadImage(imagePath);
    await enlargerPage.verifyUploadSuccess();

    // 2. Observe the "Original" and "New" dimensions displayed
    const originalDimensions = await enlargerPage.getOriginalDimensions();
    expect(originalDimensions).toContain('Original');
    expect(originalDimensions).toContain('×');

    // 3. Adjust the "Scale" slider to a desired enlargement percentage (e.g., 200%)
    await enlargerPage.setScale(200);

    // 4. Verify that the "New" dimensions update according to the scale
    const newDimensions = await enlargerPage.getNewDimensions();
    expect(newDimensions).toContain('New');
    expect(newDimensions).toContain('×');

    // Extract dimensions and verify they are approximately 2x the original
    const originalMatch = originalDimensions.match(/(\d+)\s*×\s*(\d+)/);
    const newMatch = newDimensions.match(/(\d+)\s*×\s*(\d+)/);
    
    if (originalMatch && newMatch) {
      const origWidth = parseInt(originalMatch[1]);
      const origHeight = parseInt(originalMatch[2]);
      const newWidth = parseInt(newMatch[1]);
      const newHeight = parseInt(newMatch[2]);

      // Allow for small rounding differences
      expect(Math.abs(newWidth - origWidth * 2)).toBeLessThan(5);
      expect(Math.abs(newHeight - origHeight * 2)).toBeLessThan(5);
    }

    // 5. Click the "Download PNG" button
    const download = await enlargerPage.clickDownload();

    // 6. Verify that the downloaded image has the correct file extension
    expect(download.suggestedFilename()).toContain('.png');
  });

  // Test Case 2: Enlarging to Maximum Scale
  test('TC02: Enlarging to Maximum Scale', async ({ page }) => {
    // 1. Upload a supported image file
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await enlargerPage.uploadImage(imagePath);
    await enlargerPage.verifyUploadSuccess();

    // 2. Drag the "Scale" slider to its maximum possible value
    // First, get the max attribute of the slider
    const maxScale = await enlargerPage.scaleSlider.getAttribute('max');
    const maxValue = maxScale ? parseInt(maxScale) : 400; // Default to 400 if not found

    await enlargerPage.setScale(maxValue);

    // 3. Verify that the "New" dimensions reflect the maximum enlargement
    const newDimensions = await enlargerPage.getNewDimensions();
    expect(newDimensions).toContain('New');
    expect(newDimensions).toContain('×');

    // 4. Click the "Download PNG" button
    const download = await enlargerPage.clickDownload();

    // 5. Verify that the downloaded image is usable
    expect(download.suggestedFilename()).toContain('.png');
  });

  // Test Case 3: Uploading Unsupported File Type
  test('TC03: Uploading Unsupported File Type', async ({ page }) => {
    // 1. Attempt to upload a file with an unsupported extension (e.g., a PDF)
    const invalidPath = path.resolve(__dirname, '../test-data/valid.pdf');
    
    page.on('dialog', dialog => dialog.accept());
    
    await enlargerPage.uploadImage(invalidPath);

    // 2. Verify that an error message is displayed or the file is not processed
    await enlargerPage.verifyUploadFailure();

    // 3. Verify that the download button is not visible
    await expect(enlargerPage.downloadButton).toBeHidden({ timeout: 3000 });
  });

  // Test Case 4: Uploading File Exceeding Max Size
  test('TC04: Uploading File Exceeding Max Size', async ({ page }) => {
    test.fixme(true, 'Browser file input may block files >20MB at the browser level');

    // 1. Attempt to upload a supported image file that is larger than 20MB
    const largePath = path.resolve(__dirname, '../test-data/too-large.png');
    
    page.on('dialog', dialog => dialog.accept());
    
    await enlargerPage.uploadImage(largePath);

    // 2. Verify that an error message is displayed
    await enlargerPage.verifyUploadFailure();

    // 3. Verify that the image is not processed
    await expect(enlargerPage.downloadButton).toBeHidden({ timeout: 3000 });
  });

  // Test Case 5: "Clear" Functionality in Image Enlarger
  test('TC05: Clear Functionality in Image Enlarger', async ({ page }) => {
    // 1. Upload a supported image file
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await enlargerPage.uploadImage(imagePath);
    await enlargerPage.verifyUploadSuccess();

    // 2. Adjust the "Scale" slider and observe the preview
    await enlargerPage.setScale(250);
    const scale = await enlargerPage.getScale();
    expect(scale).toBe('250');

    // Verify preview is visible
    await enlargerPage.verifyPreviewVisible();

    // 3. Click the "Clear" button
    await enlargerPage.clickClear();

    // 4. Verify that the drag-and-drop area is reset to its initial state
    await enlargerPage.verifyUploadFailure();

    // 5. Verify that the download button is not visible
    await expect(enlargerPage.downloadButton).toBeHidden({ timeout: 3000 });

    // 6. Verify that the preview section is empty or reset
    // The original dimensions text should not be visible
    await expect(enlargerPage.originalDimensionsText).toBeHidden({ timeout: 3000 });
  });
});
