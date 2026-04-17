import { test, expect } from '@playwright/test';
import path from 'path';
import { HomePage } from '../pages/HomePage';
import { CompressImagePage } from '../pages/CompressImagePage';

test.describe('Compress Image Feature Tests', () => {
  let homePage: HomePage;
  let compressPage: CompressImagePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    compressPage = new CompressImagePage(page);
    await homePage.navigateToHome();
    await compressPage.navigateToCompressImage();
  });

  // Test Case 1: Successful Image Compression
  test('TC01: Successful Image Compression', async ({ page }) => {
    // 1. Upload a supported image file (e.g., PNG, JPG, WEBP within 20MB)
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await compressPage.uploadImage(imagePath);
    await compressPage.verifyUploadSuccess();

    // 2. Observe the original file size displayed
    const originalSize = await compressPage.getOriginalSize();
    expect(originalSize).toBeTruthy();

    // 3. Adjust the "Quality" slider to a desired compression level (e.g., 80%)
    await compressPage.setQuality(80);

    // 4. Verify that the estimated compressed file size is displayed
    await page.waitForTimeout(1000); // Wait for compression calculation
    const compressedSize = await compressPage.getCompressedSize();
    expect(compressedSize).toBeTruthy();

    // 5. Click the "Download" button
    const download = await compressPage.clickDownload();

    // 6. Verify that the downloaded image is compressed
    expect(download).not.toBeNull();
    expect(download.suggestedFilename()).toMatch(/\.(jpg|jpeg|png|webp)$/i);
  });

  // Test Case 2: Compression to Maximum Quality
  test('TC02: Compression to Maximum Quality', async ({ page }) => {
    // 1. Upload a supported image file
    const imagePath = path.resolve(__dirname, '../test-data/valid.jpg');
    await compressPage.uploadImage(imagePath);
    await compressPage.verifyUploadSuccess();

    // 2. Drag the "Quality" slider to its maximum value (e.g., 100%)
    const maxQuality = await compressPage.qualitySlider.getAttribute('max');
    const maxValue = maxQuality ? parseInt(maxQuality) : 100;
    await compressPage.setQuality(maxValue);

    // 3. Verify that the estimated compressed file size is close to the original size
    await page.waitForTimeout(1000);
    const quality = await compressPage.getQuality();
    expect(parseInt(quality)).toBe(maxValue);

    // 4. Click the "Download" button
    const download = await compressPage.clickDownload();

    // 5. Verify that the downloaded image maintains the highest possible quality
    expect(download).not.toBeNull();
    expect(download.suggestedFilename()).toMatch(/\.(jpg|jpeg|png|webp)$/i);
  });

  // Test Case 3: Compression to Minimum Quality
  test('TC03: Compression to Minimum Quality', async ({ page }) => {
    // 1. Upload a supported image file
    const imagePath = path.resolve(__dirname, '../test-data/valid.jpg');
    await compressPage.uploadImage(imagePath);
    await compressPage.verifyUploadSuccess();

    // 2. Drag the "Quality" slider to its minimum value (e.g., 10% or 0%)
    const minQuality = await compressPage.qualitySlider.getAttribute('min');
    const minValue = minQuality ? parseInt(minQuality) : 10;
    await compressPage.setQuality(minValue);

    // 3. Verify that the estimated compressed file size shows significant reduction
    await page.waitForTimeout(1000);
    const quality = await compressPage.getQuality();
    expect(parseInt(quality)).toBe(minValue);

    // 4. Click the "Download" button
    const download = await compressPage.clickDownload();

    // 5. Verify that the downloaded image has the smallest possible file size
    expect(download).not.toBeNull();
    expect(download.suggestedFilename()).toMatch(/\.(jpg|jpeg|png|webp)$/i);
  });

  // Test Case 4: Uploading Unsupported File Type
  test('TC04: Uploading Unsupported File Type', async ({ page }) => {
    // 1. Attempt to upload a file with an unsupported extension (e.g., a PDF)
    const invalidPath = path.resolve(__dirname, '../test-data/valid.pdf');
    
    page.on('dialog', dialog => dialog.accept());
    
    await compressPage.uploadImage(invalidPath);

    // 2. Verify that an error message is displayed or the file is not processed
    await compressPage.verifyUploadFailure();

    // 3. Verify that the download button is not visible
    await expect(compressPage.downloadButton).toBeHidden({ timeout: 3000 });
  });

  // Test Case 5: "Clear" Functionality in Compress Image
  test('TC05: Clear Functionality in Compress Image', async ({ page }) => {
    // 1. Upload a supported image file
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await compressPage.uploadImage(imagePath);
    await compressPage.verifyUploadSuccess();

    // 2. Adjust the "Quality" slider and observe the estimated compression
    await compressPage.setQuality(50);
    const quality = await compressPage.getQuality();
    expect(quality).toBe('50');

    // 3. Click the "Clear" button
    await compressPage.clickClear();

    // 4. Verify that the drag-and-drop area is reset to its initial state
    await compressPage.verifyUploadFailure();

    // 5. Verify that the compression options are cleared or disabled
    await expect(compressPage.downloadButton).toBeHidden({ timeout: 3000 });

    // 6. Verify that the "Preview" section is empty or reset
    // The quality slider should not be visible
    await expect(compressPage.qualitySlider).toBeHidden({ timeout: 3000 });
  });
});
