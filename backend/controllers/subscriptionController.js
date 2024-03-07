const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const instance = require("../utils/razorpay");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const CryptoJS = require('crypto-js');

// Create a subscription
exports.createSubscription = catchAsyncErrors(async (req, res, next) => {
    try {
        const options = {
            plan_id: process.env.RAZORPAY_SUBSCRIPTION_PLAN_ID,
            customer_notify: 1,
            total_count: 60,
            start_at: Math.floor(Date.now() / 1000) + (15 * 60)
        };

        const newSubscription = await instance.subscriptions.create(options);

        // console.log(newSubscription)

        res.status(201).json({
            success: true,
            subscription_id: newSubscription.id,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error,
        });
    }
});

// Payment verification
function generateSignature(razorpay_payment_id, razorpay_subscription_id, key_secret) {
    const data = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    const signature = CryptoJS.HmacSHA256(data, key_secret).toString(CryptoJS.enc.Hex);
    return signature;
}

// Controller for payment verification
exports.paymentVerification = catchAsyncErrors(async (req, res, next) => {

    try {
        const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id, userData } = req.body;
        const user = await User.create(userData);
        const generated_signature = generateSignature(razorpay_payment_id, razorpay_subscription_id, process.env.RAZORPAY_SUBSCRIPTION_SECRET_KEY);
        const isAuthentic = generated_signature === razorpay_signature;

        if (!isAuthentic) {

            await User.findByIdAndDelete(user._id);

            res.status(400).json({
                success: false,
                error: "Not authentic payment",
            });
        }

        await Payment.create({ razorpay_payment_id, razorpay_signature, razorpay_subscription_id });
        await user.save();

        res.status(200).json({
            success: true,
            messasge: "Welcome !!",
        });
    } catch (error) {
        console.log("Error : ", error);
        res.status(200).json({
            success: false,
            error,
        });
    }
});
