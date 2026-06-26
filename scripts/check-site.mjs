#!/usr/bin/env node
/**
 * Static-site completeness gate.
 *
 * Instead of code-coverage (there is almost no application code), this enforces
 * structural "coverage" of the multilingual site: every invariant below must
 * hold for every page. A single violation fails the build, so a pull request
 * that drops a translation, breaks an internal link, or lets the per-language
 * copies drift apart cannot be merged.
 *
 * Scope note: external (off-site) URLs are intentionally NOT fetched — that
 * would make CI non-deterministic and network-dependent. They are counted and
 * listed so the omission is explicit, never silent.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const parseHtml = (rel) => new JSDOM(fs.readFileSync(path.join(ROOT, rel), 'utf8')).window.document;

// The canonical origin is a single source of truth — the root page's og:url — so
// the gate stays domain-agnostic and instead enforces that every page agrees on it.
const rootOgUrl = parseHtml('index.html').querySelector('meta[property="og:url"]')?.getAttribute('content');
if (!rootOgUrl) {
    console.error('check-site: cannot determine canonical origin — index.html has no og:url');
    process.exit(1);
}
const ORIGIN = new URL(rootOgUrl).origin;

const DEFAULT_LANG = 'en';
const LANGS = ['en', 'de', 'fr', 'it', 'es']; // en is served from the root
const LOCALIZED_PAGES = ['index.html', 'legal.html']; // every language has these
const REQUIRED_ASSETS = [
    'style.css',
    'robots.txt',
    'sitemap.xml',
    'assets/favicon.svg',
    'assets/lang.js',
    'assets/ui.js',
];

const errors = [];
const externalUrls = new Set();
const fail = (where, message) => errors.push(`${where}: ${message}`);

const dirFor = (lang) => (lang === DEFAULT_LANG ? '' : `${lang}/`);
const fileFor = (lang, page) => `${dirFor(lang)}${page}`;
const pathFor = (lang, page) => (page === 'index.html' ? `/${dirFor(lang)}` : `/${dirFor(lang)}${page}`);
const urlFor = (lang, page) => `${ORIGIN}${pathFor(lang, page)}`;
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
// Link targets must resolve to an actual file: a link to a directory without a
// trailing slash (e.g. /de instead of /de/) would otherwise pass silently.
const isFile = (rel) => {
    const p = path.join(ROOT, rel);
    return fs.existsSync(p) && fs.statSync(p).isFile();
};

// The five language landing pages every page's switcher and the sitemap must offer.
const LANG_ROOTS = LANGS.map((l) => pathFor(l, 'index.html'));

/** Map an internal URL or path to the repo-relative file it must resolve to. */
function internalToFile(target, fromFile) {
    let p = target;
    if (p.startsWith(ORIGIN)) p = p.slice(ORIGIN.length) || '/';
    p = p.split('#')[0].split('?')[0];
    let rel;
    if (p.startsWith('/')) {
        rel = p.replace(/^\/+/, '');
    } else {
        rel = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), p));
    }
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    return rel;
}

/** Classify a href/src reference. */
function classify(ref) {
    if (ref == null) return { kind: 'skip' };
    const v = ref.trim();
    if (v === '' || v.startsWith('#')) return { kind: v.startsWith('#') ? 'fragment' : 'skip', value: v };
    if (/^(mailto:|tel:|data:|javascript:)/i.test(v)) return { kind: 'skip' };
    if (v.startsWith('//')) {
        externalUrls.add(`https:${v}`);
        return { kind: 'external' };
    }
    if (/^https?:\/\//i.test(v)) {
        if (v === ORIGIN || v.startsWith(`${ORIGIN}/`)) return { kind: 'internal', value: v };
        externalUrls.add(v);
        return { kind: 'external' };
    }
    return { kind: 'internal', value: v };
}

// ── 1. Presence / i18n parity ──────────────────────────────────────────────
for (const lang of LANGS) {
    for (const page of LOCALIZED_PAGES) {
        const rel = fileFor(lang, page);
        if (!exists(rel)) fail(rel, `missing — every language must ship every localized page (${page})`);
    }
}
if (!exists('404.html')) fail('404.html', 'missing');
for (const asset of REQUIRED_ASSETS) {
    if (!exists(asset)) fail(asset, 'required asset missing');
}

// All HTML pages we expect to exist (+ 404), with their expected language.
const PAGES = [];
for (const lang of LANGS) for (const page of LOCALIZED_PAGES) PAGES.push({ rel: fileFor(lang, page), lang, page });
PAGES.push({ rel: '404.html', lang: 'en', page: '404.html' });

// ── 2–6. Per-page invariants ───────────────────────────────────────────────
const fingerprints = {}; // page -> { lang -> fingerprint } for drift comparison

for (const { rel, lang, page } of PAGES) {
    if (!exists(rel)) continue;
    const doc = parseHtml(rel);

    // 2. <html lang> matches the directory.
    const htmlLang = doc.documentElement.getAttribute('lang');
    if (htmlLang !== lang) fail(rel, `<html lang="${htmlLang}"> should be "${lang}"`);

    // 3. Required head metadata.
    const title = doc.querySelector('title');
    if (!title || !title.textContent.trim()) fail(rel, 'missing non-empty <title>');
    if (page !== '404.html') {
        const desc = doc.querySelector('meta[name="description"]');
        if (!desc || !desc.getAttribute('content')?.trim()) fail(rel, 'missing non-empty <meta name="description">');
    }
    if (!doc.querySelector('meta[charset]')) fail(rel, 'missing <meta charset>');
    if (!doc.querySelector('meta[name="viewport"]')) fail(rel, 'missing <meta name="viewport">');

    // 4. Index pages are indexable with a complete, correct hreflang set + canonical og:url.
    //    Legal pages are intentionally noindex, so they must NOT advertise hreflang.
    if (page === 'index.html') {
        const map = {};
        for (const link of doc.querySelectorAll('link[rel="alternate"][hreflang]')) {
            map[link.getAttribute('hreflang')] = link.getAttribute('href');
        }
        const expected = { 'x-default': urlFor(DEFAULT_LANG, 'index.html') };
        for (const l of LANGS) expected[l] = urlFor(l, 'index.html');
        for (const [hl, href] of Object.entries(expected)) {
            if (map[hl] !== href) fail(rel, `hreflang "${hl}" should point to ${href}, got ${map[hl] ?? '(missing)'}`);
        }
        for (const hl of Object.keys(map)) {
            if (!(hl in expected)) fail(rel, `unexpected hreflang "${hl}"`);
        }
        const og = doc.querySelector('meta[property="og:url"]');
        if (!og) fail(rel, 'missing <meta property="og:url">');
        else if (og.getAttribute('content') !== urlFor(lang, 'index.html')) {
            fail(rel, `og:url should be ${urlFor(lang, 'index.html')}, got ${og.getAttribute('content')}`);
        }
    }
    if (page === 'legal.html') {
        const robots = doc.querySelector('meta[name="robots"]');
        if (!robots || !/noindex/i.test(robots.getAttribute('content') || '')) {
            fail(rel, 'legal page must carry <meta name="robots" content="noindex">');
        }
        if (doc.querySelector('link[rel="alternate"][hreflang]')) {
            fail(rel, 'noindex legal page must not declare hreflang alternates');
        }
    }

    // 5. Language switcher offers this page in all five languages. Legal pages
    //    switch between legal pages; index and 404 switch between landing pages.
    const switcherPage = page === 'legal.html' ? 'legal.html' : 'index.html';
    const expectedSwitcher = LANGS.map((l) => pathFor(l, switcherPage));
    const switcher = [...doc.querySelectorAll('.lang-dropdown a')].map((a) => a.getAttribute('href'));
    const missingLinks = expectedSwitcher.filter((r) => !switcher.includes(r));
    if (missingLinks.length) fail(rel, `language switcher missing link(s): ${missingLinks.join(', ')}`);
    const extraLinks = switcher.filter((r) => !expectedSwitcher.includes(r));
    if (extraLinks.length) fail(rel, `language switcher has unexpected link(s): ${extraLinks.join(', ')}`);

    // 6. Internal links and assets resolve; in-page fragments hit a real id.
    const refs = [
        ...[...doc.querySelectorAll('a[href]')].map((e) => e.getAttribute('href')),
        ...[...doc.querySelectorAll('link[href]')].map((e) => e.getAttribute('href')),
        ...[...doc.querySelectorAll('script[src]')].map((e) => e.getAttribute('src')),
        ...[...doc.querySelectorAll('img[src]')].map((e) => e.getAttribute('src')),
    ];
    for (const ref of refs) {
        const c = classify(ref);
        if (c.kind === 'fragment') {
            if (!doc.getElementById(c.value.slice(1))) fail(rel, `dead in-page anchor ${c.value}`);
        } else if (c.kind === 'internal') {
            const target = internalToFile(c.value, rel);
            if (!isFile(target)) fail(rel, `broken internal link ${ref} -> ${target}`);
        }
    }

    // Structural fingerprint for drift detection.
    const sectionIds = [...doc.querySelectorAll('section')].map((s) => s.id).sort();
    fingerprints[page] ??= {};
    fingerprints[page][lang] = {
        sections: doc.querySelectorAll('section').length,
        sectionIds: sectionIds.join(','),
        anchors: doc.querySelectorAll('a[href^="#"]').length,
    };
}

// ── 7. Structural parity across languages (drift) ──────────────────────────
for (const page of LOCALIZED_PAGES) {
    const ref = fingerprints[page]?.[DEFAULT_LANG];
    if (!ref) continue;
    for (const lang of LANGS) {
        if (lang === DEFAULT_LANG) continue;
        const fp = fingerprints[page]?.[lang];
        if (!fp) continue;
        for (const key of ['sections', 'sectionIds', 'anchors']) {
            if (fp[key] !== ref[key]) {
                fail(fileFor(lang, page), `structure drift: ${key} = ${fp[key]} but ${DEFAULT_LANG} has ${ref[key]}`);
            }
        }
    }
}

// ── 8. Sitemap consistency ─────────────────────────────────────────────────
if (exists('sitemap.xml')) {
    const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
    const { window: w } = new JSDOM('<!doctype html><html></html>');
    const sitemap = new w.DOMParser().parseFromString(xml, 'application/xml');
    if (sitemap.querySelector('parsererror')) {
        fail('sitemap.xml', 'is not well-formed XML');
    } else {
        const locs = [...sitemap.getElementsByTagName('loc')].map((n) => n.textContent.trim());
        for (const loc of locs) {
            const c = classify(loc);
            if (c.kind !== 'internal') fail('sitemap.xml', `<loc> ${loc} is not an on-site URL`);
            else if (!isFile(internalToFile(c.value, 'sitemap.xml')))
                fail('sitemap.xml', `<loc> ${loc} resolves to nothing`);
        }
        for (const el of sitemap.getElementsByTagName('*')) {
            const hl = el.getAttribute && el.getAttribute('hreflang');
            if (!hl) continue;
            const href = el.getAttribute('href');
            const c = classify(href);
            if (c.kind !== 'internal') fail('sitemap.xml', `alternate ${href} is not an on-site URL`);
            else if (!isFile(internalToFile(c.value, 'sitemap.xml')))
                fail('sitemap.xml', `alternate ${href} resolves to nothing`);
        }
        for (const root of LANG_ROOTS) {
            if (!locs.includes(`${ORIGIN}${root}`))
                fail('sitemap.xml', `missing <loc> for language landing page ${root}`);
        }
    }
}

// ── Report ─────────────────────────────────────────────────────────────────
const checkedPages = PAGES.filter((p) => exists(p.rel)).length;
console.log(`Checked ${checkedPages} HTML pages across ${LANGS.length} languages.`);
console.log(`External URLs found (not fetched — out of scope): ${externalUrls.size}`);
for (const u of [...externalUrls].sort()) console.log(`  · ${u}`);

if (errors.length) {
    console.error(`\n✖ ${errors.length} completeness violation(s):`);
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
}
console.log('\n✓ All completeness invariants hold.');
