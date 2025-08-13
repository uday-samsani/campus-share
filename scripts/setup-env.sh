#!/bin/bash

# CampusShare Environment Setup Script
# This script sets up environment variables for the application

echo "🔐 Setting up environment variables for CampusShare..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 Project root: $PROJECT_ROOT"

# Create .env file for backend
cat > "$PROJECT_ROOT/backend/.env" << 'EOF'
NODE_ENV=production
PORT=8000
JWT_SECRET=your_super_secure_jwt_secret_here_change_this_in_production
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=campus-share-bucket
EOF

echo "✅ Environment file created at $PROJECT_ROOT/backend/.env"
echo ""
echo "⚠️  IMPORTANT: Please update the .env file with your actual values:"
echo "   - JWT_SECRET: Generate a secure random string"
echo "   - AWS_ACCESS_KEY_ID: Your AWS access key"
echo "   - AWS_SECRET_ACCESS_KEY: Your AWS secret key"
echo "   - AWS_REGION: Your preferred AWS region"
echo "   - AWS_S3_BUCKET_NAME: Your S3 bucket name"
echo ""
echo "🔑 To generate a secure JWT secret, run:"
echo "   openssl rand -base64 32"
