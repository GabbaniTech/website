/**
 * Site UI behaviour: the mobile navigation toggle, the language-switcher
 * dropdown, and recording the visitor's explicit language choice so the root
 * page stops auto-redirecting once they have picked a language.
 *
 * Loaded as a classic script at the end of <body> on every page, so the DOM it
 * wires up is already parsed. The `init` entry point is exposed on
 * `window.GabbaniUI` so it can be unit-tested against a constructed DOM.
 */
(function () {
    'use strict';

    function init(win) {
        var doc = win.document;

        doc.querySelector('.nav-toggle').addEventListener('click', function () {
            doc.querySelector('header nav').classList.toggle('open');
        });

        doc.querySelectorAll('.lang-switcher').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.stopPropagation();
                el.classList.toggle('open');
            });
        });

        doc.addEventListener('click', function () {
            doc.querySelectorAll('.lang-switcher').forEach(function (el) {
                el.classList.remove('open');
            });
        });

        // Record an explicit language choice on every page (the original inline
        // script only did this on the home pages). Recording it site-wide keeps
        // the root auto-redirect from overriding a choice made on a legal page.
        doc.querySelectorAll('.lang-dropdown a').forEach(function (a) {
            a.addEventListener('click', function () {
                win.sessionStorage.setItem('lang-chosen', '1');
            });
        });
    }

    window.GabbaniUI = { init: init };
    window.GabbaniUI.init(window);
})();
