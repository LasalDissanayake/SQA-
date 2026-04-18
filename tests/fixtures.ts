import { test as base, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export const test = base.extend<{}>({
  page: async ({ page }, use, testInfo) => {
    await use(page);

    if (testInfo.status === 'passed') {
      const feature = path.basename(testInfo.file, '.spec.ts');
      const screenshotDir = path.join('test-results', 'screenshots', feature);
      fs.mkdirSync(screenshotDir, { recursive: true });
      const safeName = testInfo.title.replace(/[^a-zA-Z0-9\-_]/g, '-').replace(/-+/g, '-');
      await page.screenshot({
        path: path.join(screenshotDir, `${safeName}.png`),
        fullPage: true,
      });
    }
  },
});

export { expect };
