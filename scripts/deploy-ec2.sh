#!/bin/bash

# CampusShare EC2 Deployment Script
# This script deploys the application to the EC2 instance

echo "🚀 Deploying CampusShare to EC2..."

# Navigate to application directory
cd /var/www/campus-share

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
cd ..

# Restart backend with PM2
echo "🔄 Restarting backend..."
cd backend
pm2 delete campus-share-backend 2>/dev/null || true
pm2 start server.js --name "campus-share-backend" --env production
pm2 save
cd ..

# Reload Nginx
echo "🌐 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌐 Your app is now running at: http://$(curl -s ifconfig.me)"
echo "📱 Backend status: pm2 status"
