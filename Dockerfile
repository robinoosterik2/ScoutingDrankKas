# Stage 1: Base for both dev and prod
FROM node:20 AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Stage 2: Build for production
FROM base AS builder
RUN npm run build

# Stage 3: Production image
FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
	CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1
