# builder: install dev deps and build
FROM node:20-alpine AS builder
WORKDIR /app

# copy lock + package for reproducible install
COPY package*.json ./

# install all deps (dev + prod) so tsc is available for build
RUN npm ci

# copy sources and build
COPY . .
RUN npm run build

# runtime: only production deps, skip scripts (we already built)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# copy package files so we can install production deps
COPY package*.json ./

# install only production deps and ignore lifecycle scripts (skip postinstall/build)
RUN npm ci --only=production --ignore-scripts

# copy built output and any runtime files
COPY --from=builder /app/dist ./dist
# copy other runtime assets (env, public, views, etc.) as needed
# COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "dist/index.js"]
