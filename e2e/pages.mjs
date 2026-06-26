// Single source of truth for the pages under visual test, shared by the
// Playwright spec and the check-visual gate so neither can drift from the other.
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
