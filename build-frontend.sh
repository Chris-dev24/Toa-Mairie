#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================="
echo "  Toa-Mairie Frontend - Build Script"
echo "========================================="
echo ""

cd "$ROOT_DIR/frontend"

echo "📦 Installation des dépendances frontend..."
npm install

echo ""
echo "🔨 Construction du frontend pour la production..."
npm run build

echo ""
echo "✅ Build frontend complété!"
echo "Build output: $ROOT_DIR/frontend/build/"
echo ""
echo "Pour servir localement:"
echo "  cd $ROOT_DIR/frontend && npm install -g serve && serve -s build"
echo ""
