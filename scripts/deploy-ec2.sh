#!/bin/bash

# CampusShare EC2 Deployment Script
# This script deploys the application to the EC2 instance

echo "🚀 Deploying CampusShare to EC2..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 Project root: $PROJECT_ROOT"

# Navigate to project root
cd "$PROJECT_ROOT"

# Pull latest changes from Git
echo "📥 Pulling latest changes from Git..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build:prod
cd "$PROJECT_ROOT"

# Restart backend with PM2
echo "🔄 Restarting backend..."
cd backend
pm2 delete campus-share-backend 2>/dev/null || true
pm2 start server.js --name "campus-share-backend" --env production
pm2 save
cd "$PROJECT_ROOT"

# Reload Nginx
echo "🌐 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌐 Your app is now running at: http://$(curl -s ifconfig.me)"
echo "📱 Backend status: pm2 status"
