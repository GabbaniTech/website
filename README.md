# Gabbani Tech Website

Static website for [gabbani.tech](https://gabbani.tech) — real-time retail technology from Lugano.

## Pages

- `index.html` — home (overview + feature diagrams)
- `platform.html` — real-time checkout (the live sale → dashboard flow)
- `staffing.html` — weather-smart staffing (forecast → shift plan)
- `payments.html` — crypto payments (MyLuga, Bitcoin, Tether via Open CryptoPay / DFX AG)
- `about.html` — about the company
- `contact.html` — contact / demo request
- `legal.html`, `404.html`

Each page exists in all five languages. Diagrams are built with semantic HTML + CSS and
inline SVG (no images, no build step); the dashboard ticker is animated in `assets/site.js`.

## Languages

- English (default, `/`)
- Deutsch (`/de/`)
- Français (`/fr/`)
- Italiano (`/it/`)
- Español (`/es/`)

Auto-detects browser language on first visit.

## Tech Stack

Pure HTML + CSS. No frameworks, no build step.

## Development

```bash
npm install        # installs prettier (the only dev dependency)
npm run format     # format all files
npm run format:check
```

Serve locally with any static server, e.g.:

```bash
npx serve .
```

## Deployment

Deployed to Cloudflare Pages via GitHub Actions:

- Push to `develop` → DEV (`dev.gabbani.tech`) + auto-creates a release PR to `main`
- Merge to `main` → production (`gabbani.tech`)

Requires repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## License

[MIT](LICENSE)
