# Multi-Stage Build Dockerfile for Vignette.ai TS Backend

# Stage 1: Build compilation
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
COPY prompts/ ./prompts/
COPY server.ts ./
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /usr/src/app/dist ./dist
# Include prompts/ in output if compiled or required dynamically
COPY --from=builder /usr/src/app/dist/prompts ./prompts

EXPOSE 5000
CMD ["node", "dist/server.js"]
