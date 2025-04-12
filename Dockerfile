# Stage 1: Base for both dev and prod
FROM node:18 AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

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
COPY ./utils/db.js /docker-entrypoint-initdb.d/db.js


EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]