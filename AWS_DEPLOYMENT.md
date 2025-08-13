# 🚀 CampusShare AWS Deployment Guide

This guide will help you deploy your CampusShare application to AWS EC2 using a simple, straightforward approach.

## 📋 Prerequisites

- AWS Account
- GitHub repository access
- Basic knowledge of AWS EC2

## 🎯 Step-by-Step Deployment

### 1. Launch EC2 Instance

1. **Go to AWS Console** → **EC2** → **Launch Instance**
2. **Choose AMI**: Ubuntu 22.04 LTS (free tier eligible)
3. **Instance Type**: t2.micro (free tier) or t3.small for better performance
4. **Configure Security Group**:
   - SSH (Port 22) - Your IP
   - HTTP (Port 80) - Anywhere (0.0.0.0/0)
   - Custom TCP (Port 8000) - Anywhere (0.0.0.0/0)
5. **Key Pair**: Create or select existing key pair
6. **Launch Instance**

### 2. Connect to Your EC2 Instance

```bash
# Replace with your key file and instance IP
ssh -i your-key.pem ubuntu@your-instance-ip
```

### 3. Run the Setup Script

```bash
# Clone your repository
git clone git@github.com:uday-samsani/campus-share.git /var/www/campus-share

# Navigate to the directory
cd /var/www/campus-share

# Make scripts executable
chmod +x scripts/*.sh

# Run the EC2 setup script
./scripts/setup-ec2.sh
```

### 4. Configure Environment Variables

```bash
# Run the environment setup script (from repository root)
./scripts/setup-env.sh

# Edit the .env file with your actual values
nano backend/.env
```

**Required Environment Variables:**
```bash
NODE_ENV=production
PORT=8000
JWT_SECRET=your_generated_secret_here
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_s3_bucket_name
```

### 5. Deploy Your Application

```bash
# Install all dependencies
npm run install:all

# Deploy to production
npm run deploy:aws
```

### 6. Access Your Application

Your application will be available at:
- **Frontend**: `http://your-ec2-public-ip`
- **Backend API**: `http://your-ec2-public-ip/api`

## 🔄 Updating Your Application

To deploy updates:

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Navigate to app directory
cd /var/www/campus-share

# Pull latest changes and redeploy
git pull origin main
npm run deploy:aws
```

## 🛠️ Useful Commands

```bash
# Check backend status
pm2 status

# View backend logs
pm2 logs campus-share-backend

# Restart backend
pm2 restart campus-share-backend

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔧 Troubleshooting

### Backend not starting?
```bash
cd /var/www/campus-share/backend
pm2 logs campus-share-backend
```

### Frontend not loading?
```bash
sudo nginx -t
sudo systemctl status nginx
```

### Permission issues?
```bash
sudo chown -R ubuntu:ubuntu /var/www/campus-share
```

## 💰 Cost Optimization

- Use t2.micro (free tier) for development
- Consider t3.small for production
- Use Spot Instances for cost savings
- Set up billing alerts

## 🔒 Security Notes

- Keep your AWS credentials secure
- Regularly update your JWT secret
- Monitor your security groups
- Consider setting up AWS CloudWatch for monitoring

## 📞 Support

If you encounter issues:
1. Check the logs using the commands above
2. Verify your environment variables
3. Ensure your security groups allow the necessary ports
4. Check that your AWS credentials have the required permissions

---

**Happy Deploying! 🎉**
