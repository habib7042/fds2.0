#!/bin/bash

echo "🚀 Pushing FDS Bengali PDF Statement System to GitHub..."
echo "Repository: https://github.com/habib7042/fds2.0"
echo ""

# Check if token is provided
if [ -z "$1" ]; then
    echo "❌ Error: No token provided"
    echo "Usage: ./push-with-token.sh YOUR_GITHUB_TOKEN"
    echo ""
    echo "To get a GitHub Personal Access Token:"
    echo "1. Go to GitHub → Settings → Developer settings → Personal access tokens"
    echo "2. Generate new token with 'repo' permissions"
    echo "3. Copy the token and run this script with it"
    exit 1
fi

TOKEN=$1
REPO_URL="https://habib7042:$TOKEN@github.com/habib7042/fds2.0.git"

echo "🔑 Using provided token to authenticate..."
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "📡 Adding remote 'origin'..."
    git remote add origin https://github.com/habib7042/fds2.0.git
fi

# Check current branch
current_branch=$(git branch --show-current)
echo "🌿 Current branch: $current_branch"

# Show recent commits
echo ""
echo "📋 Recent commits:"
git log --oneline -3

# Try to push
echo ""
echo "🚀 Pushing to GitHub..."
echo "Repository: https://github.com/habib7042/fds2.0"
echo ""

git push $REPO_URL master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🔗 Repository: https://github.com/habib7042/fds2.0"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Visit your repository on GitHub"
    echo "2. Connect to Vercel for deployment"
    echo "3. Set up environment variables in Vercel"
    echo "4. Deploy your application"
    echo ""
    echo "🎉 Your FDS Bengali PDF Statement System is now live on GitHub!"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "1. Your token has 'repo' permissions"
    echo "2. Your token is valid and not expired"
    echo "3. You have write access to the repository"
    echo ""
    echo "You can also try manually:"
    echo "git push https://habib7044:$TOKEN@github.com/habib7042/fds2.0.git master"
fi