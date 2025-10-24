#!/bin/bash

echo "🚀 Starting Secure Messaging Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   You can start it with: mongod"
    exit 1
fi

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter is not installed. Please install Flutter first."
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install Flutter dependencies
echo "📦 Installing Flutter dependencies..."
cd flutter_app
flutter pub get
cd ..

# Start the application
echo "🎯 Starting the application..."
echo "   Backend will be available at: http://localhost:3000"
echo "   API documentation at: http://localhost:3000/api"
echo "   Flutter app will start automatically"
echo ""

# Start both backend and Flutter
npm run dev