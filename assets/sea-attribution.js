/* Gabbani Tech — lightweight SEA / campaign attribution capture.
   Persists ad-campaign parameters for the session and tags outbound demo links,
   so a lead booked from a paid search ad keeps its source. No cookies, no tracking. */
(function () {
    'use strict';
    var KEYS = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'gclid',
        'gbraid',
        'wbraid',
        'msclkid',
        'fbclid',
    ];
    var STORE = 'gb-attribution';

    function read() {
        try {
            return JSON.parse(sessionStorage.getItem(STORE) || '{}');
        } catch (e) {
            return {};
        }
    }

    try {
        var params = new URLSearchParams(window.location.search);
        var data = read();
        var changed = false;
        KEYS.forEach(function (k) {
            var v = params.get(k);
            if (v && !data[k]) {
                data[k] = v;
                changed = true;
            }
        });
        if (changed) {
            try {
                sessionStorage.setItem(STORE, JSON.stringify(data));
            } catch (e) {}
        }

        // Carry the campaign source into the contact link so the lead is attributable.
        var data2 = read();
        var qs = Object.keys(data2)
            .map(function (k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(data2[k]);
            })
            .join('&');
        if (qs) {
            document.querySelectorAll('a[href$="contact.html"], a[href$="/contact.html"]').forEach(function (a) {
                var href = a.getAttribute('href');
                if (href.indexOf('?') === -1) a.setAttribute('href', href + '?' + qs);
            });
        }
    } catch (e) {}
})();
