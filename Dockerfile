# Stage 1: Base for both dev and prod
FROM node:18 AS base

WORKDIR /app

# Install dependencies first for better caching
COPY app/pnpm-lock.yaml app/package.json ./

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Use pnpm ci for faster, more reliable installs
RUN pnpm i --frozen-lockfile

# Copy the rest of the app

COPY app .

# Stage 2: Build for production
FROM base AS builder

RUN pnpm run build

# Stage 3: Production image
FROM node:18 AS production

WORKDIR /app

ENV NODE_ENV=production

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and install production dependencies
COPY --from=builder /app/pnpm-lock.yaml /app/package.json ./
RUN pnpm ci --only=production

# Copy built application
COPY --from=builder /app/.output ./.output

# Clean up pnpm cache to reduce image size
RUN pnpm cache clean --force

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
