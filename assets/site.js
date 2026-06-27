/* Gabbani Tech — shared interactions. Progressive enhancement only. */
(function () {
    'use strict';

    // Mobile navigation
    var header = document.getElementById('header');
    var toggle = document.getElementById('navToggle');
    if (toggle && header) {
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = header.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    // Language dropdown
    var lang = document.getElementById('lang');
    if (lang) {
        var current = lang.querySelector('.lang__current');
        current.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = lang.classList.toggle('open');
            current.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        // Remember explicit language choice so auto-detect does not override it
        lang.querySelectorAll('.lang__menu a').forEach(function (a) {
            a.addEventListener('click', function () {
                try {
                    sessionStorage.setItem('lang-chosen', '1');
                } catch (err) {}
            });
        });
    }

    document.addEventListener('click', function () {
        if (lang) lang.classList.remove('open');
        if (header) {
            header.classList.remove('open');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Reveal on scroll
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in');
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
        );
        reveals.forEach(function (el) {
            io.observe(el);
        });
    } else {
        reveals.forEach(function (el) {
            el.classList.add('in');
        });
    }

    // Live ticker — rotates the newest sale into a real-time dashboard.
    // Frozen for reduced-motion users and under automation (navigator.webdriver),
    // so visual-regression screenshots stay deterministic.
    var ticker = document.querySelector('[data-ticker]');
    var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (ticker && !prefersReduced && !navigator.webdriver) {
        var sales = [
            { p: ticker.dataset.p0 || 'Luganighe sausage', g: '320 g', chf: '8.40', t: 'Till 2' },
            { p: ticker.dataset.p1 || 'Gruyère AOP', g: '250 g', chf: '7.10', t: 'Till 1' },
            { p: ticker.dataset.p2 || 'Raw ham', g: '180 g', chf: '9.60', t: 'Till 3' },
            { p: ticker.dataset.p3 || 'Country bread', g: '500 g', chf: '4.20', t: 'Till 1' },
            { p: ticker.dataset.p4 || 'Robiola cheese', g: '200 g', chf: '6.80', t: 'Till 2' },
        ];
        var idx = 0;
        var clock = 14 * 60 + 32; // minutes since midnight, starts 14:32
        function fmt(m) {
            var h = Math.floor(m / 60) % 24;
            var mm = m % 60;
            return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm;
        }
        var body = ticker.querySelector('[data-ticker-body]');
        function render() {
            var rows = '';
            for (var i = 0; i < 3; i++) {
                var s = sales[(idx + i) % sales.length];
                var time = fmt(clock - i);
                rows +=
                    '<div class="ticker__row' +
                    (i === 0 ? ' ticker__row--new' : '') +
                    '"><strong>' +
                    s.p +
                    '</strong><span class="g">' +
                    s.g +
                    '</span><span class="chf">CHF ' +
                    s.chf +
                    '</span><span class="t">' +
                    time +
                    ' · ' +
                    s.t +
                    '</span></div>';
            }
            body.innerHTML = rows;
        }
        render();
        setInterval(function () {
            idx = (idx + 1) % sales.length;
            clock += 1;
            render();
        }, 2600);
    }

    // Interactive weather toggle -> roster reacts (sun = full, rain = trimmed)
    document.querySelectorAll('[data-weather-toggle]').forEach(function (group) {
        var chips = group.querySelectorAll('.weather__chip');
        var diagram = group.closest('.diagram') || document;
        var rows = diagram.querySelectorAll('.roster__row[data-sun]');
        var capFill = diagram.querySelector('[data-cap-fill]');
        var capVal = diagram.querySelector('[data-cap-val]');
        function apply(mode) {
            chips.forEach(function (c) {
                c.setAttribute('aria-pressed', c.dataset.weather === mode ? 'true' : 'false');
            });
            var totalSun = 0,
                total = 0;
            rows.forEach(function (row) {
                var n = parseInt(row.dataset[mode] || row.dataset.sun, 10);
                var max = parseInt(row.dataset.max || row.dataset.sun, 10);
                totalSun += parseInt(row.dataset.sun, 10);
                total += n;
                var bar = row.querySelector('.roster__bar');
                var count = row.querySelector('.roster__count strong');
                if (bar) bar.style.width = Math.round((n / max) * 100) + '%';
                // Update only the number so the translated unit label is kept.
                if (count) count.textContent = n;
            });
            if (capFill && capVal) {
                var pct = totalSun ? Math.round((total / totalSun) * 100) : 100;
                capFill.style.width = pct + '%';
                capVal.textContent = pct + '%';
            }
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                apply(chip.dataset.weather);
            });
        });
        apply('sun');
    });

    // Calendar: click a day to grant / remove a day off
    document.querySelectorAll('[data-calendar]').forEach(function (cal) {
        cal.querySelectorAll('.cal__day').forEach(function (day) {
            if (day.classList.contains('is-muted')) return;
            day.addEventListener('click', function () {
                day.classList.toggle('is-off');
                day.setAttribute('aria-pressed', day.classList.contains('is-off') ? 'true' : 'false');
            });
        });
    });
})();
