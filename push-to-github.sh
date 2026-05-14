#!/bin/bash
set -e

REPO_URL="https://code-with-bindu:$GITHUB_PAT@github.com/code-with-bindu/Civic-Report.git"
TEMP_DIR=$(mktemp -d)

echo "==> Copying project files (excluding node_modules, dist, caches)..."
rsync -a \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='.local' \
  --exclude='.cache' \
  --exclude='.config' \
  --exclude='.upm' \
  --exclude='.replit' \
  --exclude='attached_assets' \
  --exclude='mockup-sandbox' \
  --exclude='*.map' \
  . "$TEMP_DIR/"

echo "==> Initializing fresh git repo..."
cd "$TEMP_DIR"
git init
git config user.email "you@example.com"
git config user.name "code-with-bindu"
git add -A
git commit -m "Clean push from Replit"

echo "==> Force pushing to GitHub..."
git remote add origin "$REPO_URL"
git push origin HEAD:main --force

echo "==> Cleaning up..."
rm -rf "$TEMP_DIR"
echo "Done!"
