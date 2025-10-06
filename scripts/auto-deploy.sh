#!/bin/bash

# Auto-deploy script for Cellestial AI
echo "🚀 Starting auto-deployment to Firebase hosting..."

# Build the project
echo "📦 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Firebase hosting
    echo "🌐 Deploying to Firebase hosting..."
    firebase deploy --only hosting:cellestial-ai
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "🌍 Your app is live at: https://cellestial-ai.web.app"
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi

