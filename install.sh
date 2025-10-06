#!/bin/bash

echo "🚀 Setting up Cellestial AI..."

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

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating environment file..."
    cat > .env.local << EOF
# NASA API Configuration
NASA_API_KEY=DEMO_KEY

# Get your free NASA API key at: https://api.nasa.gov/
# Replace DEMO_KEY with your actual API key for better rate limits
EOF
    echo "✅ Environment file created (.env.local)"
    echo "📝 Please edit .env.local and add your NASA API key"
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "To get a NASA API key (optional but recommended):"
echo "  Visit: https://api.nasa.gov/"
echo "  Add your key to .env.local"
