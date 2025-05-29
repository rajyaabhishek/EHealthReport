const { Cashfree } = require('cashfree-pg');
require('dotenv').config();

// Test script to validate Cashfree production setup
async function testCashfreeProduction() {
    console.log('🔍 Testing Cashfree Production Setup...\n');
    
    // 1. Check environment variables
    console.log('1. Environment Variables:');
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   REACT_APP_CASHFREE_ENVIRONMENT:', process.env.REACT_APP_CASHFREE_ENVIRONMENT);
    console.log('   Has App ID:', !!process.env.REACT_APP_CASHFREE_APP_ID);
    console.log('   Has Secret Key:', !!process.env.REACT_APP_CASHFREE_SECRET_KEY);
    console.log('   App ID Length:', process.env.REACT_APP_CASHFREE_APP_ID ? process.env.REACT_APP_CASHFREE_APP_ID.length : 0);
    console.log('   Secret Length:', process.env.REACT_APP_CASHFREE_SECRET_KEY ? process.env.REACT_APP_CASHFREE_SECRET_KEY.length : 0);
    
    if (!process.env.REACT_APP_CASHFREE_APP_ID || !process.env.REACT_APP_CASHFREE_SECRET_KEY) {
        console.log('❌ Missing Cashfree credentials!\n');
        console.log('💡 Make sure to set these environment variables:');
        console.log('   REACT_APP_CASHFREE_APP_ID=your_app_id');
        console.log('   REACT_APP_CASHFREE_SECRET_KEY=your_secret_key');
        console.log('   REACT_APP_CASHFREE_ENVIRONMENT=production');
        return;
    }
    
    // 2. Initialize Cashfree
    console.log('\n2. Initializing Cashfree...');
    Cashfree.XClientId = process.env.REACT_APP_CASHFREE_APP_ID;
    Cashfree.XClientSecret = process.env.REACT_APP_CASHFREE_SECRET_KEY;
    Cashfree.XEnvironment = (process.env.REACT_APP_CASHFREE_ENVIRONMENT === 'production') 
        ? Cashfree.Environment.PRODUCTION 
        : Cashfree.Environment.SANDBOX;
    
    console.log('   Environment set to:', Cashfree.XEnvironment);
    console.log('   ✅ Cashfree initialized');
    
    // 3. Test order creation with both API versions
    const testOrderData = {
        "order_amount": 1.00,
        "order_currency": "INR",
        "order_id": "test_order_" + Date.now(),
        "customer_details": {
            "customer_id": "test_customer_123",
            "customer_phone": "9999999999",
            "customer_name": "Test Customer",
            "customer_email": "test@example.com"
        },
        "order_meta": {
            "return_url": "https://ecase.site/return?order_id={order_id}",
            "notify_url": "https://ecase.onrender.com/webhook"
        }
    };
    
    // Test with old API version
    console.log('\n3. Testing with API version 2023-08-01...');
    try {
        const response2023 = await Cashfree.PGCreateOrder("2023-08-01", testOrderData);
        console.log('   ✅ 2023-08-01 API Success:', {
            orderId: response2023.data.order_id,
            hasPaymentSessionId: !!response2023.data.payment_session_id,
            sessionIdLength: response2023.data.payment_session_id ? response2023.data.payment_session_id.length : 0
        });
    } catch (error) {
        console.log('   ❌ 2023-08-01 API Failed:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            code: error.response?.data?.code,
            type: error.response?.data?.type
        });
    }
    
    // Test with new API version
    console.log('\n4. Testing with API version 2025-01-01...');
    testOrderData.order_id = "test_order_new_" + Date.now(); // New order ID
    try {
        const response2025 = await Cashfree.PGCreateOrder("2025-01-01", testOrderData);
        console.log('   ✅ 2025-01-01 API Success:', {
            orderId: response2025.data.order_id,
            hasPaymentSessionId: !!response2025.data.payment_session_id,
            sessionIdLength: response2025.data.payment_session_id ? response2025.data.payment_session_id.length : 0
        });
    } catch (error) {
        console.log('   ❌ 2025-01-01 API Failed:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            code: error.response?.data?.code,
            type: error.response?.data?.type
        });
    }
    
    // 4. Recommendations
    console.log('\n📋 Recommendations:');
    if (process.env.REACT_APP_CASHFREE_ENVIRONMENT === 'production') {
        console.log('   • ✅ Using production environment');
        console.log('   • Make sure your production credentials are activated');
        console.log('   • Verify your Cashfree account is KYC approved for production');
    } else {
        console.log('   • ⚠️  Using sandbox environment - switch to production');
    }
    
    console.log('   • Use API version 2025-01-01 for better stability');
    console.log('   • Check Cashfree dashboard for any account restrictions');
    console.log('   • Ensure webhook URLs are accessible from Cashfree servers');
    
    console.log('\n🏁 Test completed!');
}

// Run the test
testCashfreeProduction().catch(console.error); 