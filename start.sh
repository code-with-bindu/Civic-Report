#!/bin/bash
set -e

# Build the API server
cd /home/runner/workspace/backend
pnpm run build

# Start the API server in the background on port 8080
PORT=8080 node --enable-source-maps ./dist/index.mjs &
API_PID=$!

# Start the frontend on port 5000
cd /home/runner/workspace/frontend
PORT=5000 API_PORT=8080 pnpm run dev

# If frontend exits, kill the API server too
kill $API_PID 2>/dev/null || true
