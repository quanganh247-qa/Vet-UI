# Build stage
FROM node:20-alpine as build-stage

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
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

# Production stage with Nginx
FROM nginx:alpine

# Copy the nginx configuration
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built files from build stage - only the dist directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Set default port (Railway will override this)
ENV PORT=80

# Let nginx substitute environment variables
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d

# Expose the port
EXPOSE ${PORT}

# Start nginx
CMD ["nginx", "-g", "daemon off;"]