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

# Rebuild better-sqlite3 manually (fix for missing bindings)
echo "Rebuilding better-sqlite3 manually..."
cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && npm run build-release && cd -

echo "Build complete."
