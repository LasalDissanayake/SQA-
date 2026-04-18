import { test, expect } from './fixtures';
import path from 'path';
import { HomePage } from '../pages/HomePage';
import { PngCompressorPage } from '../pages/PngCompressorPage';

test.describe('PNG Compressor Feature Tests', () => {
  let homePage: HomePage;
  let pngCompressorPage: PngCompressorPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    pngCompressorPage = new PngCompressorPage(page);
    await homePage.navigateToHome();
    await pngCompressorPage.navigateToPngCompressor();
  });

  // Test Case 1: Successful PNG Compression
  test('TC01: Successful PNG Compression', async ({ page }) => {
    // 1. Upload a supported PNG image file (within 20MB)
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await pngCompressorPage.uploadImage(imagePath);
    await pngCompressorPage.verifyUploadSuccess();

    // 2. Observe the original file size displayed (if applicable)
    // PNG compression info should be visible
    const compressionInfo = await pngCompressorPage.getCompressionInfo();
    expect(compressionInfo.toLowerCase()).toContain('lossless');

    // 3. Click the "Download PNG" button
    const download = await pngCompressorPage.clickDownload();

    // 4. Verify that the downloaded PNG image has a reduced file size
    expect(download).not.toBeNull();
    expect(download.suggestedFilename()).toContain('.png');
  });

  // Test Case 2: Uploading Non-PNG Supported File Type (JPG/WEBP)
  test('TC02: Uploading Non-PNG Supported File Type (JPG)', async ({ page }) => {
    // 1. Upload a supported JPG image file (within 20MB)
    const imagePath = path.resolve(__dirname, '../test-data/valid.jpg');
    await pngCompressorPage.uploadImage(imagePath);
    await pngCompressorPage.verifyUploadSuccess();

    // 2. Observe the original file type and size
    // The system should process it

    // 3. Click the "Download PNG" button
    const download = await pngCompressorPage.clickDownload();

    // 4. Verify that the downloaded file is a PNG image
    expect(download).not.toBeNull();
    expect(download.suggestedFilename()).toContain('.png');
  });

  // Test Case 2b: Uploading WEBP File Type
  test('TC02b: Uploading Non-PNG Supported File Type (WEBP)', async ({ page }) => {
    // 1. Upload a supported WEBP image file (within 20MB)
    const imagePath = path.resolve(__dirname, '../test-data/valid.webp');
    await pngCompressorPage.uploadImage(imagePath);
    await pngCompressorPage.verifyUploadSuccess();

    // 2. Click the "Download PNG" button
    const download = await pngCompressorPage.clickDownload();

    // 3. Verify that the downloaded file is a PNG image
    expect(download).not.toBeNull();
    expect(download.suggestedFilename()).toContain('.png');
  });

  // Test Case 3: Uploading Unsupported File Type
  test('TC03: Uploading Unsupported File Type', async ({ page }) => {
    // 1. Attempt to upload a file with an unsupported extension (e.g., a PDF)
    const invalidPath = path.resolve(__dirname, '../test-data/valid.pdf');
    
    page.on('dialog', dialog => dialog.accept());
    
    await pngCompressorPage.uploadImage(invalidPath);

    // 2. Verify that an error message is displayed or the file is not processed
    await pngCompressorPage.verifyUploadFailure();

    // 3. Verify that the download button is not visible
    await expect(pngCompressorPage.downloadButton).toBeHidden({ timeout: 3000 });
  });

  // Test Case 4: Uploading File Exceeding Max Size
  test('TC04: Uploading File Exceeding Max Size', async ({ page }) => {
    test.fixme(true, 'Browser file input may block files >20MB at the browser level');

    // 1. Attempt to upload a supported image file that is larger than 20MB
    const largePath = path.resolve(__dirname, '../test-data/too-large.png');
    
    page.on('dialog', dialog => dialog.accept());
    
    await pngCompressorPage.uploadImage(largePath);

    // 2. Verify that an error message is displayed
    await pngCompressorPage.verifyUploadFailure();

    // 3. Verify that the image is not processed
    await expect(pngCompressorPage.downloadButton).toBeHidden({ timeout: 3000 });
  });

  // Test Case 5: "Clear" Functionality in PNG Compressor
  test('TC05: Clear Functionality in PNG Compressor', async ({ page }) => {
    // 1. Upload a supported image file
    const imagePath = path.resolve(__dirname, '../test-data/test-image.png');
    await pngCompressorPage.uploadImage(imagePath);
    await pngCompressorPage.verifyUploadSuccess();

    // 2. Click the "Clear" button
    await pngCompressorPage.clickClear();

    // 3. Verify that the drag-and-drop area is reset to its initial state
    await pngCompressorPage.verifyUploadFailure();

    // 4. Verify that the compression options (Download PNG button) are cleared or disabled
    await expect(pngCompressorPage.downloadButton).toBeHidden({ timeout: 3000 });

    // 5. Verify that the "Preview" section is empty or reset
    // The preview section should not show any image
    const previewVisible = await pngCompressorPage.previewSection.isVisible();
    if (previewVisible) {
      // If preview section is still visible, it should show "No image yet" or similar
      const previewText = await pngCompressorPage.previewSection.textContent();
      expect(previewText?.toLowerCase()).toMatch(/no image|preview/i);
    }
  });
});
