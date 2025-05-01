FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm install --legacy-peer-deps && \
    npm cache clean --force

# Copy application code
COPY . .

# Set build arguments as environment variables
ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}

# Build the application
RUN npm run build

# Set default port (Railway will override this)
ENV PORT=5173

# Stage 3: Production environment
FROM nginx:alpine AS production

# Copy the production build artifacts from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose the default NGINX port
EXPOSE ${PORT}
CMD ["nginx", "-g", "daemon off;"]