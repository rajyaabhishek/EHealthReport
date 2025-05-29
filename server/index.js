const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const {
    Cashfree
} = require('cashfree-pg');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://ecase.site', 'https://rajyaabhishek.github.io'] 
        : 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

Cashfree.XClientId = process.env.REACT_APP_CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.REACT_APP_CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

function generateOrderId() {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256');
    hash.update(uniqueId);
    const orderId = hash.digest('hex');
    return orderId.substr(0, 12);
}

app.listen(port, () => {
    // Server running silently
    console.log(`Server is running on port ${port}`);
});

// Handle both GET and POST requests for payment
app.all('/payment', async (req, res) => {
    try {
        const amount = req.query.amount || req.body.amount || 1.00;
        const plan = req.query.plan || req.body.plan || 'Default';
        const billingCycle = req.query.billingCycle || req.body.billingCycle || 'monthly';
        const userEmail = req.query.userEmail || req.body.userEmail || 'customer@example.com';
        const userName = req.query.userName || req.body.userName || 'Customer Name';
        const userPhone = req.query.userPhone || req.body.userPhone || '9999999999';
        const userId = req.query.userId || req.body.userId || `cust_${Math.floor(Math.random() * 1000000)}`;
        
        const request = {
            "order_amount": parseFloat(amount),
            "order_currency": "INR",
            "order_id": await generateOrderId(),
            "customer_details": {
                "customer_id": userId,
                "customer_phone": userPhone,
                "customer_name": userName,
                "customer_email": userEmail
            },
            "order_meta": {
                "plan": plan,
                "billing_cycle": billingCycle,
                "return_url": process.env.NODE_ENV === 'production' 
                    ? "https://ecase.site/return?order_id={order_id}" 
                    : "http://localhost:3000/return?order_id={order_id}",
                "notify_url": process.env.NODE_ENV === 'production' 
                    ? `${process.env.REACT_APP_API_URL || 'https://ecase.onrender.com'}/webhook` 
                    : "http://localhost:8000/webhook"
            }
        };

        Cashfree.PGCreateOrder("2023-08-01", request)
            .then(response => {
                res.json({
                    payment_session_id: response.data.payment_session_id,
                    order_id: response.data.order_id,
                    status: 'OK'
                });
            })
            .catch(error => {
                res.status(500).json({ 
                    error: error.response?.data?.message || 'Failed to create payment order',
                    details: error.response?.data || error.message
                });
            });
    } catch (error) {
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

        Cashfree.PGOrderFetchPayments("2023-08-01", orderId).then((response) => {
            res.json(response.data);
        }).catch(error => {
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