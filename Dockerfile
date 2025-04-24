# Stage 1: Base for both dev and prod
FROM node:18 AS base

WORKDIR /app

# Copy package files and install dependencies
COPY app/package*.json ./
# COPY .env .env
RUN npm install

# Copy the rest of the app

COPY app .

# Stage 2: Build for production
FROM base AS builder
RUN npm run build

# Stage 3: Production image
FROM node:18-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/.env .env 

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
