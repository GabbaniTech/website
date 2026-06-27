import { defineConfig, devices } from '@playwright/test';
import { PORT, PROJECTS } from './e2e/pages.mjs';

// Device options per project name. The project NAMES live in e2e/pages.mjs (the
// shared source of truth used by the spec and the check-visual gate); this map
// only adds the per-project browser/viewport options.
const DEVICES = {
    desktop: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    mobile: { ...devices['Pixel 7'] },
};

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
    reporter: [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report/html' }],
        ['json', { outputFile: 'playwright-report/results.json' }],
    ],
    snapshotPathTemplate: 'e2e/__screenshots__/{projectName}/{arg}{ext}',
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'en-US',
        timezoneId: 'UTC',
        // Determinism: reduced motion freezes the JS-driven dashboard ticker and
        // settles the scroll-reveal sections so full-page screenshots are stable.
        reducedMotion: 'reduce',
    },
    expect: {
        toHaveScreenshot: {
            animations: 'disabled',
            caret: 'hide',
            maxDiffPixelRatio: 0,
        },
    },
    projects: PROJECTS.map((name) => {
        if (!DEVICES[name]) throw new Error(`playwright.config: no device options for project "${name}"`);
        return { name, use: DEVICES[name] };
    }),
    webServer: {
        command: 'node scripts/serve.mjs',
        port: PORT,
        env: { PORT: String(PORT) },
        reuseExistingServer: !process.env.CI,
    },
});
