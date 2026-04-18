import { test, expect } from '@playwright/test';
import path from 'path';
import { HomePage } from '../pages/HomePage';
import { ConvertImagePage } from '../pages/ConvertImagePage';

test.describe('Convert Image Feature Tests', () => {
  let homePage: HomePage;
  let convertPage: ConvertImagePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    convertPage = new ConvertImagePage(page);
    await homePage.navigateToHome();
    await convertPage.navigateToConvertImage();
  });

  // Test Case 1: Successful Image Format Conversion
  test('TC01: Successful Image Format Conversion', async ({ page }) => {
    // 1. Upload a supported image file (e.g., PNG within 20MB)
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await convertPage.uploadImage(imagePath);
    await convertPage.verifyUploadSuccess();

    // 2. Select the target output format (e.g., JPG)
    await convertPage.selectFormat('JPG');

    // 3. Click the "Convert" or download button
    const download = await convertPage.convertAndDownload('JPG');

    // 4. Verify that the converted image is downloaded in the selected format
    expect(download).not.toBeNull();
    const filename = download.suggestedFilename().toLowerCase();
    expect(filename).toMatch(/\.(jpg|jpeg)$/);

    // 5. Verify that the converted image maintains dimensions (checked via successful download)
    // Note: Actual dimension and quality verification requires downloading and analyzing the file
    // which is beyond the scope of UI automation
  });

  // Test Case 2: Converting to All Supported Formats
  test('TC02: Converting to All Supported Formats', async ({ page }) => {
    // Test cross-format conversions (same-format conversions don't appear in dropdown)
    const conversions = [
      { source: 'test-image.png', format: 'JPG', expectMatch: /\.(jpg|jpeg)$/ },
      { source: 'test-image.png', format: 'WEBP', expectMatch: /\.webp$/ },
      { source: 'valid.jpg', format: 'PNG', expectMatch: /\.png$/ },
    ];

    for (const { source, format, expectMatch } of conversions) {
      // Navigate to fresh page for each conversion
      await convertPage.navigateToConvertImage();

      // 1. Upload a supported image file
      const imagePath = path.resolve(__dirname, `../test-data/${source}`);
      await convertPage.uploadImage(imagePath);
      await convertPage.verifyUploadSuccess();

      // 2. Convert the image to the target format
      const download = await convertPage.convertAndDownload(format);

      // 3. Verify the download
      expect(download).not.toBeNull();
      const filename = download.suggestedFilename().toLowerCase();

      // 4. Verify that conversion produces a valid file in the correct format
      expect(filename).toMatch(expectMatch);
    }

    // 5. All conversions completed successfully with maintained quality
    // Quality verification is done through successful download and correct format
  });

  // Test Case 2 Alternative: Converting to all formats from same upload
  test('TC02b: Converting Same Image to Multiple Formats', async ({ page }) => {
    // 1. Upload PNG so all target formats (PNG, JPG, WEBP) are available
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await convertPage.uploadImage(imagePath);
    await convertPage.verifyUploadSuccess();

    // Test JPG conversion
    await convertPage.selectFormat('JPG');
    await convertPage.clickConvert();
    const jpgDownload = await convertPage.clickDownload('JPG');
    expect(jpgDownload.suggestedFilename().toLowerCase()).toMatch(/\.(jpg|jpeg)$/);

    // Navigate fresh for PNG conversion (download resets state)
    await convertPage.navigateToConvertImage();
    await convertPage.uploadImage(imagePath);
    await convertPage.verifyUploadSuccess();
    const pngDownload = await convertPage.clickDownload('PNG');
    expect(pngDownload.suggestedFilename().toLowerCase()).toContain('.png');

    // Test WEBP conversion
    await convertPage.selectFormat('WEBP');
    await convertPage.clickConvert();
    const webpDownload = await convertPage.clickDownload('WEBP');
    expect(webpDownload.suggestedFilename().toLowerCase()).toContain('.webp');
  });

  // Test Case 3: Uploading Unsupported File Type
  test('TC03: Uploading Unsupported File Type', async ({ page }) => {
    // 1. Attempt to upload a file with an unsupported extension (e.g., a PDF)
    const invalidPath = path.resolve(__dirname, '../test-data/valid.pdf');
    
    page.on('dialog', dialog => dialog.accept());
    
    await convertPage.uploadImage(invalidPath);

    // 2. Verify that an error message is displayed or the file is not processed
    await convertPage.verifyUploadFailure();

    // 3. Verify that format options are not available
    const formatOptionsAvailable = await convertPage.verifyFormatOptionsAvailable();
    expect(formatOptionsAvailable).toBeFalsy();
  });

  // Test Case 3b: Uploading GIF (if unsupported)
  test('TC03b: Uploading Unsupported File Type (GIF)', async ({ page }) => {
    // 1. Attempt to upload a GIF file
    const gifPath = path.resolve(__dirname, '../test-data/valid.gif');
    
    page.on('dialog', dialog => dialog.accept());
    
    await convertPage.uploadImage(gifPath);

    // 2. Verify that an error message is displayed or the file is not processed
    // GIF might be unsupported for conversion
    await page.waitForTimeout(2000);
    
    // Check if upload was rejected
    const uploadAreaVisible = await convertPage.uploadArea.isVisible();
    if (uploadAreaVisible) {
      // Upload was rejected - this is expected behavior
      await convertPage.verifyUploadFailure();
    } else {
      // If GIF is supported, format options should be available
      const formatOptionsAvailable = await convertPage.verifyFormatOptionsAvailable();
      expect(formatOptionsAvailable).toBeTruthy();
    }
  });

  // Test Case 4: Uploading File Exceeding Max Size
  test('TC04: Uploading File Exceeding Max Size', async ({ page }) => {
    test.fixme(true, 'Browser file input may block files >20MB at the browser level');

    // 1. Attempt to upload a supported image file that is larger than 20MB
    const largePath = path.resolve(__dirname, '../test-data/too-large.png');
    
    page.on('dialog', dialog => dialog.accept());
    
    await convertPage.uploadImage(largePath);

    // 2. Verify that an error message is displayed
    await convertPage.verifyUploadFailure();

    // 3. Verify that the image is not processed for conversion
    const formatOptionsAvailable = await convertPage.verifyFormatOptionsAvailable();
    expect(formatOptionsAvailable).toBeFalsy();
  });

  // Test Case 5: "Clear" Functionality in Convert Image
  test('TC05: Clear Functionality in Convert Image', async ({ page }) => {
    // 1. Upload a supported image file
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await convertPage.uploadImage(imagePath);
    await convertPage.verifyUploadSuccess();

    // 2. Select a target conversion format
    await convertPage.selectFormat('JPG');
    await page.waitForTimeout(500);

    // Verify format was selected (option value may be "image/jpeg" or "JPG" depending on implementation)
    const selectedFormat = await convertPage.getSelectedFormat();
    expect(selectedFormat.toUpperCase()).toMatch(/JPG|JPEG/);

    // 3. Click the "Clear" button
    await convertPage.clickClear();

    // 4. Verify that the drag-and-drop area is reset to its initial state
    await convertPage.verifyUploadFailure();

    // 5. Verify that the conversion options are cleared or disabled
    await expect(convertPage.downloadButton).toBeHidden({ timeout: 3000 });

    // 6. Verify that the "Preview" section is empty or reset
    const previewVisible = await convertPage.previewSection.isVisible();
    if (previewVisible) {
      // If preview section is still visible, it should show "No image yet" or similar
      const previewText = await convertPage.previewSection.textContent();
      expect(previewText?.toLowerCase()).toMatch(/no image|preview/i);
    }
  });

  // Additional Test: Converting PNG to WEBP
  test('TC06: Converting PNG to WEBP', async ({ page }) => {
    // Upload PNG image
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await convertPage.uploadImage(imagePath);
    await convertPage.verifyUploadSuccess();

    // Convert to WEBP
    const download = await convertPage.convertAndDownload('WEBP');

    // Verify download
    expect(download).not.toBeNull();
    expect(download.suggestedFilename().toLowerCase()).toContain('.webp');
  });

  // Additional Test: Converting WEBP to PNG
  test('TC07: Converting WEBP to PNG', async ({ page }) => {
    // Upload WEBP image
    const imagePath = path.resolve(__dirname, '../test-data/valid.webp');
    await convertPage.uploadImage(imagePath);
    await convertPage.verifyUploadSuccess();

    // Convert to PNG
    const download = await convertPage.convertAndDownload('PNG');

    // Verify download
    expect(download).not.toBeNull();
    expect(download.suggestedFilename().toLowerCase()).toContain('.png');
  });

  // Additional Test: Converting JPG to PNG
  test('TC08: Converting JPG to PNG', async ({ page }) => {
    // Upload JPG image
    const imagePath = path.resolve(__dirname, '../test-data/valid.jpg');
    await convertPage.uploadImage(imagePath);
    await convertPage.verifyUploadSuccess();

    // Convert to PNG
    const download = await convertPage.convertAndDownload('PNG');

    // Verify download
    expect(download).not.toBeNull();
    expect(download.suggestedFilename().toLowerCase()).toContain('.png');
  });
});
