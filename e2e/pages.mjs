// Single source of truth shared across the test setup so nothing can drift:
// the Playwright spec, the check-visual gate, the static server, and the
// Playwright config all import these.

// Port for the local/dev static server (scripts/serve.mjs) and the Playwright
// webServer + baseURL. Defined once so the server and the runner always agree.
export const PORT = 4173;

// Pages under visual test, by name and path.
export const PAGES = [
    { name: 'home-en', path: '/' },
    { name: 'home-de', path: '/de/' },
    { name: 'home-fr', path: '/fr/' },
    { name: 'home-it', path: '/it/' },
    { name: 'home-es', path: '/es/' },
    { name: 'legal-en', path: '/legal.html' },
    { name: 'legal-de', path: '/de/legal.html' },
    { name: 'legal-fr', path: '/fr/legal.html' },
    { name: 'legal-it', path: '/it/legal.html' },
    { name: 'legal-es', path: '/es/legal.html' },
    { name: '404', path: '/this-path-does-not-exist', expectStatus: 404 },
];

export const PROJECTS = ['desktop', 'mobile'];
