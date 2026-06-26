#!/usr/bin/env node
/**
 * Visual-coverage gate. Confirms the Playwright run was 100% fulfilled:
 *   1. every page under test has a committed baseline screenshot per project,
 *   2. the run had no failed, flaky, or skipped tests, and
 *   3. each page's screenshot comparison actually ran and passed in each project.
 *
 * Run after `playwright test` (which writes playwright-report/results.json).
 * Fail-closed: a missing baseline, a skipped test, or a missing result fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES, PROJECTS } from '../e2e/pages.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = path.join(ROOT, 'playwright-report', 'results.json');
const SNAP_DIR = path.join(ROOT, 'e2e', '__screenshots__');

const errors = [];
const fail = (msg) => errors.push(msg);

// 1. Every page × project has a baseline screenshot on disk.
for (const page of PAGES) {
    for (const project of PROJECTS) {
        const file = path.join(SNAP_DIR, project, `${page.name}.png`);
        if (!fs.existsSync(file)) fail(`missing baseline screenshot: e2e/__screenshots__/${project}/${page.name}.png`);
    }
}

// 2 + 3. Parse the Playwright report.
if (!fs.existsSync(REPORT)) {
    fail(`Playwright report not found at ${path.relative(ROOT, REPORT)} — did "playwright test" run?`);
} else {
    const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
    if (!report.stats) {
        fail('Playwright report has no "stats" block — cannot confirm the run succeeded');
    } else {
        if (report.stats.unexpected) fail(`${report.stats.unexpected} test(s) failed`);
        if (report.stats.flaky) fail(`${report.stats.flaky} test(s) were flaky`);
        if (report.stats.skipped) fail(`${report.stats.skipped} test(s) were skipped — every test must run`);
    }

    const passed = new Set();
    const walk = (suites = []) => {
        for (const suite of suites) {
            for (const spec of suite.specs || []) {
                for (const t of spec.tests || []) {
                    if (t.status === 'expected') passed.add(`${spec.title}::${t.projectName}`);
                }
            }
            walk(suite.suites);
        }
    };
    walk(report.suites);

    for (const page of PAGES) {
        for (const project of PROJECTS) {
            if (!passed.has(`visual ${page.name}::${project}`)) {
                fail(`no passing screenshot result for "visual ${page.name}" in project "${project}"`);
            }
        }
    }
}

const expectedBaselines = PAGES.length * PROJECTS.length;
console.log(`Expecting ${expectedBaselines} baselines (${PAGES.length} pages × ${PROJECTS.length} projects).`);

if (errors.length) {
    console.error(`\n✖ ${errors.length} visual-coverage violation(s):`);
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
}
console.log('✓ Visual coverage complete: all baselines present and all screenshot comparisons passed.');
