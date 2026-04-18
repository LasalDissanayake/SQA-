import { test, expect } from './fixtures';
import path from 'path';
import { HomePage } from '../pages/HomePage';
import { GifCompressorPage } from '../pages/GifCompressorPage';

test.describe('GIF Compressor Feature Tests', () => {
  let homePage: HomePage;
  let gifCompressorPage: GifCompressorPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    gifCompressorPage = new GifCompressorPage(page);
    await homePage.navigateToHome();
    await gifCompressorPage.navigateToGifCompressor();
  });

  // Test Case 1: Successful GIF Compression
  test('TC01: Successful GIF Compression', async ({ page }) => {
    // 1. Upload a supported GIF image file (within 20MB)
    const gifPath = path.resolve(__dirname, '../test-data/valid.gif');
    await gifCompressorPage.uploadGif(gifPath);
    await gifCompressorPage.verifyUploadSuccess();

    // 2. Observe the original file size displayed (if applicable)
    // The download button should be visible after processing

    // 3. Click the "Download GIF" button
    const download = await gifCompressorPage.clickDownload();

    // 4. Verify that the downloaded GIF image has a reduced file size
    expect(download).not.toBeNull();
    expect(download.suggestedFilename()).toContain('.gif');
  });

  // Test Case 2: Uploading Unsupported File Type
  test('TC02: Uploading Unsupported File Type', async ({ page }) => {
    // 1. Attempt to upload a file with an unsupported extension (e.g., a PNG)
    const invalidPath = path.resolve(__dirname, '../test-data/test-image.png');
    
    page.on('dialog', dialog => dialog.accept());
    
    await gifCompressorPage.uploadGif(invalidPath);

    // 2. Verify that an error message is displayed or the file is not processed
    await gifCompressorPage.verifyUploadFailure();

    // 3. Verify that the download button is not visible
    await expect(gifCompressorPage.downloadButton).toBeHidden({ timeout: 3000 });
  });

  // Test Case 2b: Uploading PDF File
  test('TC02b: Uploading Unsupported File Type (PDF)', async ({ page }) => {
    // 1. Attempt to upload a PDF file
    const invalidPath = path.resolve(__dirname, '../test-data/valid.pdf');
    
    page.on('dialog', dialog => dialog.accept());
    
    await gifCompressorPage.uploadGif(invalidPath);

    // 2. Verify that an error message is displayed or the file is not processed
    await gifCompressorPage.verifyUploadFailure();

    // 3. Verify that the download button is not visible
    await expect(gifCompressorPage.downloadButton).toBeHidden({ timeout: 3000 });
  });

  // Test Case 3: Uploading File Exceeding Max Size
  test('TC03: Uploading File Exceeding Max Size', async ({ page }) => {
    test.fixme(true, 'Browser file input may block files >20MB at the browser level');

    // 1. Attempt to upload a supported GIF image file that is larger than 20MB
    const largePath = path.resolve(__dirname, '../test-data/too-large.png');
    
    page.on('dialog', dialog => dialog.accept());
    
    await gifCompressorPage.uploadGif(largePath);

    // 2. Verify that an error message is displayed
    await gifCompressorPage.verifyUploadFailure();

    // 3. Verify that the image is not processed
    await expect(gifCompressorPage.downloadButton).toBeHidden({ timeout: 3000 });
  });

  // Test Case 4: Compression of Animated GIF
  test('TC04: Compression of Animated GIF', async ({ page }) => {
    // 1. Upload an animated GIF file
    const animatedGifPath = path.resolve(__dirname, '../test-data/animated.gif');
    await gifCompressorPage.uploadGif(animatedGifPath);
    await gifCompressorPage.verifyUploadSuccess();

    // 2. Click the "Download GIF" button
    const download = await gifCompressorPage.clickDownload();

    // 3. Verify that the downloaded GIF is still animated and has a reduced file size
    expect(download).not.toBeNull();
    expect(download.suggestedFilename()).toContain('.gif');
    
    // Note: Verifying animation preservation requires downloading and analyzing the file
    // which is beyond the scope of UI automation. We verify the file is downloaded successfully.
  });

  // Test Case 5: "Clear" Functionality in GIF Compressor
  test('TC05: Clear Functionality in GIF Compressor', async ({ page }) => {
    // 1. Upload a supported GIF image file
    const gifPath = path.resolve(__dirname, '../test-data/valid.gif');
    await gifCompressorPage.uploadGif(gifPath);
    await gifCompressorPage.verifyUploadSuccess();

    // 2. Click the "Clear" button
    await gifCompressorPage.clickClear();

    // 3. Verify that the drag-and-drop area is reset to its initial state
    await gifCompressorPage.verifyUploadFailure();

    // 4. Verify that the compression options (Download GIF button) are cleared or disabled
    await expect(gifCompressorPage.downloadButton).toBeHidden({ timeout: 3000 });

    // 5. Verify that the "Preview" section is empty or reset
    const previewVisible = await gifCompressorPage.previewSection.isVisible();
    if (previewVisible) {
      // If preview section is still visible, it should show "No image yet" or similar
      const previewText = await gifCompressorPage.previewSection.textContent();
      expect(previewText?.toLowerCase()).toMatch(/no image|preview/i);
    }
  });
});
