import { beforeEach, expect, test, vi } from 'vitest';

// Minimal DOM mirroring the header markup that ui.js wires up on every page.
const TEMPLATE = `
  <header>
    <nav></nav>
    <div class="lang-switcher">
      <div class="lang-dropdown">
        <a href="/">English</a>
        <a href="/de/">Deutsch</a>
      </div>
    </div>
    <button class="nav-toggle" type="button" aria-label="Menu"></button>
  </header>
`;

// ui.js auto-runs init(window) on import, so the DOM must exist first. A fresh
// module instance per test re-runs that wiring against the rebuilt DOM.
async function loadUi() {
    document.body.innerHTML = TEMPLATE;
    window.sessionStorage.clear();
    vi.resetModules();
    await import('../assets/ui.js');
}

beforeEach(() => {
    document.body.innerHTML = '';
});

test('toggles the mobile navigation open and closed', async () => {
    await loadUi();
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('header nav');

    expect(nav.classList.contains('open')).toBe(false);
    toggle.click();
    expect(nav.classList.contains('open')).toBe(true);
    toggle.click();
    expect(nav.classList.contains('open')).toBe(false);
});

test('opens the language switcher and closes it on an outside click', async () => {
    await loadUi();
    const switcher = document.querySelector('.lang-switcher');

    switcher.click();
    expect(switcher.classList.contains('open')).toBe(true);

    document.body.click();
    expect(switcher.classList.contains('open')).toBe(false);
});

test('records the visitor language choice when a dropdown link is clicked', async () => {
    await loadUi();
    expect(window.sessionStorage.getItem('lang-chosen')).toBeNull();

    document.querySelector('.lang-dropdown a').click();
    expect(window.sessionStorage.getItem('lang-chosen')).toBe('1');
});
