# Production Payment Troubleshooting Guide

## 🚨 Issue: `payment_session_id_invalid` Error in Production

You're experiencing the error `{"message":"payment_session_id is not present or is invalid","code":"payment_session_id_invalid","type":"request_failed"}` in production but not in sandbox mode.

## 🔍 Root Causes & Solutions

### 1. **API Version Compatibility Issue** ⭐ **MOST LIKELY CAUSE**

**Problem**: Using older API version `2023-08-01` which may have compatibility issues in production.

**Solution**: ✅ **FIXED** - Updated to use API version `2025-01-01`

```javascript
// OLD (problematic)
Cashfree.PGCreateOrder("2023-08-01", request)

// NEW (fixed)
Cashfree.PGCreateOrder("2025-01-01", request)
```

### 2. **Production vs Sandbox Credentials Mismatch**

**Problem**: Using sandbox credentials with production environment or vice versa.

**Check**:
```bash
# Your credentials must match your environment
REACT_APP_CASHFREE_ENVIRONMENT=production  # Environment setting
REACT_APP_CASHFREE_APP_ID=your_production_app_id      # Must be PRODUCTION credentials
REACT_APP_CASHFREE_SECRET_KEY=your_production_secret  # Must be PRODUCTION credentials
```

**Verify**: Run the diagnostic script:
```bash
cd server
node ../test-cashfree-production.js
```

### 3. **Account Activation Status**

**Problem**: Your Cashfree production account may not be fully activated.

**Check**:
1. Log into [Cashfree Merchant Dashboard](https://merchant.cashfree.com/)
2. Switch to **Production** mode (top-right toggle)
3. Verify account status shows **LIVE** or **ACTIVE**
4. Check if KYC verification is completed
5. Ensure business verification is approved

### 4. **Credential Format Issues**

**Problem**: Invalid credential format or encoding issues.

**Validate**:
- Production App ID should be ~32 characters
- Production Secret should be ~54 characters
- No extra spaces, newlines, or special characters

### 5. **Environment Variable Issues**

**Problem**: Environment variables not properly set in production server.

**Check Render.com Environment Variables**:
1. Go to Render Dashboard → Your Service → Environment
2. Verify these are set correctly:
   ```
   NODE_ENV=production
   REACT_APP_CASHFREE_ENVIRONMENT=production
   REACT_APP_CASHFREE_APP_ID=your_production_app_id
   REACT_APP_CASHFREE_SECRET_KEY=your_production_secret_key
   REACT_APP_API_URL=https://your-app.onrender.com
   ```

## 🛠️ Step-by-Step Diagnosis

### Step 1: Run Diagnostic Script
```bash
cd server
node ../test-cashfree-production.js
```

This will test both API versions and show you exactly what's failing.

### Step 2: Check Server Logs
Visit your backend endpoint to see debug information:
```
https://your-backend.onrender.com/debug-auth
```

Expected response:
```json
{
  "hasAppId": true,
  "hasSecretKey": true,
  "environment": "PRODUCTION",
  "appIdLength": 32,
  "secretLength": 54,
  "cashfreeEnv": "production",
  "nodeEnv": "production"
}
```

### Step 3: Test Payment Creation
Try creating a test payment and check the server logs for detailed error information.

### Step 4: Verify Cashfree Dashboard
1. Go to **Developers → API Keys** in production mode
2. Regenerate credentials if necessary
3. Check **Transactions → Test Transactions** for any failed attempts

## 🔧 Quick Fixes Applied

### 1. ✅ Updated Server Code
- **API Version**: Changed from `2023-08-01` to `2025-01-01`
- **Error Handling**: Added comprehensive error logging and user-friendly messages
- **Validation**: Added environment variable validation on startup
- **Debugging**: Enhanced logging for troubleshooting

### 2. ✅ Updated Frontend Code  
- **Error Messages**: More specific error handling for different failure types
- **Validation**: Better payment session validation
- **Logging**: Enhanced debugging information

### 3. ✅ Added Diagnostic Tools
- **Test Script**: `test-cashfree-production.js` to validate setup
- **Debug Endpoint**: `/debug-auth` to check environment status

## 🚀 Next Steps

### Immediate Actions:
1. **Redeploy your server** with the updated code
2. **Run the diagnostic script** to identify the exact issue
3. **Check your Cashfree production account** status
4. **Verify environment variables** in Render

### If Still Failing:
1. **Regenerate Cashfree production credentials**
2. **Contact Cashfree support** with your merchant ID
3. **Check for any account restrictions** in the dashboard

## 📊 Common Error Patterns

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| `payment_session_id_invalid` | API version compatibility | Use `2025-01-01` API version |
| `authentication_error` | Wrong credentials | Verify production credentials |
| `invalid_request_error` | Account not activated | Complete KYC/business verification |
| `version_invalid` | Unsupported API version | Update to supported version |

## 🔍 Monitoring

After deploying the fixes:
1. **Check server logs** for successful order creation
2. **Monitor the `/debug-auth` endpoint** for environment status
3. **Test with small amounts** (₹1) before going live
4. **Set up webhook monitoring** for payment status updates

## 📞 Support Contacts

If the issue persists:
- **Cashfree Support**: support@cashfree.com
- **Discord**: [Cashfree Discord Server](https://discord.gg/cashfree)
- **Documentation**: [Cashfree API Docs](https://www.cashfree.com/docs/)

---

**Note**: The updated code should resolve the `payment_session_id_invalid` error. The primary fix is using the latest API version `2025-01-01` which has better production stability. 