# Stage 1: Build
FROM node:18 as builder

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# Only install production dependencies during build
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Production
FROM node:18-slim

WORKDIR /app

ENV NODE_ENV=production

# Copy only built app and necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["npm", "start"]

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
	CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1
