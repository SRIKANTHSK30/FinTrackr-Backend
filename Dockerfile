# Use an official Node image that includes npm
FROM node:18-alpine AS builder
WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

# If there's no package-lock.json, fall back to npm install
RUN if [ -f package-lock.json ]; then \
      npm ci --only=production; \
    else \
      npm install --only=production; \
    fi && npm cache clean --force

# Copy application sources (after installing deps for layer caching)
COPY . .

# If you have a build step (adjust or remove if not needed)
# RUN npm run build

# Final runtime image (smaller)
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy app + node_modules from builder
COPY --from=builder /app /app

# Expose port and start command - adjust to your app entrypoint
EXPOSE 3000
CMD ["node", "dist/index.js"]
