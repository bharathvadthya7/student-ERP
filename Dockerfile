# Use Node.js 22 LTS with built-in SQLite support
FROM node:22-alpine

WORKDIR /app

# Copy dependency manifests
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies for both backend and frontend
RUN npm run install:all

# Copy entire source tree
COPY . .

# Build React + TypeScript bundle into frontend/dist
RUN npm run build

# Expose standard port
ENV PORT=5000
EXPOSE 5000

# Start Express server (serves both API & Frontend SPA)
CMD ["npm", "start"]
