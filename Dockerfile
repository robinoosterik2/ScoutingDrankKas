FROM node:18 AS base
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY app/pnpm-lock.yaml app/package.json ./
RUN pnpm install --frozen-lockfile

COPY app .

FROM base AS builder
RUN pnpm run build

FROM node:18 AS production
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL=file:/var/data/prod.db

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/pnpm-lock.yaml /app/package.json ./
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/prisma ./prisma

RUN pnpm prisma generate

# Ensure Nitro output can resolve Prisma's generated engines
RUN mkdir -p .output/server/node_modules \
  && cp -R node_modules/.prisma .output/server/node_modules/.prisma

RUN pnpm store prune

EXPOSE 3000

# Run migrations against the SQLite file on the mounted disk, then start Nitro
CMD ["sh", "-c", "pnpm exec prisma migrate deploy || pnpm exec prisma db push; node .output/server/index.mjs"]
