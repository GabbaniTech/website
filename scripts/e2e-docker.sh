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

ARGS="${*:-}"
RUN="npx playwright test ${ARGS}"
# A compare run also executes the visual-coverage gate, exactly like CI. On a
# baseline-update run there is nothing to compare, so the gate is skipped.
case "$ARGS" in
*--update-snapshots*) ;;
*) RUN="${RUN} && node scripts/check-visual.mjs" ;;
esac

# npm 11 occasionally aborts with "Exit handler never called"; one retry keeps
# the lockfile-strict install without flaking. Playwright only runs if install succeeds.
exec docker run --rm \
    -v "$PWD":/work \
    -v /work/node_modules \
    -w /work \
    "$IMAGE" \
    bash -c "(npm ci --no-audit --no-fund || npm ci --no-audit --no-fund) && ${RUN}"
