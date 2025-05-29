const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const {
    Cashfree
} = require('cashfree-pg');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// More robust CORS configuration
const isProduction = process.env.NODE_ENV === 'production' || process.env.PORT || process.env.RENDER;
const allowedOrigins = isProduction 
    ? ['https://ecase.site', 'https://rajyaabhishek.github.io'] 
    : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Validate environment variables
const validateEnvironment = () => {
    const requiredVars = [
        'REACT_APP_CASHFREE_APP_ID',
        'REACT_APP_CASHFREE_SECRET_KEY',
        'REACT_APP_CASHFREE_ENVIRONMENT'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        console.error('Missing required environment variables:', missing);
        return false;
    }
    
    // Validate credentials format
    if (process.env.REACT_APP_CASHFREE_APP_ID.length < 10) {
        console.error('Invalid Cashfree App ID length');
        return false;
    }
    
    if (process.env.REACT_APP_CASHFREE_SECRET_KEY.length < 20) {
        console.error('Invalid Cashfree Secret Key length');
        return false;
    }
    
    return true;
};

// Initialize Cashfree only if environment is valid
if (validateEnvironment()) {
    Cashfree.XClientId = process.env.REACT_APP_CASHFREE_APP_ID;
    Cashfree.XClientSecret = process.env.REACT_APP_CASHFREE_SECRET_KEY;
    Cashfree.XEnvironment = (process.env.REACT_APP_CASHFREE_ENVIRONMENT === 'production') 
        ? Cashfree.Environment.PRODUCTION 
        : Cashfree.Environment.SANDBOX;
        
    console.log('Cashfree initialized:', {
        environment: process.env.REACT_APP_CASHFREE_ENVIRONMENT,
        hasCredentials: true
    });
} else {
    console.error('Failed to initialize Cashfree due to invalid environment');
}

function generateOrderId() {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256');
    hash.update(uniqueId);
    const orderId = hash.digest('hex');
    return orderId.substr(0, 12);
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`Cashfree Environment: ${process.env.REACT_APP_CASHFREE_ENVIRONMENT}`);
});

// Temporary debug endpoint - REMOVE AFTER FIXING
app.get('/debug-auth', (req, res) => {
    res.json({
        hasAppId: !!process.env.REACT_APP_CASHFREE_APP_ID,
        hasSecretKey: !!process.env.REACT_APP_CASHFREE_SECRET_KEY,
        environment: isProduction ? 'PRODUCTION' : 'SANDBOX',
        appIdLength: process.env.REACT_APP_CASHFREE_APP_ID ? process.env.REACT_APP_CASHFREE_APP_ID.length : 0,
        secretLength: process.env.REACT_APP_CASHFREE_SECRET_KEY ? process.env.REACT_APP_CASHFREE_SECRET_KEY.length : 0,
        cashfreeEnv: process.env.REACT_APP_CASHFREE_ENVIRONMENT,
        nodeEnv: process.env.NODE_ENV
    });
});

// Handle both GET and POST requests for payment
app.all('/payment', async (req, res) => {
    try {
        // Validate Cashfree initialization
        if (!Cashfree.XClientId || !Cashfree.XClientSecret) {
            console.error('Cashfree not properly initialized');
            return res.status(500).json({ 
                error: 'Payment service not configured properly',
                details: 'Missing Cashfree credentials'
            });
        }
        
        const amount = req.query.amount || req.body.amount || 1.00;
        const plan = req.query.plan || req.body.plan || 'Default';
        const billingCycle = req.query.billingCycle || req.body.billingCycle || 'monthly';
        const userEmail = req.query.userEmail || req.body.userEmail || 'customer@example.com';
        const userName = req.query.userName || req.body.userName || 'Customer Name';
        const userPhone = req.query.userPhone || req.body.userPhone || '9999999999';
        const userId = req.query.userId || req.body.userId || `cust_${Math.floor(Math.random() * 1000000)}`;
        
        // Log environment and credentials for debugging
        console.log('Payment request debug:', {
            environment: process.env.REACT_APP_CASHFREE_ENVIRONMENT,
            hasAppId: !!process.env.REACT_APP_CASHFREE_APP_ID,
            hasSecretKey: !!process.env.REACT_APP_CASHFREE_SECRET_KEY,
            appIdLength: process.env.REACT_APP_CASHFREE_APP_ID ? process.env.REACT_APP_CASHFREE_APP_ID.length : 0,
            secretLength: process.env.REACT_APP_CASHFREE_SECRET_KEY ? process.env.REACT_APP_CASHFREE_SECRET_KEY.length : 0,
            orderAmount: amount,
            isProduction: isProduction
        });
        
        const orderId = await generateOrderId();
        
        const request = {
            "order_amount": parseFloat(amount),
            "order_currency": "INR",
            "order_id": orderId,
            "customer_details": {
                "customer_id": userId,
                "customer_phone": userPhone,
                "customer_name": userName,
                "customer_email": userEmail
            },
            "order_meta": {
                "return_url": isProduction 
                    ? "https://ecase.site/return?order_id={order_id}" 
                    : "http://localhost:3000/return?order_id={order_id}",
                "notify_url": isProduction 
                    ? `${process.env.REACT_APP_API_URL || 'https://ecase.onrender.com'}/webhook` 
                    : "http://localhost:8000/webhook"
            },
            "order_note": `${plan} subscription - ${billingCycle}`,
            "order_tags": {
                "plan": plan,
                "billing_cycle": billingCycle
            }
        };

        console.log('Creating Cashfree order:', {
            orderId: request.order_id,
            amount: request.order_amount,
            environment: Cashfree.XEnvironment,
            customerEmail: request.customer_details.customer_email
        });

        // Use the latest API version 2025-01-01 for better stability
        Cashfree.PGCreateOrder("2025-01-01", request)
            .then(response => {
                console.log('Cashfree order created successfully:', {
                    orderId: response.data.order_id,
                    hasPaymentSessionId: !!response.data.payment_session_id,
                    sessionIdLength: response.data.payment_session_id ? response.data.payment_session_id.length : 0
                });
                res.json({
                    payment_session_id: response.data.payment_session_id,
                    order_id: response.data.order_id,
                    status: 'OK'
                });
            })
            .catch(error => {
                console.error('Cashfree order creation failed:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    message: error.message,
                    orderId: orderId,
                    environment: process.env.REACT_APP_CASHFREE_ENVIRONMENT
                });
                
                // Provide more specific error messages
                let errorMessage = 'Failed to create payment order';
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response?.status === 401) {
                    errorMessage = 'Invalid Cashfree credentials';
                } else if (error.response?.status === 400) {
                    errorMessage = 'Invalid request parameters';
                }
                
                res.status(500).json({ 
                    error: errorMessage,
                    details: error.response?.data || error.message,
                    cashfreeError: true,
                    environment: process.env.REACT_APP_CASHFREE_ENVIRONMENT
                });
            });
    } catch (error) {
        console.error('Payment endpoint error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

app.post('/verify', async (req, res) => {
    try {
        let { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Use the latest API version for verification as well
        Cashfree.PGOrderFetchPayments("2025-01-01", orderId).then((response) => {
            res.json(response.data);
        }).catch(error => {
            console.error('Payment verification failed:', {
                orderId: orderId,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            res.status(500).json({ 
                error: error.response?.data?.message || 'Payment verification failed',
                orderId: orderId,
                details: error.response?.data
            });
        })

    } catch (error) {
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
})

// Webhook endpoint for payment notifications
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    res.status(200).json({ status: 'received' });
});

// Test endpoint to manually trigger subscription update
app.post('/test-subscription', (req, res) => {
    const { plan, billingCycle, userId } = req.body;
    
    res.json({ 
        success: true, 
        message: `Subscription updated to ${plan} (${billingCycle}) for user ${userId}`,
        credits: plan === 'Starter' ? 1000 : 400
    });
});