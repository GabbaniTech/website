# Gabbani Tech Website

Static website for [gabbanitech.com](https://gabbanitech.com).

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

- Push to `develop` → DEV (`dev.gabbanitech.com`) + auto-creates a release PR to `main`
- Merge to `main` → production (`gabbanitech.com`)

Requires repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## License

[MIT](LICENSE)
