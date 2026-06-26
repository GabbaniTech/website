#!/usr/bin/env bash
# Run Playwright inside the pinned container so screenshots render identically to
# CI. With no arguments it compares against the committed baselines; pass
# --update-snapshots to (re)generate them.
#
#   scripts/e2e-docker.sh                     # compare
#   scripts/e2e-docker.sh --update-snapshots  # regenerate baselines
#
# An anonymous volume masks the host node_modules so the container installs its
# own Linux binaries without clobbering the host's.
set -euo pipefail

cd "$(dirname "$0")/.."
VER="$(node -p "require('@playwright/test/package.json').version")"
IMAGE="mcr.microsoft.com/playwright:v${VER}-noble"

exec docker run --rm \
    -v "$PWD":/work \
    -v /work/node_modules \
    -w /work \
    "$IMAGE" \
    bash -c "npm ci --no-audit --no-fund || npm ci --no-audit --no-fund; npx playwright test ${*:-}"
