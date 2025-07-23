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

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/pnpm-lock.yaml /app/package.json ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/.output ./.output

RUN pnpm store prune

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]