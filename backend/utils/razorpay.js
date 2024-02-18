const Razorpay = require('razorpay');

const instance = new Razorpay({
    key_id: "rzp_test_nS4OygGNqxTFN8",
    key_secret: "62cNHa9nI8mrKnHJzLn1M3DL",
});

module.exports = instance;