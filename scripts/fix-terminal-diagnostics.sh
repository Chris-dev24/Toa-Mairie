#!/usr/bin/env bash
set -euo pipefail

# Diagnostic helper to collect environment info useful for resolving ENOPRO filesystem errors
OUT_DIR="$(pwd)/diagnostics"
mkdir -p "$OUT_DIR"

echo "Collecting diagnostics in $OUT_DIR"

# Basic environment
uname -a > "$OUT_DIR/uname.txt" 2>&1 || true
whoami > "$OUT_DIR/whoami.txt" 2>&1 || true
id > "$OUT_DIR/id.txt" 2>&1 || true

# Node / npm
node -v > "$OUT_DIR/node_version.txt" 2>&1 || true
npm -v > "$OUT_DIR/npm_version.txt" 2>&1 || true

# List workspace root
ls -la . > "$OUT_DIR/ls_root.txt" 2>&1 || true

# Check for VSCode remote server presence
if [ -d "/root/.vscode-server" ] || [ -d "/home/$USER/.vscode-server" ]; then
  echo "vscode-server found" > "$OUT_DIR/vscode_server.txt"
else
  echo "vscode-server not found" > "$OUT_DIR/vscode_server.txt"
fi

# Check docker
if command -v docker &> /dev/null; then
  docker --version > "$OUT_DIR/docker_version.txt" 2>&1 || true
  docker ps -a > "$OUT_DIR/docker_ps.txt" 2>&1 || true
fi

# Try a simple node operation
node -e "console.log('node ok')" > "$OUT_DIR/node_test.txt" 2>&1 || true

# Permissions check on workspace
stat . > "$OUT_DIR/stat_root.txt" 2>&1 || true

# Print summary
echo "Diagnostics collected. Please inspect the files in $OUT_DIR and share them." 
