#!/bin/bash
set -e

echo "Building ScoutingDrankKas..."

# Note: This script should be run from the app directory

# Install dependencies using pnpm
echo "Installing dependencies..."
pnpm install

# Generate Prisma Client
# This ensures that the Prisma client is up-to-date with your schema
echo "Generating Prisma Client..."
pnpm prisma generate

# Build the application
echo "Building Nuxt app..."
pnpm run build

# Ensure better-sqlite3 native bindings are available
echo "Ensuring better-sqlite3 native bindings..."

# First, rebuild better-sqlite3 if needed
BETTER_SQLITE_DIR=$(ls -d node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 2>/dev/null | head -1)
if [ -z "$BETTER_SQLITE_DIR" ]; then
    echo "Error: Could not find better-sqlite3 in node_modules"
    exit 1
fi

# Check if bindings exist, if not rebuild
if [ ! -f "$BETTER_SQLITE_DIR/build/Release/better_sqlite3.node" ]; then
    echo "Rebuilding better-sqlite3..."
    (cd "$BETTER_SQLITE_DIR" && npm run build-release)
fi

# Copy the bindings to .output/server/node_modules/better-sqlite3
OUTPUT_SQLITE_DIR=".output/server/node_modules/better-sqlite3"
if [ -d "$OUTPUT_SQLITE_DIR" ]; then
    echo "Copying native bindings to production output..."
    mkdir -p "$OUTPUT_SQLITE_DIR/build/Release"
    cp "$BETTER_SQLITE_DIR/build/Release/better_sqlite3.node" "$OUTPUT_SQLITE_DIR/build/Release/"
    echo "Native bindings copied successfully."
else
    echo "Warning: $OUTPUT_SQLITE_DIR not found. Bindings not copied."
fi

echo "Build complete."
