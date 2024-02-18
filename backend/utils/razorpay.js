const Razorpay = require('razorpay');

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_SUBSCRIPTION_API_KEY,
    key_secret: process.env.RAZORPAY_SUBSCRIPTION_SECRET_KEY,
});

module.exports = instance;