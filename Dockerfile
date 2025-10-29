# builder: install dev deps and build
FROM node:20-alpine AS builder
WORKDIR /app

# copy only package files for layer caching
COPY package*.json ./

# install all deps but don't run lifecycle scripts (prevents postinstall tsc running before sources exist)
RUN npm ci --ignore-scripts

# now copy source and run the build
COPY . .
RUN npm run build

# runtime image: only production deps, ignore scripts (build already done)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# copy built output and any runtime assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/index.js"]
