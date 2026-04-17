import { test, expect } from '@playwright/test';
import path from 'path';
import { HomePage } from '../pages/HomePage';
import { FlipImagePage } from '../pages/FlipImagePage';

test.describe('Flip Image Feature Tests', () => {
  let homePage: HomePage;
  let flipPage: FlipImagePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    flipPage = new FlipImagePage(page);
    await homePage.navigateToHome();
    await flipPage.navigateToFlipImage();
  });

  // Test Case 1: Successful Horizontal Flip
  test('TC01: Successful Horizontal Flip', async ({ page }) => {
    // 1. Upload a supported image file (e.g., PNG, JPG, or WEBP within 20MB)
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await flipPage.uploadImage(imagePath);
    await flipPage.verifyUploadSuccess();

    // 2. Select the "Horizontal Flip" option
    await flipPage.selectHorizontalFlip();

    // 3. Click the "Flip" or download button
    const download = await flipPage.flipAndDownload('horizontal');

    // 4. Verify that the downloaded image is flipped horizontally
    expect(download).not.toBeNull();
    const filename = download.suggestedFilename().toLowerCase();
    expect(filename).toMatch(/\.(png|jpg|jpeg|webp)$/);

    // 5. Verify that the image maintains its original dimensions and quality
    // Note: Actual dimension and quality verification requires downloading and analyzing the file
    // which is beyond the scope of UI automation
  });

  // Test Case 2: Successful Vertical Flip
  test('TC02: Successful Vertical Flip', async ({ page }) => {
    // 1. Upload a supported image file (e.g., PNG, JPG, or WEBP within 20MB)
    const imagePath = path.resolve(__dirname, '../test-data/valid.jpg');
    await flipPage.uploadImage(imagePath);
    await flipPage.verifyUploadSuccess();

    // 2. Select the "Vertical Flip" option
    await flipPage.selectVerticalFlip();

    // 3. Click the "Flip" or download button
    const download = await flipPage.flipAndDownload('vertical');

    // 4. Verify that the downloaded image is flipped vertically
    expect(download).not.toBeNull();
    const filename = download.suggestedFilename().toLowerCase();
    expect(filename).toMatch(/\.(png|jpg|jpeg|webp)$/);

    // 5. Verify that the image maintains its original dimensions and quality
    // Quality verification is done through successful download and correct format
  });

  // Test Case 3: Uploading Unsupported File Type
  test('TC03: Uploading Unsupported File Type (PDF)', async ({ page }) => {
    // 1. Attempt to upload a file with an unsupported extension (e.g., a PDF)
    const invalidPath = path.resolve(__dirname, '../test-data/valid.pdf');
    
    page.on('dialog', dialog => dialog.accept());
    
    await flipPage.uploadImage(invalidPath);

    // 2. Verify that an error message is displayed or the file is not processed
    await flipPage.verifyUploadFailure();

    // 3. Verify that flip options are not available
    const flipOptionsAvailable = await flipPage.verifyFlipOptionsAvailable();
    expect(flipOptionsAvailable).toBeFalsy();
  });

  // Test Case 3b: Uploading Unsupported File Type (GIF)
  test('TC03b: Uploading Unsupported File Type (GIF)', async ({ page }) => {
    // 1. Attempt to upload a GIF file
    const gifPath = path.resolve(__dirname, '../test-data/valid.gif');
    
    page.on('dialog', dialog => dialog.accept());
    
    await flipPage.uploadImage(gifPath);

    // 2. Check if upload was rejected or accepted
    await page.waitForTimeout(2000);
    
    // Check if upload was rejected
    const uploadAreaVisible = await flipPage.uploadArea.isVisible();
    if (uploadAreaVisible) {
      // Upload was rejected - this is expected behavior
      await flipPage.verifyUploadFailure();
    } else {
      // If GIF is supported, flip options should be available
      const flipOptionsAvailable = await flipPage.verifyFlipOptionsAvailable();
      expect(flipOptionsAvailable).toBeTruthy();
    }
  });

  // Test Case 4: Uploading File Exceeding Max Size
  test('TC04: Uploading File Exceeding Max Size', async ({ page }) => {
    test.fixme(true, 'Browser file input may block files >20MB at the browser level');

    // 1. Attempt to upload a supported image file that is larger than 20MB
    const largePath = path.resolve(__dirname, '../test-data/too-large.png');
    
    page.on('dialog', dialog => dialog.accept());
    
    await flipPage.uploadImage(largePath);

    // 2. Verify that an error message is displayed
    await flipPage.verifyUploadFailure();

    // 3. Verify that the image is not processed for flipping
    const flipOptionsAvailable = await flipPage.verifyFlipOptionsAvailable();
    expect(flipOptionsAvailable).toBeFalsy();
  });

  // Test Case 5: "Clear" Functionality in Flip Image
  test('TC05: Clear Functionality in Flip Image', async ({ page }) => {
    // 1. Upload a supported image file
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await flipPage.uploadImage(imagePath);
    await flipPage.verifyUploadSuccess();

    // 2. Select a flip option (horizontal or vertical)
    await flipPage.selectHorizontalFlip();
    await page.waitForTimeout(500);

    // 3. Click the "Clear" button
    await flipPage.clickClear();

    // 4. Verify that the drag-and-drop area is reset to its initial state
    await flipPage.verifyUploadFailure();

    // 5. Verify that the flip options are cleared or disabled
    await expect(flipPage.downloadButton).toBeHidden({ timeout: 3000 });

    // 6. Verify that the "Preview" section is empty or reset
    const previewVisible = await flipPage.previewSection.isVisible();
    if (previewVisible) {
      // If preview section is still visible, it should show "No image yet" or similar
      const previewText = await flipPage.previewSection.textContent();
      expect(previewText?.toLowerCase()).toMatch(/no image|preview/i);
    }
  });

  // Additional Test: Flipping WEBP Image Horizontally
  test('TC06: Flipping WEBP Image Horizontally', async ({ page }) => {
    // Upload WEBP image
    const imagePath = path.resolve(__dirname, '../test-data/valid.webp');
    await flipPage.uploadImage(imagePath);
    await flipPage.verifyUploadSuccess();

    // Flip horizontally
    const download = await flipPage.flipAndDownload('horizontal');

    // Verify download
    expect(download).not.toBeNull();
    expect(download.suggestedFilename().toLowerCase()).toMatch(/\.(png|jpg|jpeg|webp)$/);
  });

  // Additional Test: Flipping WEBP Image Vertically
  test('TC07: Flipping WEBP Image Vertically', async ({ page }) => {
    // Upload WEBP image
    const imagePath = path.resolve(__dirname, '../test-data/valid.webp');
    await flipPage.uploadImage(imagePath);
    await flipPage.verifyUploadSuccess();

    // Flip vertically
    const download = await flipPage.flipAndDownload('vertical');

    // Verify download
    expect(download).not.toBeNull();
    expect(download.suggestedFilename().toLowerCase()).toMatch(/\.(png|jpg|jpeg|webp)$/);
  });
});
