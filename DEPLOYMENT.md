# Deployment Guide for VetDashboard

This guide will help you deploy your application without encountering 502 errors.

## Prerequisites

- Docker installed on your system
- Access to your hosting provider (Railway, Heroku, etc.)

## Deployment Steps

### 1. Environment Setup

Create a `.env` file in your project root with:

```
# API Configuration
VITE_API_URL=https://go-pet-care-production.up.railway.app

# Server Configuration
PORT=3000
NODE_ENV=production

# Additional settings
TLS_INSECURE_SKIP_VERIFY=true
```

### 2. Build and Deploy

```bash
# Build the Docker image
docker build -t vetdashboard .

# Run locally to test
docker run -p 3000:3000 --env-file .env vetdashboard

# Deploy to your hosting provider
# For Railway:
railway up

# For Heroku:
heroku container:push web
heroku container:release web
```

### 3. Troubleshooting 502 Errors

If you still encounter 502 errors:

1. **Check API connectivity**: Verify that your backend API is accessible from your deployment environment
2. **Check CORS settings**: Ensure your backend allows requests from your frontend domain
3. **Check timeout settings**: The Caddyfile now includes increased timeouts, which should help
4. **Check logs**: Use `docker logs <container_id>` to view detailed logs

### 4. Common Issues and Solutions

- **API Connection Timeout**: The updated Caddyfile includes better timeout handling
- **CORS Issues**: The Caddyfile includes proper CORS headers
- **SSL/TLS Issues**: Added `tls_insecure_skip_verify` to handle self-signed certificates
- **Health Check Failures**: Added a dedicated health endpoint

### 5. Verifying Deployment

After deployment, visit:
- Your main application: `https://your-domain.com`
- Health check endpoint: `https://your-domain.com/health` (should return "OK")

## Additional Resources

- [Caddy Documentation](https://caddyserver.com/docs/)
- [Docker Deployment Guide](https://docs.docker.com/get-started/04_sharing_app/)
- [Railway Deployment](https://docs.railway.app/deploy/dockerfiles) 