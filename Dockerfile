# Use Node.js image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for dependency caching
COPY package*.json ./

RUN npm ci --ignore-scripts

# 👇 Copy Prisma schema before generating
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# 👇 Now copy the rest of your source files
COPY . .

# Build your app if needed
RUN npm run build

# Final image
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./
CMD ["npm", "start"]
