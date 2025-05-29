# Render.com Deployment Setup Guide

## 🚨 IMPORTANT: Server Module Error Fix

If you're getting "Cannot find module 'express'" error, it means Render is using the wrong directory configuration.

## 🔧 Correct Render Service Configuration

### Method 1: Set Root Directory (Recommended)
1. **Repository**: `rajyaabhishek/ECaseFill`
2. **Root Directory**: `server` ⚠️ **This is critical!**
3. **Environment**: `Node`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`

### Method 2: Alternative Commands (if Root Directory doesn't work)
1. **Repository**: `rajyaabhishek/ECaseFill`
2. **Root Directory**: (leave empty)
3. **Environment**: `Node`
4. **Build Command**: `cd server && npm install`
5. **Start Command**: `cd server && npm start`

## 🛠️ Required Environment Variables

In your Render dashboard, set these environment variables:

```
NODE_ENV=production
PORT=10000
REACT_APP_CASHFREE_APP_ID=your_cashfree_app_id
REACT_APP_CASHFREE_SECRET_KEY=your_cashfree_secret_key
REACT_APP_API_URL=https://your-render-app-name.onrender.com
```

## 🚨 Current Issue: CORS Error Fixed

The CORS error you experienced has been **FIXED** by updating the server configuration to be more robust in detecting the production environment.

## 🛠️ What Was Fixed

### Before (problematic):
- CORS only checked `process.env.NODE_ENV === 'production'`
- If NODE_ENV wasn't set, it defaulted to localhost origins

### After (robust):
```javascript
const isProduction = process.env.NODE_ENV === 'production' || process.env.PORT || process.env.RENDER;
```

This now detects production in multiple ways:
1. ✅ `NODE_ENV=production` (if set)
2. ✅ `PORT` environment variable (Render always sets this)
3. ✅ `RENDER` environment variable (Render-specific)

## 🚀 Deploy Steps

1. **Update Render Configuration** (use Method 1 or 2 above)
2. **Add Environment Variables** 
3. **Redeploy your server** on Render
4. The new code will automatically allow:
   - `https://ecase.site`
   - `https://rajyaabhishek.github.io`

## ✅ Testing

After redeployment, test the backend:
1. Visit `https://your-render-app-name.onrender.com/debug-auth`
2. Try the payment flow at `https://ecase.site`
3. The Express module error should be resolved

## 📋 Additional Fixes

- ✅ Fixed manifest.json (removed missing logo192.png reference)
- ✅ Updated Cashfree environment to auto-detect production
- ✅ Added more robust CORS headers
- ✅ Added Node.js version specification in package.json

Your payment integration should now work seamlessly between GitHub Pages and Render! 🎉 