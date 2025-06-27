# Stage 1: Base for both dev and prod
FROM node:18 AS base

WORKDIR /app

# Install dependencies first for better caching
COPY app/package*.json ./

# Use npm ci for faster, more reliable installs
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy the rest of the app

COPY app .

# Stage 2: Build for production
FROM base AS builder
RUN npm run build

# Stage 3: Production image
FROM node:18 AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production --prefer-offline --no-audit --progress=false

# Copy built application
COPY --from=builder /app/.output ./.output

# Clean up npm cache to reduce image size
RUN npm cache clean --force

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
