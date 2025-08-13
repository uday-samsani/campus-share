#!/bin/bash

# CampusShare EC2 Setup Script
# This script sets up a fresh EC2 instance for deployment

echo "🚀 Setting up CampusShare on EC2..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install AWS CLI
echo "☁️ Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

# Install Docker (optional, for containerization)
echo "🐳 Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/campus-share
sudo chown $USER:$USER /var/www/campus-share

# Setup Nginx configuration
echo "⚙️ Setting up Nginx configuration..."
sudo tee /etc/nginx/sites-available/campus-share > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    root /var/www/campus-share/frontend/dist;
    index index.html;

    # Frontend routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Enable site and restart Nginx
sudo ln -sf /etc/nginx/sites-available/campus-share /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup firewall
echo "🔥 Setting up firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Setup PM2 startup
echo "📱 Setting up PM2 startup..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Create environment setup script
echo "🔐 Creating environment setup script..."
cat > /var/www/campus-share/setup-env.sh <<'EOF'
#!/bin/bash
echo "🔐 Setting up environment variables..."

# Create .env file for backend
cat > /var/www/campus-share/backend/.env <<'ENVEOF'
NODE_ENV=production
PORT=8000
JWT_SECRET=your_super_secure_jwt_secret_here
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=campus-share-bucket
ENVEOF

echo "✅ Environment file created at /var/www/campus-share/backend/.env"
echo "⚠️  Please update the .env file with your actual AWS credentials!"
EOF

chmod +x /var/www/campus-share/setup-env.sh

echo "✅ EC2 setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Clone your repository: git clone <your-repo> /var/www/campus-share"
echo "2. Run: cd /var/www/campus-share && npm run install:all"
echo "3. Update environment variables: ./setup-env.sh"
echo "4. Deploy: npm run deploy:aws"
echo ""
echo "🌐 Your app will be available at: http://$(curl -s ifconfig.me)"
