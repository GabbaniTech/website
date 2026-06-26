import { test, expect } from '@playwright/test';
import { PAGES } from './pages.mjs';

// Full-page screenshot baseline for every page, in every project (viewport).
// A visual change anywhere fails the matching test until the baseline is
// regenerated on purpose.
for (const page of PAGES) {
    test(`visual ${page.name}`, async ({ page: pw }) => {
        const response = await pw.goto(page.path, { waitUntil: 'networkidle' });
        if (page.expectStatus) {
            expect(response?.status()).toBe(page.expectStatus);
        }
        await expect(pw).toHaveScreenshot(`${page.name}.png`, { fullPage: true });
    });
}
