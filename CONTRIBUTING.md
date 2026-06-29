# Contributing

The [gabbani.tech](https://gabbani.tech) website is a pure HTML + CSS
multilingual static site (English default, plus `de/`, `fr/`, `it/`, `es/`)
deployed to Cloudflare Pages. There is **no build step** for the site itself —
the tooling below exists only to format the code and enforce the quality gates.

## Prerequisites

- **Node 22** — CI pins it, and `package.json` declares `engines.node >= 22`.
- **npm** — for installing dev tooling and running scripts.
- **Docker** — required only for the visual-regression gate (it runs Playwright
  inside a pinned container). You can do everything else without it.

## Setup

```bash
npm install
```

This installs the dev tooling only: Prettier, html-validate, Vitest, jsdom, and
Playwright. None of it ships to the site.

## Local preview

```bash
npm run serve
```

`npm run serve` runs `scripts/serve.mjs`, a dependency-free static server that
mimics Cloudflare Pages routing:

- a trailing-slash path (e.g. `/de/`) is served from its `index.html`, and
- an unknown path returns `404.html`.

Use this when behaviour that depends on routing matters. As a quick alternative
you can run `npx serve .`, but it does **not** replicate the `404.html` routing,
so prefer `npm run serve` for anything routing-sensitive.

## Quality gates

Every pull request must pass the gates below. CI enforces them as **required
status checks**, so a PR that breaks any one of them cannot be merged.

The fast gates run together with:

```bash
npm run check
```

which is `format:check` + `validate:html` + `check:site` + `test:coverage`.

| Gate                 | Command                 | What it enforces                                                                                             |
| -------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| Formatting           | `npm run format:check`  | Prettier formatting (`npm run format` to auto-fix)                                                           |
| HTML validity        | `npm run validate:html` | Valid markup on every page (html-validate)                                                                   |
| Site completeness    | `npm run check:site`    | i18n parity; `lang`/meta/`og:url`/`hreflang`; internal links; language switcher; sitemap; no structure drift |
| Unit coverage (100%) | `npm run test:coverage` | Vitest at 100% lines/branches/functions/statements of `assets/*.js`                                          |
| Visual regression    | `npm run e2e:docker`    | Full-page screenshots match committed baselines (container-based — see below)                                |

The first four run together via `npm run check`. The visual-regression gate is
separate and container-based.

## Visual regression

Screenshots render identically only within the same browser + OS, so the
baselines under `e2e/__screenshots__/` are generated **and** compared **inside
the pinned Playwright container** (`mcr.microsoft.com/playwright`). The image tag
must equal the exact `@playwright/test` version in `package.json` — currently
**1.61.1**.

```bash
npm run e2e:docker          # compare against committed baselines, then run the check:visual gate
npm run e2e:docker:update   # regenerate baselines after an INTENTIONAL visual change
```

After an intentional visual change, run `npm run e2e:docker:update` and commit
the updated PNGs in the **same PR** as the change that caused them.

### No Docker? Regenerate baselines from CI

If you can't run the container locally, push your branch and run the
**Update visual baselines** workflow from the Actions tab (`Run workflow` → pick
your branch). It regenerates the baselines inside the pinned container and
commits them back to your branch, so the visual-regression gate can pass without
a local Docker setup. See `.github/workflows/update-baselines.yml` for the
optional `BASELINE_PAT` secret that lets it re-trigger the gate automatically.

### Footgun: never update baselines on the host

`npm run test:e2e` (raw `playwright test`) renders correctly **only inside the
container**. Running it on the host (macOS/Windows) produces wrong-platform
images and a misleading diff. Never update baselines on the host — always go
through `npm run e2e:docker:update`.

### Bumping Playwright

Change the exact version in `package.json` **and** the image tag in
`.github/workflows/playwright.yml` **together** — a CI guard fails the build if
the two drift. Then regenerate the baselines with `npm run e2e:docker:update`.

## Branch flow & PRs

- Work on a **feature branch**, never directly on `develop` or `main`.
- Open PRs as **draft** against `develop`.
- PRs must be written in **English**.
- CI runs the gates above as **required status checks**; a PR cannot merge until
  they are green.
- Push to `develop` deploys **DEV** (`dev.gabbani.tech`) and auto-creates a
  release PR to `main`.
- Merging to `main` deploys **production** (`gabbani.tech`).
