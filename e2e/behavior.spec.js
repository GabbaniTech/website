import { test, expect } from '@playwright/test';

// Real-browser checks for the language auto-redirect — the one piece of
// behaviour that unit tests can only approximate against a fake window.
test.describe('language auto-redirect', () => {
    test.describe('a supported browser language', () => {
        test.use({ locale: 'de-DE' });

        test('is sent from / to /de/ on first visit', async ({ page }) => {
            await page.goto('/');
            await expect(page).toHaveURL(/\/de\/$/);
        });

        test('is not redirected again after the choice is recorded', async ({ page }) => {
            await page.goto('/');
            await expect(page).toHaveURL(/\/de\/$/);
            await page.goto('/');
            await expect(page).toHaveURL(/\/$/);
            expect(new URL(page.url()).pathname).toBe('/');
        });
    });

    test.describe('the default browser language', () => {
        test.use({ locale: 'en-US' });

        test('stays on / without redirecting', async ({ page }) => {
            await page.goto('/');
            await expect(page).toHaveURL(/\/$/);
            expect(new URL(page.url()).pathname).toBe('/');
        });
    });
});
