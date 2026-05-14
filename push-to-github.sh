#!/bin/bash
set -e

REPO_URL="https://code-with-bindu:$GITHUB_PAT@github.com/code-with-bindu/Civic-Report.git"
TEMP_DIR=$(mktemp -d)

echo "==> Copying project files..."
cp -r . "$TEMP_DIR"

# Remove junk
rm -rf "$TEMP_DIR/node_modules" \
       "$TEMP_DIR/.local" \
       "$TEMP_DIR/attached_assets" \
       "$TEMP_DIR/mockup-sandbox" \
       "$TEMP_DIR/.git" \
       "$TEMP_DIR/.cache" \
       "$TEMP_DIR/.config" \
       "$TEMP_DIR/.upm" \
       "$TEMP_DIR/.replit"

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
