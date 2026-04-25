# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy Prisma schema and configuration
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code and config files
COPY src ./src/
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Build the NestJS application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy generated Prisma client from builder
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port (Koyeb uses the PORT environment variable)
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
