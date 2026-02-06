#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "== Toa-Mairie: Running backend tests =="
cd "$ROOT_DIR/backend"

# Install dependencies (prefer ci when lockfile exists)
if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then
    echo "Using npm ci"
    npm ci
else
    echo "Using npm install"
    npm install
fi

# Run Jest tests (single thread to avoid DB lock issues in CI)
npm test -- --runInBand --detectOpenHandles

echo "== Tests finished =="
