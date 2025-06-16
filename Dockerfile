# Stage 1: Base for both dev and prod
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies first for better caching
COPY app/package*.json ./
<<<<<<< HEAD

# Use npm ci for faster, more reliable installs
RUN npm ci --prefer-offline --no-audit --progress=false
=======
# COPY .env .env
RUN npm install
>>>>>>> master

# Copy the rest of the app

COPY app .

# Stage 2: Build for production
FROM base AS builder
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production --prefer-offline --no-audit --progress=false

# Install additional required packages for production
RUN npm install @azure/msal-node node-fetch

# Copy built application
COPY --from=builder /app/.output ./.output
<<<<<<< HEAD

# Clean up npm cache to reduce image size
RUN npm cache clean --force
=======
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/.env .env 
>>>>>>> master

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
