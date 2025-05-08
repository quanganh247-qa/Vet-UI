# === BUILD STAGE ===
FROM node:lts-alpine AS build

ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . ./
RUN npm run build

# === SERVE STAGE ===
FROM caddy:latest

WORKDIR /app

COPY Caddyfile ./
RUN caddy fmt Caddyfile --overwrite

COPY --from=build /app/dist ./dist

# Optional: For better debugging in dev
CMD ["caddy", "run", "--config", "Caddyfile"]