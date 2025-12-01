# Node.js Version Upgrade Required

## Current Issue

Your current Node.js version is **18.16.0**, but Next.js 15 requires **Node.js >= 18.18.0**.

## Solution: Upgrade Node.js

### Option 1: Using nvm (Recommended)

If you have nvm (Node Version Manager) installed:

```bash
# Install the latest LTS version
nvm install --lts

# Use the latest LTS version
nvm use --lts

# Set it as default
nvm alias default node
```

### Option 2: Using Homebrew (macOS)

```bash
# Update Homebrew
brew update

# Upgrade Node.js
brew upgrade node

# Verify the version
node --version
```

### Option 3: Download from nodejs.org

1. Visit [https://nodejs.org](https://nodejs.org)
2. Download the LTS version (recommended)
3. Install the package
4. Verify: `node --version`

## Recommended Versions

- **Minimum**: Node.js 18.18.0
- **Recommended**: Node.js 20.x LTS or Node.js 22.x LTS
- **Current**: Node.js 23.x (latest)

## After Upgrading

1. Verify your Node.js version:
```bash
node --version
```

2. Reinstall dependencies:
```bash
cd /Users/samueladdis/Documents/cursor/alic/inventory-management-system
rm -rf node_modules package-lock.json
npm install
```

3. Try building again:
```bash
npm run build
```

## Alternative: Downgrade Next.js (Not Recommended)

If you cannot upgrade Node.js, you could downgrade Next.js to version 14:

```bash
npm install next@14 react@18 react-dom@18
```

However, this is **not recommended** as you'll miss out on Next.js 15 features and improvements.

