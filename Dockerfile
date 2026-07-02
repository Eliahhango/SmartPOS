FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
COPY backend/prisma ./prisma
RUN npm install

# Prisma generate needs DATABASE_URL to resolve the provider during build
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate

COPY backend/ .

EXPOSE 5000

CMD npx prisma db push --accept-data-loss && node prisma/seed.js && node src/index.js
