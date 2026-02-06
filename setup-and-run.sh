#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================="
echo "  Toa-Mairie - Complete Setup & Run"
echo "========================================="
echo ""

# Check prerequisites
echo "✓ Vérifying prerequisites..."
command -v node &> /dev/null || { echo "❌ Node.js not found"; exit 1; }
command -v npm &> /dev/null || { echo "❌ npm not found"; exit 1; }
command -v docker &> /dev/null && HAS_DOCKER=1 || HAS_DOCKER=0

echo "✓ Node: $(node -v)"
echo "✓ npm: $(npm -v)"
[ $HAS_DOCKER -eq 1 ] && echo "✓ Docker found" || echo "⚠ Docker not found - you'll need to setup PostgreSQL manually"
echo ""

# Option 1: Run with Docker Compose
if [ $HAS_DOCKER -eq 1 ] && command -v docker-compose &> /dev/null; then
  echo "🐳 Starting PostgreSQL via Docker Compose..."
  cd "$ROOT_DIR"
  docker-compose up -d
  sleep 3
  echo ""
fi

# Build and start backend
echo "🔨 Building and starting backend..."
cd "$ROOT_DIR/backend"
npm install --legacy-peer-deps
echo "Backend ready on http://localhost:5000"
echo "Starting: npm run dev"
npm run dev &
BACKEND_PID=$!
sleep 3

# Build and start frontend
echo ""
echo "🔨 Building frontend..."
cd "$ROOT_DIR/frontend"
npm install
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "========================================="
echo "  Application Ready"
echo "========================================="
echo ""
echo "Backend: http://localhost:5000/health"
echo "Frontend build: $ROOT_DIR/frontend/build/"
echo ""
echo "To run frontend dev server:"
echo "  cd $ROOT_DIR/frontend && npm start"
echo ""
echo "To serve production build:"
echo "  cd $ROOT_DIR/frontend && npx serve -s build"
echo ""
echo "Press Ctrl+C to stop backend"
echo ""

wait $BACKEND_PID
