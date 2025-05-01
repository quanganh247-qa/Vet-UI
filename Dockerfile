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

# Use same base image for production
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install serve globally
RUN npm install -g serve && \
    npm cache clean --force

# Copy built files from build stage
COPY --from=build-stage /app/dist ./dist

# Set default port (Railway will override this)
ENV PORT=5173

# Expose the port
EXPOSE ${PORT}

# Create non-root user for security
RUN adduser -S appuser && chown -R appuser /app

# Switch to non-root user
USER appuser

# Use shell form to properly expand PORT variable
CMD serve -s . -l ${PORT}
