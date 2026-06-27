import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['test/**/*.test.js'],
        coverage: {
            provider: 'v8',
            include: ['assets/**/*.js'],
            // Report every matched file even if a test never imports it, so a new
            // untested logic module drops coverage below 100% instead of passing.
            all: true,
            // Progressive-enhancement DOM glue (scroll reveal, the live ticker,
            // the interactive weather/calendar widgets, the explain-with-AI popup
            // and campaign-attribution) is exercised by the Playwright behaviour
            // and visual suites, not unit tests. The pure logic modules below
            // (lang.js, ui.js) stay under the 100% unit-coverage gate.
            exclude: ['assets/site.js', 'assets/gb-ai-popup.js', 'assets/sea-attribution.js'],
            reporter: ['text', 'json-summary'],
            // Every line, branch, function and statement of the shipped browser
            // JS must be exercised — the build fails below 100%.
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
    },
});
