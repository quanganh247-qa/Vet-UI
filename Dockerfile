FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm install --legacy-peer-deps && \
    npm install serve --save && \
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

# Expose port
EXPOSE ${PORT}

# Create non-root user and set permissions
RUN adduser -S appuser && chown -R appuser /usr/src/app

# Switch to non-root user
USER appuser

# Run the app using Vite's preview server (production mode)
CMD ["npm", "run", "start"]