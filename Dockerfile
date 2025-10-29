# Stage: builder (has npm)
FROM node:18-alpine AS builder
WORKDIR /app

# copy lock + package for layer caching
COPY package*.json ./

# Debug: confirm node/npm exist (remove after you verify)
RUN node -v && npm -v

# Install production dependencies (npm ci requires package-lock.json)
RUN if [ -f package-lock.json ]; then \
      npm ci --only=production; \
    else \
      npm install --only=production; \
    fi && npm cache clean --force

# Copy app sources
COPY . .

# Optional build step (uncomment if your project builds)
# RUN npm run build

# Stage: runtime (smaller)
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy app + deps from builder
COPY --from=builder /app /app

EXPOSE 3000
# Adjust to your actual start command / file
CMD ["node", "dist/index.js"]
