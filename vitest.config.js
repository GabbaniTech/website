import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['test/**/*.test.js'],
        coverage: {
            provider: 'v8',
            include: ['assets/**/*.js'],
            // Report every matched file even if a test never imports it, so a new
            // untested assets/*.js drops coverage below 100% instead of passing.
            all: true,
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
