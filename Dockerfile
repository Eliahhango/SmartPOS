FROM node:18-slim

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json ./
COPY backend/prisma ./prisma
RUN npm install

# Prisma generate needs DATABASE_URL to resolve the provider during build
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate

COPY backend/ .

EXPOSE 5000

# Use binary engine type to avoid OpenSSL compatibility issues
ENV PRISMA_CLIENT_ENGINE_TYPE="binary"
ENV PRISMA_CLI_QUERY_ENGINE_TYPE="binary"

CMD npx prisma db push --accept-data-loss && node prisma/seed.js && node src/index.js
