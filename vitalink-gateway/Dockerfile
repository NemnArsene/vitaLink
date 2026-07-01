# ============================================================================
# Multi-stage Dockerfile for VitaLink API Gateway
# ============================================================================

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files first (for Docker cache)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

# Security: run as non-root
RUN addgroup -g 1001 -S vitalink && \
    adduser -S vitalink -u 1001

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy .env example as reference
COPY .env.example ./.env.example

# Set ownership
RUN chown -R vitalink:vitalink /app

USER vitalink

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

EXPOSE 3000

CMD ["node", "dist/main"]
