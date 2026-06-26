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

```bash
npm install        # dev tooling: prettier, html-validate, vitest, jsdom, playwright
npm run format     # format all files
npm run format:check
```

Serve locally with any static server, e.g.:

```bash
npx serve .
```

## Testing & quality gates

Every pull request must pass the gates below; CI enforces all of them and they
are required status checks, so a PR that breaks any one of them cannot be merged.

| Gate                 | Command                 | What it enforces                                                                        |
| -------------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| Formatting           | `npm run format:check`  | Prettier formatting                                                                     |
| HTML validity        | `npm run validate:html` | Valid markup on every page                                                              |
| Site completeness    | `npm run check:site`    | i18n parity, `lang`/meta/hreflang, internal links, language switcher, sitemap, no drift |
| Unit coverage (100%) | `npm run test:coverage` | 100% line/branch/function coverage of the browser JS (`assets/*.js`)                    |
| Visual regression    | `npm run e2e:docker`    | Full-page screenshot of every page × viewport matches its committed baseline            |

`npm run check` runs the first four locally in one go.

### Visual regression details

Screenshots only render identically within the same browser + OS, so baselines
live under `e2e/__screenshots__/` and are generated and compared **inside the
pinned Playwright container** (matching CI). Docker is required.

```bash
npm run e2e:docker          # compare against the committed baselines
npm run e2e:docker:update   # regenerate baselines after an intentional visual change
node scripts/check-visual.mjs   # assert 100%: every baseline present, every comparison passed
```

When a visual change is intentional, run `npm run e2e:docker:update` and commit
the updated PNGs in the same PR.

## Deployment

Deployed to Cloudflare Pages via GitHub Actions:

- Push to `develop` → DEV (`dev.gabbani.tech`) + auto-creates a release PR to `main`
- Merge to `main` → production (`gabbani.tech`)

Requires repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## License

[MIT](LICENSE)
