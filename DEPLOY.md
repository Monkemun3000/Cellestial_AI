# 🚀 Deploy to Firebase Hosting

## Quick Deploy Commands

### Option 1: Deploy Script (Recommended)
```bash
npm run deploy
```
This will:
- ✅ Build the project
- ✅ Deploy to Firebase hosting
- ✅ Show deployment status
- ✅ Display live URL

### Option 2: Direct Firebase Deploy
```bash
firebase deploy --only hosting:cellestial-ai
```

### Option 3: Build and Deploy Separately
```bash
npm run build
firebase deploy --only hosting:cellestial-ai
```

## Live App URL
🌍 **https://cellestial-ai.web.app**

## Firebase Console
🔧 **https://console.firebase.google.com/project/cellestialai/overview**

## Workflow
1. Make changes to your code
2. Run `npm run deploy`
3. Your changes are live! 🎉

## What Gets Deployed
- ✅ Static files from `out/` directory
- ✅ All CSS and JavaScript assets
- ✅ NASA background images
- ✅ Firebase configuration
- ✅ All UI components and features
