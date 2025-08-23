#!/bin/bash

# GitHub Push Script for FDS Bengali PDF Statement System

echo "🚀 Pushing FDS Bengali PDF Statement System to GitHub..."
echo ""

# Check if remote is configured
if ! git remote -v | grep -q "origin"; then
    echo "❌ No remote 'origin' found. Adding remote..."
    git remote add origin https://github.com/habib7042/fds2.0.git
    echo "✅ Remote 'origin' added successfully"
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Found uncommitted changes. Committing..."
    git add .
    git commit -m "Update FDS Bengali PDF Statement System with Neon PostgreSQL setup"
    echo "✅ Changes committed"
fi

# Check current branch
current_branch=$(git branch --show-current)
echo "🌿 Current branch: $current_branch"

# Try to push
echo "📤 Pushing to GitHub..."
echo ""

# Try different push methods
echo "🔑 Method 1: Standard push"
git push origin master 2>/dev/null || {
    echo "❌ Standard push failed. Trying alternative methods..."
    echo ""
    
    echo "🔑 Method 2: Push with token (requires manual token input)"
    echo "Please enter your GitHub Personal Access Token:"
    read -s -p "Token: " token
    echo ""
    git push https://habib7042:$token@github.com/habib7042/fds2.0.git master || {
        echo "❌ Token push failed."
        echo ""
        echo "🔑 Method 3: Manual instructions"
        echo "Please run one of the following commands manually:"
        echo ""
        echo "1. If you have GitHub credentials configured:"
        echo "   git push origin master"
        echo ""
        echo "2. If you have a Personal Access Token:"
        echo "   git push https://YOUR_USERNAME:YOUR_TOKEN@github.com/habib7042/fds2.0.git master"
        echo ""
        echo "3. If you have GitHub CLI installed:"
        echo "   gh repo create habib7042/fds2.0 --public --source=. --remote=origin --push"
        echo ""
        exit 1
    }
}

echo ""
echo "🎉 Successfully pushed to GitHub!"
echo "📍 Repository: https://github.com/habib7042/fds2.0"
echo ""
echo "📋 Next steps:"
echo "1. Visit your GitHub repository to verify files"
echo "2. Connect to Vercel for deployment"
echo "3. Set up environment variables in Vercel"
echo "4. Deploy your application"