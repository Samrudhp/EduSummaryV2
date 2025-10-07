#!/bin/bash

echo "🚀 Starting EduSummary Frontend..."
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎯 Starting Vite development server..."
echo "📍 Frontend will be available at: http://localhost:5173"
echo ""

# Run the dev server
npm run dev
