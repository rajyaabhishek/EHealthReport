# GitHub Deployment Setup Guide

This guide explains how to properly deploy your ECaseFill application to GitHub Pages with environment variables.

## The Problem You Were Facing

GitHub Pages is a static hosting service that doesn't have access to environment variables at runtime. When you upload secrets to GitHub, they're only available during GitHub Actions workflows, not when your app runs in the browser.

## The Solution

We've created a GitHub Actions workflow that:
1. Builds your React app with environment variables from GitHub Secrets
2. Injects those variables into the build at build time
3. Deploys the built app to GitHub Pages

## Required GitHub Secrets

You need to set up the following secrets in your GitHub repository:

### How to Add Secrets:
1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each of the following secrets:

### Required Secrets:

#### 1. REACT_APP_CLERK_PUBLISHABLE_KEY
- **Description**: Your Clerk authentication publishable key
- **Example**: `pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Where to find**: Clerk Dashboard → Your app → API Keys

#### 2. REACT_APP_AI_API_KEY
- **Description**: Your Google Gemini API key for AI features
- **Example**: `AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Where to find**: Google AI Studio → API Keys

#### 3. REACT_APP_CASHFREE_ENVIRONMENT
- **Description**: Cashfree payment environment
- **Possible values**: `sandbox` or `production`
- **Use**: `sandbox` for testing, `production` for live

#### 4. REACT_APP_API_URL
- **Description**: Your backend API URL
- **Example**: `https://your-backend-api.herokuapp.com` or `https://api.ecase.site`

## Deployment Process

### Automatic Deployment
Once you've set up the secrets, the deployment happens automatically:

1. **Push to main branch**: Any push to the `main` branch triggers the deployment
2. **Build process**: GitHub Actions builds your app with the environment variables
3. **Deploy**: The built app is automatically deployed to GitHub Pages

### Manual Deployment
If you need to trigger a deployment manually:

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Select "Build and Deploy to GitHub Pages" workflow
4. Click "Run workflow" → "Run workflow"

## Verifying the Deployment

After deployment:

1. **Check Actions**: Go to Actions tab to see if the workflow completed successfully
2. **Check your site**: Visit https://ecase.site to verify the app loads without errors
3. **Check browser console**: Open developer tools to ensure no "Missing Publishable Key" errors

## Important Notes

### Environment Variable Naming
- All React environment variables must start with `REACT_APP_`
- They are injected at **build time**, not runtime
- Once built, they become part of the static files

### Security Considerations
- **Publishable keys**: Safe to expose in client-side code (Clerk, Stripe publishable keys)
- **Secret keys**: Never put these in client-side environment variables
- **API URLs**: Can be exposed as they're publicly accessible endpoints

### Custom Domain
Your app is configured to use the custom domain `ecase.site` as specified in your CNAME file.

## Troubleshooting

### Common Issues:

1. **"Missing Publishable Key" Error**
   - **Cause**: Secrets not set up properly
   - **Solution**: Double-check all required secrets are added to GitHub

2. **Build Fails**
   - **Cause**: Missing dependencies or incorrect secret values
   - **Solution**: Check the Actions logs for specific error messages

3. **App Loads but Features Don't Work**
   - **Cause**: Incorrect secret values (wrong environment, invalid keys)
   - **Solution**: Verify each secret value is correct

### Checking Secrets:
You cannot view secret values after adding them, but you can:
1. Update them with new values
2. Delete and recreate them
3. Check the Actions logs to see if they're being used

## Next Steps

1. ✅ Add all required secrets to your GitHub repository
2. ✅ Push any changes to the main branch
3. ✅ Monitor the Actions tab for successful deployment
4. ✅ Test your live site at https://ecase.site

If you encounter any issues, check the GitHub Actions logs for detailed error messages. 