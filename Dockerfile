# === BUILD STAGE ===
FROM node:lts-alpine AS build

ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false
# Set API URL environment variable for the build
ENV VITE_API_URL=https://go-pet-care-production.up.railway.app

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps --production

COPY . ./
RUN npm run build

# === SERVE STAGE ===
FROM caddy:latest

WORKDIR /app

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

COPY Caddyfile ./
RUN caddy fmt Caddyfile --overwrite

COPY --from=build /app/dist /app/dist

# Health check to ensure Caddy is running properly
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Run Caddy with clear error logging
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]

