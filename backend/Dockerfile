# =============================================================
# Backend Dockerfile — Multi-stage build
# AI Mock Interview Platform
# =============================================================

# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ libc6-compat

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# ---- Stage 2: Builder ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source
COPY src/ ./src/

# ---- Stage 3: Production Runner ----
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy production deps from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source from builder
COPY --from=builder /app/src ./src
COPY package.json ./

# Create directories for uploads and logs
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "src/server.js"]
