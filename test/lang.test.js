import { describe, expect, test, vi } from 'vitest';

// Importing the module runs its IIFE against the jsdom window. The default jsdom
// navigator.language is 'en-US', which is not a redirect target, so importing
// performs no navigation and simply exposes the helpers on window.GabbaniLang.
import '../assets/lang.js';

const { normalizeLang, pickRedirect, run } = window.GabbaniLang;

function fakeWin({ language, chosen }) {
    const store = new Map();
    if (chosen !== undefined) store.set('lang-chosen', chosen);
    return {
        navigator: { language },
        sessionStorage: {
            getItem: (key) => (store.has(key) ? store.get(key) : null),
            setItem: (key, value) => store.set(key, value),
        },
        location: { replace: vi.fn() },
        store,
    };
}

describe('normalizeLang', () => {
    test('lowercases and keeps the two-letter primary subtag', () => {
        expect(normalizeLang('DE-CH')).toBe('de');
        expect(normalizeLang('en-US')).toBe('en');
    });

    test('treats a missing language as empty', () => {
        expect(normalizeLang(undefined)).toBe('');
        expect(normalizeLang('')).toBe('');
        expect(normalizeLang(null)).toBe('');
    });
});

describe('pickRedirect', () => {
    test('maps supported non-default languages to their path', () => {
        expect(pickRedirect('de')).toBe('/de/');
        expect(pickRedirect('fr-FR')).toBe('/fr/');
        expect(pickRedirect('it')).toBe('/it/');
        expect(pickRedirect('es-ES')).toBe('/es/');
    });

    test('returns null for the default and unknown languages', () => {
        expect(pickRedirect('en')).toBeNull();
        expect(pickRedirect('pt')).toBeNull();
        expect(pickRedirect('')).toBeNull();
        // A prototype key must not leak through as a "supported" language.
        expect(pickRedirect('constructor')).toBeNull();
    });
});

describe('run', () => {
    test('redirects a supported language on first visit and records the choice', () => {
        const win = fakeWin({ language: 'de-DE' });
        expect(run(win)).toBe('/de/');
        expect(win.location.replace).toHaveBeenCalledWith('/de/');
        expect(win.store.get('lang-chosen')).toBe('de');
    });

    test('does nothing once a language has already been chosen', () => {
        const win = fakeWin({ language: 'de-DE', chosen: 'de' });
        expect(run(win)).toBeNull();
        expect(win.location.replace).not.toHaveBeenCalled();
    });

    test('does nothing for the default language', () => {
        const win = fakeWin({ language: 'en-US' });
        expect(run(win)).toBeNull();
        expect(win.location.replace).not.toHaveBeenCalled();
    });
});
