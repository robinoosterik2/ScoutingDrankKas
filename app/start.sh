#!/bin/bash
set -e

echo "Starting ScoutingDrankKas..."

# Note: This script should be run from the app directory

# Check if build output exists
if [ ! -d ".output" ]; then
    echo "Error: .output directory not found. Please run ./build.sh first."
    exit 1
fi

# Start the Node.js server with dotenv variables loaded
node -r dotenv/config .output/server/index.mjs
