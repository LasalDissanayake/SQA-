import { test, expect } from '@playwright/test';
import path from 'path';
import { HomePage } from '../pages/HomePage';
import { BulkResizePage } from '../pages/BulkResizePage';

test.describe('Bulk Resize Feature Tests', () => {
  let homePage: HomePage;
  let bulkResizePage: BulkResizePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    bulkResizePage = new BulkResizePage(page);
    await homePage.navigateToHome();
    await bulkResizePage.navigateToBulkResize();
  });

  // Test Case 1: Successful Bulk Resize with Aspect Ratio Maintained
  test('TC01: Successful Bulk Resize with Aspect Ratio Maintained', async ({ page }) => {
    // 1. Upload multiple supported image files
    const imagePaths = [
      path.resolve(__dirname, '../test-data/test-image.png'),
      path.resolve(__dirname, '../test-data/valid.jpg'),
      path.resolve(__dirname, '../test-data/valid.webp')
    ];
    await bulkResizePage.uploadImages(imagePaths);

    // Verify files are uploaded
    const filesUploaded = await bulkResizePage.verifyFilesUploaded(3);
    expect(filesUploaded).toBeTruthy();

    // 2. Ensure the "Keep aspect" checkbox is checked
    const isChecked = await bulkResizePage.isKeepAspectChecked();
    if (!isChecked) {
      await bulkResizePage.toggleKeepAspect(true);
    }

    // 3. Enter a new width value (e.g., 800)
    await bulkResizePage.setWidth('800');
    await page.waitForTimeout(500); // Wait for auto-calculation

    // 4. Verify that the height input field remains empty because 
    // bulk images have variable aspect ratios, meaning height is calculated dynamically per-image on process.
    const height = await bulkResizePage.getHeight();
    expect(height).toBe('');

    // 5. Click the "Process & Download" button
    const download = await bulkResizePage.clickProcessDownload();

    // 6. Verify that images are processed and downloaded
    expect(download).not.toBeNull();
    expect(download.suggestedFilename()).toMatch(/\.(zip|png|jpg|webp)$/i);
  });

  // Test Case 2: Successful Bulk Resize without Aspect Ratio Maintained
  test('TC02: Successful Bulk Resize without Aspect Ratio Maintained', async ({ page }) => {
    // 1. Upload multiple supported image files
    const imagePaths = [
      path.resolve(__dirname, '../test-data/test-image.png'),
      path.resolve(__dirname, '../test-data/valid.jpg')
    ];
    await bulkResizePage.uploadImages(imagePaths);

    const filesUploaded = await bulkResizePage.verifyFilesUploaded(2);
    expect(filesUploaded).toBeTruthy();

    // 2. Uncheck the "Keep aspect" checkbox
    await bulkResizePage.toggleKeepAspect(false);

    // 3. Enter specific width value (e.g., 500)
    await bulkResizePage.setWidth('500');

    // 4. Enter specific height value (e.g., 1000)
    await bulkResizePage.setHeight('1000');

    // Verify the values are set correctly
    const width = await bulkResizePage.getWidth();
    const height = await bulkResizePage.getHeight();
    expect(width).toBe('500');
    expect(height).toBe('1000');

    // 5. Click the "Process & Download" button
    const download = await bulkResizePage.clickProcessDownload();

    // 6. Verify that images are processed and downloaded
    expect(download).not.toBeNull();
  });

  // Test Case 3: Bulk Resize with Mixed File Types
  test('TC03: Bulk Resize with Mixed File Types', async ({ page }) => {
    // 1. Upload multiple images with different supported file types
    const imagePaths = [
      path.resolve(__dirname, '../test-data/test-image.png'),
      path.resolve(__dirname, '../test-data/valid.jpg'),
      path.resolve(__dirname, '../test-data/valid.webp')
    ];
    await bulkResizePage.uploadImages(imagePaths);

    // 2. Ensure all files are within the 20MB size limit (test data should be)
    const filesUploaded = await bulkResizePage.verifyFilesUploaded(3);
    expect(filesUploaded).toBeTruthy();

    // 3. Enter desired width and height dimensions
    await bulkResizePage.setWidth('600');
    await bulkResizePage.setHeight('400');

    // 4. Click the "Process & Download" button
    const download = await bulkResizePage.clickProcessDownload();

    // 5. Verify that all supported file types are processed successfully
    expect(download).not.toBeNull();
  });

  // Test Case 4: Bulk Resize with File Exceeding Size Limit
  test('TC04: Bulk Resize with File Exceeding Size Limit', async ({ page }) => {
    test.fixme(true, 'Browser file input may block files >20MB at the browser level');

    // 1. Upload multiple image files where at least one exceeds the 20MB limit
    const imagePaths = [
      path.resolve(__dirname, '../test-data/test-image.png'),
      path.resolve(__dirname, '../test-data/too-large.png')
    ];

    page.on('dialog', dialog => dialog.accept());
    
    await bulkResizePage.uploadImages(imagePaths);

    // 2. Verify that an error message is displayed
    // The process button should be disabled or an error should appear
    await page.waitForTimeout(2000);
    
    // Check if process button is disabled or error message appears
    const isDisabled = await bulkResizePage.processDownloadButton.isDisabled();
    expect(isDisabled).toBeTruthy();
  });

  // Test Case 5: "Clear" Functionality in Bulk Resize
  test('TC05: Clear Functionality in Bulk Resize', async ({ page }) => {
    // 1. Upload multiple supported image files
    const imagePaths = [
      path.resolve(__dirname, '../test-data/test-image.png'),
      path.resolve(__dirname, '../test-data/valid.jpg')
    ];
    await bulkResizePage.uploadImages(imagePaths);

    // 2. Verify that the files are listed
    const filesUploaded = await bulkResizePage.verifyFilesUploaded(2);
    expect(filesUploaded).toBeTruthy();

    // 3. Enter custom width and height values
    await bulkResizePage.setWidth('800');
    await bulkResizePage.setHeight('600');

    // 4. Click the "Clear" button
    await bulkResizePage.clickClear();

    // 5. Verify that all uploaded files are removed from the list
    await bulkResizePage.verifyUploadFailure();

    // 6. Verify that the width and height input fields are cleared or reset
    const width = await bulkResizePage.getWidth();
    const height = await bulkResizePage.getHeight();
    
    // Fields should be empty or reset to default
    expect(width === '' || width === '0').toBeTruthy();
    expect(height === '' || height === '0').toBeTruthy();
  });
});
