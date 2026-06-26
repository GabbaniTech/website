import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT || 4173);

// Screenshots are rendered identically only within the same browser + OS, so
// baselines are generated and compared inside the pinned Playwright container
// (see scripts/e2e-docker.sh and .github/workflows/playwright.yml). The path
// template therefore omits the platform suffix — there is only ever one
// platform: the container.
export default defineConfig({
    testDir: 'e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: [['list'], ['json', { outputFile: 'playwright-report/results.json' }]],
    snapshotPathTemplate: 'e2e/__screenshots__/{projectName}/{arg}{ext}',
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'en-US',
        timezoneId: 'UTC',
    },
    expect: {
        toHaveScreenshot: {
            animations: 'disabled',
            caret: 'hide',
            maxDiffPixelRatio: 0,
        },
    },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
        { name: 'mobile', use: { ...devices['Pixel 7'] } },
    ],
    webServer: {
        command: 'node scripts/serve.mjs',
        port: PORT,
        reuseExistingServer: !process.env.CI,
    },
});
