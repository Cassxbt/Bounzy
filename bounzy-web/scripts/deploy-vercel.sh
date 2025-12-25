#!/bin/bash

#############################################
#  Bounzy Web - Vercel Deployment Script
#############################################

set -e

echo "🚀 Bounzy Web - Vercel Deployment"
echo "=================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI found"
fi

# Navigate to project directory
cd "$(dirname "$0")/.."

# Ensure node_modules are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run build to validate before deployment
echo ""
echo "🔨 Running production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo ""
echo "📤 Deploying to Vercel..."
echo ""

# Check for production flag
if [ "$1" == "--prod" ] || [ "$1" == "-p" ]; then
    echo "🌐 Deploying to PRODUCTION..."
    vercel --prod
else
    echo "🧪 Deploying PREVIEW (use --prod for production)..."
    vercel
fi

echo ""
echo "✅ Deployment complete!"
