#!/bin/bash

echo "🚀 Pushing to GitHub..."
echo "Repository: https://github.com/habib7042/fds2.0"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Error: No remote 'origin' found"
    echo "Adding remote..."
    git remote add origin https://github.com/habib7042/fds2.0.git
fi

# Check current branch
current_branch=$(git branch --show-current)
echo "📁 Current branch: $current_branch"

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: There are uncommitted changes"
    echo "Please commit them first:"
    echo "  git add ."
    echo "  git commit -m 'Your commit message'"
    exit 1
fi

# Show recent commits
echo ""
echo "📋 Recent commits:"
git log --oneline -5

# Try to push
echo ""
echo "🚀 Pushing to GitHub..."
echo "If prompted, please enter your GitHub credentials or Personal Access Token"
echo ""

git push origin master

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
else
    echo ""
    echo "❌ Push failed. Please check your credentials or try:"
    echo "  git push https://YOUR_USERNAME:YOUR_TOKEN@github.com/habib7042/fds2.0.git master"
fi