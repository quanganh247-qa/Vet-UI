FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm install --legacy-peer-deps && \
    npm cache clean --force


# Copy .env file explicitly for better visibility
COPY .env ./

# Copy application code
COPY . .

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
# The shell form ensures proper variable expansion
CMD npm run start