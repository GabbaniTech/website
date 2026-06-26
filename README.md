# Gabbani Tech Website

Static website for [gabbani.tech](https://gabbani.tech).

## Languages

- English (default, `/`)
- Deutsch (`/de/`)
- Français (`/fr/`)
- Italiano (`/it/`)
- Español (`/es/`)

Auto-detects browser language on first visit.

## Tech Stack

Pure HTML + CSS — no frameworks and no build step for the site itself. The dev
dependencies exist only for formatting and the test gates below.

## Development

Requires Node 22 and (for the visual gate) Docker.

```bash
npm install
npm run serve        # local preview at http://localhost:4173 (Cloudflare-Pages-like routing)
npm run format       # format all files
```

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full setup, gate commands, and
how to regenerate visual baselines.

## Quality gates

Every pull request must pass the gates below; CI runs them as required status
checks, so a PR that breaks any one of them cannot be merged.

| Gate                 | Command                 | What it enforces                                                                                   |
| -------------------- | ----------------------- | -------------------------------------------------------------------------------------------------- |
| Formatting           | `npm run format:check`  | Prettier formatting                                                                                |
| HTML validity        | `npm run validate:html` | Valid markup on every page                                                                         |
| Site completeness    | `npm run check:site`    | i18n parity, `lang`/meta/`og:url`/hreflang, internal links, language switcher, sitemap, drift      |
| Unit coverage (100%) | `npm run test:coverage` | 100% line/branch/function/statement coverage of the browser JS (`assets/*.js`)                     |
| Visual regression    | `npm run e2e:docker`    | Full-page screenshot of every page × viewport matches its committed baseline (then `check:visual`) |

`npm run check` runs the first four locally in one go; the visual gate runs in a
pinned container (`npm run e2e:docker`). Details in [CONTRIBUTING.md](CONTRIBUTING.md).

## Deployment

Deployed to Cloudflare Pages via GitHub Actions:

- Push to `develop` → DEV (`dev.gabbani.tech`) + auto-creates a release PR to `main`
- Merge to `main` → production (`gabbani.tech`)

Requires repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## License

[MIT](LICENSE)
