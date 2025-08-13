#!/bin/bash

echo "🚀 Setting up CampusShare - Student Resource Sharing Platform"
echo "================================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB first."
    echo "   You can download it from: https://www.mongodb.com/try/download/community"
    echo "   Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
fi

# Check for port conflicts
echo "🔍 Checking for port conflicts..."
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 8000 is already in use. Please free up port 8000 or change it in backend/.env"
fi
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is already in use. Please free up port 3000 or change it in frontend/vite.config.js"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating backend environment file..."
    cp env.example .env
    echo "   Please edit backend/.env with your configuration"
fi

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "🎉 Setup complete! Here's what to do next:"
echo ""
echo "1. 📝 Configure your environment:"
echo "   - Edit backend/.env with your MongoDB URI and JWT secret"
echo ""
echo "2. 🗄️  Start MongoDB:"
echo "   - Make sure MongoDB is running on localhost:27017"
echo ""
echo "3. 🚀 Start the development servers:"
echo "   npm run dev"
echo ""
echo "   This will start:"
echo "   - Backend: http://localhost:8000"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "4. 🌐 Open your browser and visit:"
echo "   http://localhost:3000"
echo ""
echo "📚 For more information, check the README.md file"
echo ""
echo "Happy coding! 🎓✨"
