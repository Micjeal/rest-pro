# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Build Next.js app with Supabase credentials
RUN NEXT_PUBLIC_SUPABASE_URL=https://xuawchaomdqrtkykayjo.supabase.co \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1YXdjaGFvbWRxcnRreWtheWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyODkwMDcsImV4cCI6MjA4NTg2NTAwN30.XSGBoQ0Fi25O5NGe4kkVHRcYba3DWUlyQXRoHj4SVKc \
    pnpm build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm in runtime image
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start app
CMD ["pnpm", "start"]
