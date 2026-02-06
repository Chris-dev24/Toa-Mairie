#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ERRORS=""

echo "=========================================="
echo "  Toa-Mairie - Full Build & Test Suite"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_error() {
  echo -e "${RED}❌ ERROR: $1${NC}"
  ERRORS="$ERRORS\n$1"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_info() {
  echo -e "${YELLOW}ℹ️  $1${NC}"
}

# ============ BACKEND SETUP ============
echo ""
echo "========== BACKEND =========="

cd "$ROOT_DIR/backend"

log_info "Installing backend dependencies..."
if npm install --silent 2>&1 | tail -n 5; then
  log_success "Backend dependencies installed"
else
  log_error "Failed to install backend dependencies"
fi

log_info "Running backend tests (single-threaded)..."
if npm test -- --runInBand --forceExit 2>&1 | tee backend-test-output.log | tail -n 20; then
  log_success "Backend tests passed"
else
  log_error "Backend tests failed (see backend-test-output.log for details)"
fi

# ============ FRONTEND SETUP ============
echo ""
echo "========== FRONTEND =========="

cd "$ROOT_DIR/frontend"

log_info "Installing frontend dependencies..."
if npm install --silent 2>&1 | tail -n 5; then
  log_success "Frontend dependencies installed"
else
  log_error "Failed to install frontend dependencies"
fi

log_info "Building frontend for production..."
if GENERATE_SOURCEMAP=false npm run build 2>&1 | tee frontend-build-output.log | tail -n 20; then
  log_success "Frontend build completed"
  if [ -d "$ROOT_DIR/frontend/build" ]; then
    BUILD_SIZE=$(du -sh "$ROOT_DIR/frontend/build" 2>/dev/null | cut -f1)
    log_success "Build artifacts generated ($BUILD_SIZE)"
  fi
else
  log_error "Frontend build failed (see frontend-build-output.log for details)"
fi

# ============ SUMMARY ============
echo ""
echo "========== SUMMARY =========="
echo ""

if [ -z "$ERRORS" ]; then
  echo -e "${GREEN}✅ All tasks completed successfully!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Start PostgreSQL (if not running):"
  echo "   docker-compose up -d"
  echo ""
  echo "2. Start backend:"
  echo "   cd backend && npm run dev"
  echo ""
  echo "3. Start frontend (dev mode with hot reload):"
  echo "   cd frontend && npm start"
  echo ""
  echo "4. Or serve production build:"
  echo "   cd frontend && npx serve -s build"
  echo ""
  echo "Application URLs:"
  echo "  - Backend:  http://localhost:5000"
  echo "  - Frontend: http://localhost:3000"
  echo "  - API:      http://localhost:5000/api"
  echo ""
else
  echo -e "${RED}❌ Some tasks failed:${NC}"
  echo -e "$ERRORS"
  echo ""
  echo "Log files:"
  echo "  - backend-test-output.log"
  echo "  - frontend-build-output.log"
  exit 1
fi

echo ""
