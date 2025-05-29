# Deployment Instructions

## ✅ Frontend Deployment (COMPLETED)
Your React app has been successfully deployed to GitHub Pages!

- **Live URL:** https://ecase.site
- **GitHub Pages URL:** https://rajyaabhishek.github.io/ECaseFill
- **Status:** ✅ Deployed and Ready

## 🚀 Backend Deployment to Render

### Step 1: Prepare for Render Deployment

1. **Create a new Render account** at https://render.com if you don't have one
2. **Connect your GitHub account** to Render

### Step 2: Deploy the Backend

1. **Go to Render Dashboard** and click "New +"
2. **Select "Web Service"**
3. **Connect Repository:**
   - Repository: `rajyaabhishek/ECaseFill`
   - Branch: `master`
   - Root Directory: `server`

4. **Configure the Service:**
   - **Name:** `ecasefill-backend` (or any name you prefer)
   - **Environment:** `Node`
   - **Region:** Choose your preferred region
   - **Branch:** `master`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Step 3: Environment Variables

In Render, add these environment variables:

```
NODE_ENV=production
PORT=10000
REACT_APP_CASHFREE_APP_ID=your_cashfree_app_id
REACT_APP_CASHFREE_SECRET_KEY=your_cashfree_secret_key
RENDER_EXTERNAL_URL=https://your-render-app-name.onrender.com
```

**Replace the placeholder values:**
- Get Cashfree credentials from: https://merchant.cashfree.com/
- Replace `your-render-app-name` with your actual Render app name

### Step 4: Update Frontend Configuration

After your Render backend is deployed, you need to update the frontend:

1. **Get your Render backend URL** (something like: `https://ecasefill-backend.onrender.com`)

2. **Create a `.env` file** in the root directory with:
```
REACT_APP_API_URL=https://your-render-app-name.onrender.com
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_key
REACT_APP_CASHFREE_APP_ID=your_cashfree_app_id
REACT_APP_CASHFREE_SECRET_KEY=your_cashfree_secret_key
REACT_APP_CASHFREE_ENVIRONMENT=production
```

3. **Rebuild and redeploy the frontend:**
```bash
npm run build
npm run deploy
```

### Step 5: Verify Deployment

1. **Backend Health Check:** Visit `https://your-render-app-name.onrender.com/webhook`
2. **Frontend:** Visit https://ecase.site
3. **Test Payment Flow:** Try making a test payment

## 🔧 Troubleshooting

### If Backend Deployment Fails:
- Check Render logs in the dashboard
- Ensure all environment variables are set correctly
- Verify the server starts correctly with `npm start`

### If Frontend-Backend Connection Fails:
- Verify REACT_APP_API_URL is correct
- Check CORS configuration in server/index.js
- Ensure backend is running and accessible

## 📝 Important Notes

1. **Free Tier Limitations:**
   - Render free tier spins down after 15 minutes of inactivity
   - First request after spin-down may take 30-60 seconds

2. **Production Environment:**
   - Set `REACT_APP_CASHFREE_ENVIRONMENT=production` for live payments
   - Use production Cashfree credentials

3. **Security:**
   - Never commit `.env` files to GitHub
   - Use environment variables for all sensitive data

## 🎯 Quick Deploy Checklist

- [x] Frontend deployed to GitHub Pages
- [ ] Backend deployed to Render
- [ ] Environment variables configured
- [ ] Frontend updated with backend URL
- [ ] Payment flow tested
- [ ] Custom domain configured (ecase.site)

## 🌟 Your App URLs

- **Frontend:** https://ecase.site
- **Backend:** https://your-render-app-name.onrender.com (update after deployment)
- **GitHub Repository:** https://github.com/rajyaabhishek/ECaseFill 