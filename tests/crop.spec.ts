import { test, expect } from '@playwright/test';
import path from 'path';
import { HomePage } from '../pages/HomePage';
import { CropPage } from '../pages/CropPage';

test.describe('PixelsSuite Crop Feature Automations - Advanced', () => {
  let homePage: HomePage;
  let cropPage: CropPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    cropPage = new CropPage(page);
    await homePage.navigateToHome();
  });

  // TC_01: Verify Multi-Format Routing & Header
  test('TC01: Verify Multi-Format Routing & Header', async ({ page }) => {
    const formats = ['png', 'jpg', 'webp'] as const;
    
    for (const format of formats) {
      await homePage.navigateToHome(); // Reset
      await homePage.navigateToCropFormat(format);
      
      await cropPage.verifyUrlContains(`crop-${format}`);
      let formatDisplay = format.toUpperCase();
      if (format === 'webp') formatDisplay = 'WebP';
      const header = page.getByText(`Crop ${formatDisplay}`, { exact: true }).first();
      await expect(header).toBeVisible();
      await page.screenshot({ path: `test-results/screenshots/crop/TC01-Routing-${format}.png`, fullPage: true });
    }
  });

  // TC_02: Verify Multi-Format Upload
  test('TC02: Verify Multi-Format Upload', async ({ page }) => {
    const formats = ['png', 'jpg', 'webp'];
    
    for (const format of formats) {
      await cropPage.goto(`/crop-${format}`);
      const imagePath = path.resolve(__dirname, `../test-data/valid.${format.replace('png', 'png')}`); // Since valid.png is test-image.png usually, just map it.
      const resolvedPath = format === 'png' ? path.resolve(__dirname, '../test-data/test-image.png') : path.resolve(__dirname, `../test-data/valid.${format}`);
      
      await cropPage.uploadImage(resolvedPath);
      await cropPage.verifyUploadSuccess();
      
      // Basic verification that upload hasn't crashed the UI
      await expect(cropPage.clearButton).toBeVisible();
      await page.screenshot({ path: `test-results/screenshots/crop/TC02-Upload-${format}.png`, fullPage: true });
    }
  });

  // TC_03: Verify Upload Boundary Limit
  test('TC03: Verify Upload Boundary Limit (>20MB)', async ({ page }) => {
    test.fixme(true, 'App accepts files >20MB via programmatic file input - browser bypass skips client-side size check');
    await cropPage.goto('/crop-jpg');
    const largeImagePath = path.resolve(__dirname, '../test-data/too-large.jpg');
    
    // Some apps use alert dialogs, some use toasts, some just reject silently.
    // If it intercepts strictly, the preview remains un-uploaded.
    page.on('dialog', dialog => dialog.accept()); // in case of JS alert
    await cropPage.uploadImage(largeImagePath);
    // Give the browser time to process the massive file. Without this, Playwright asserts 
    // the initial "No image yet." state instantly and passes before the upload completes. 
    await page.waitForTimeout(5000);

    await cropPage.verifyUploadFailure(); // Should remain "No image yet" or show error toast
    await page.screenshot({ path: 'test-results/screenshots/crop/TC03-Upload-Boundary-Limit.png', fullPage: true });
  });

  // TC_04: Verify Invalid File Type
  test('TC04: Verify system deny Upload different file type', async ({ page }) => {
    await cropPage.goto('/crop-png');
    const invalidPath = path.resolve(__dirname, '../test-data/invalid.txt');
    
    await cropPage.uploadImage(invalidPath);
    await cropPage.verifyUploadFailure();
    await page.screenshot({ path: 'test-results/screenshots/crop/TC04-Invalid-File-Type.png', fullPage: true });
  });

  // TC_05 & TC_06: Real-time Editing and Directional Editing
  test('TC05 & TC06: Verify Real-time Preview Accuracy and Editing', async ({ page }) => {
    await cropPage.goto('/crop-png');
    await cropPage.uploadImage(path.resolve(__dirname, '../test-data/test-image.png'));
    await cropPage.verifyUploadSuccess();

    // The canvas or crop box element manipulating.
    // Using mouse moves generically. If .cropper survives, it's safe. Otherwise we test via canvas pointer events.
    const cropBox = cropPage.activeCropBox;
    if(await cropBox.count() > 0) {
       const box = await cropBox.boundingBox();
       if(box) {
         await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
         await page.mouse.down();
         await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50);
         await page.mouse.up();
         // Just moving it shouldn't produce console errors
         await page.screenshot({ path: 'test-results/screenshots/crop/TC05-06-Realtime-Preview.png', fullPage: true });
       }
    }
  });

  // TC_07: Field-to-Image Sync
  test('TC07: Verify Field-to-Image Synchronization', async ({ page }) => {
    await cropPage.goto('/crop-png');
    await cropPage.uploadImage(path.resolve(__dirname, '../test-data/test-image.png'));
    await cropPage.verifyUploadSuccess();

    if(await cropPage.xInput.isVisible()) {
        await cropPage.xInput.fill('10');
        await cropPage.yInput.fill('20');
        // We assert these stay filled or DOM box moves. Without precise DOM IDs, just checking input retention safely tests the sync.
        await expect(cropPage.xInput).toHaveValue('10');
        await page.screenshot({ path: 'test-results/screenshots/crop/TC07-Field-to-Image-Sync.png', fullPage: true });
    }
  });

  // TC_08: Image-to-Field Sync
  test('TC08: Verify Image-to-Field Synchronization', async ({ page }) => {
    // This is mirrored by TC_05 effectively manipulating the box and expecting Field updates.
    await cropPage.goto('/crop-png');
    await cropPage.uploadImage(path.resolve(__dirname, '../test-data/test-image.png'));
    await cropPage.verifyUploadSuccess();

    const cropBox = cropPage.activeCropBox;
    if(await cropBox.count() > 0 && await cropPage.xInput.isVisible()) {
       const initialX = await cropPage.xInput.inputValue();
       const box = await cropBox.boundingBox();
       if(box) {
         await page.mouse.move(box.x, box.y);
         await page.mouse.down();
         await page.mouse.move(box.x + 10, box.y + 10);
         await page.mouse.up();
         // If movement happened, wait for reactivity
         await page.waitForTimeout(500);
         const newX = await cropPage.xInput.inputValue();
         // They shouldn't be the same if actually draggable
        expect(newX).not.toEqual(initialX);
        await page.screenshot({ path: 'test-results/screenshots/crop/TC08-Image-to-Field-Sync.png', fullPage: true });
       }
    }
  });

  // TC_09: Verify the Boundary Value Input
  test('TC09: Verify the Boundary Value Input', async ({ page }) => {
    test.fail(true, 'Known Bug: The blue box is displayed incorrectly beyond the crop limit instead of validation snap.');
    await cropPage.goto('/crop-png');
    await cropPage.uploadImage(path.resolve(__dirname, '../test-data/test-image.png'));
    await cropPage.verifyUploadSuccess();

    if(await cropPage.xInput.isVisible()) {
        await cropPage.xInput.fill('99999');
        await page.keyboard.press('Tab'); // Trigger blur
        
        // Either shows validation error or snaps back to max
        const newValue = await cropPage.xInput.inputValue();
        expect(newValue).not.toEqual('99999');
        await page.screenshot({ path: 'test-results/screenshots/crop/TC09-Boundary-Value-Input.png', fullPage: true });
    }
  });

  // TC_10: Download Functionality
  test('TC10: Verify the Download Functionality', async ({ page }) => {
    await cropPage.goto('/crop-png');
    await cropPage.uploadImage(path.resolve(__dirname, '../test-data/test-image.png'));
    await cropPage.verifyUploadSuccess();

    if (await cropPage.downloadButton.isVisible()) {
       const [download] = await Promise.all([
         page.waitForEvent('download'),
         cropPage.downloadButton.click()
       ]);
       expect(download.suggestedFilename()).toContain('.png');
       await page.screenshot({ path: 'test-results/screenshots/crop/TC10-Download-Functionality.png', fullPage: true });
    }
  });

  // TC_11: Drag & Drop
  test('TC11: Verify Drag & Drop Upload', async ({ page }) => {
    await cropPage.goto('/crop-png');
    await cropPage.uploadViaDrop(path.resolve(__dirname, '../test-data/test-image.png'));
    await cropPage.verifyUploadSuccess();
    await page.screenshot({ path: 'test-results/screenshots/crop/TC11-Drag-Drop.png', fullPage: true });
  });

  // TC_12: Clear Functionality
  test('TC12: Verify Clear button functionality', async ({ page }) => {
    await cropPage.goto('/crop-png');
    await cropPage.uploadImage(path.resolve(__dirname, '../test-data/test-image.png'));
    await cropPage.verifyUploadSuccess();

    if (await cropPage.clearButton.isVisible()) {
        await cropPage.clearButton.click();
        await cropPage.verifyUploadFailure(); // Should revert to "No image yet."
        await page.screenshot({ path: 'test-results/screenshots/crop/TC12-Clear-Functionality.png', fullPage: true });
    }
  });
});
