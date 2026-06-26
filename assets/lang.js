/**
 * Language auto-redirect for the site root.
 *
 * On a visitor's first visit, sends a browser whose language is a supported
 * non-default language to the matching localized path. Once a language has been
 * chosen — by this script or by the language switcher writing `lang-chosen` to
 * sessionStorage — it never redirects again.
 *
 * Loaded as a classic, render-blocking script in the <head> of the root page so
 * the redirect happens before first paint. The pure helpers are exposed on
 * `window.GabbaniLang` so they can be unit-tested without a browser navigation.
 */
(function () {
    'use strict';

    var SUPPORTED = { de: '/de/', fr: '/fr/', it: '/it/', es: '/es/' };

    function normalizeLang(language) {
        return (language || '').toLowerCase().slice(0, 2);
    }

    function pickRedirect(language) {
        var lang = normalizeLang(language);
        return Object.prototype.hasOwnProperty.call(SUPPORTED, lang) ? SUPPORTED[lang] : null;
    }

    function run(win) {
        if (win.sessionStorage.getItem('lang-chosen')) {
            return null;
        }
        var target = pickRedirect(win.navigator.language);
        if (!target) {
            return null;
        }
        win.sessionStorage.setItem('lang-chosen', normalizeLang(win.navigator.language));
        win.location.replace(target);
        return target;
    }

    window.GabbaniLang = { normalizeLang: normalizeLang, pickRedirect: pickRedirect, run: run };
    window.GabbaniLang.run(window);
})();
