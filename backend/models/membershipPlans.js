const mongoose = require("mongoose");

const membershipPlansSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },

    plan: {
        type: String,
        required: true
    },

    validity: {
        type: Number,
        required: true
    },

    basePrice: {
        type: Number
    },

    sellingPrice: {
        type: Number,
        required: true
    },

    GSTincluded: {
        type: Boolean
    },

    GSTRate: {
        type: Number,
    },

    CGST: {
        type: Number,
    },
    SGST: {
        type: Number,
    },
    IGST: {
        type: Number,
    },

    //------Subscription Type------------
    subscription_type: {
        type: String,
        enum: ['prepaid', 'postpaid'],
        default: 'postpaid'
    },

});

module.exports = mongoose.model("MembershipPlans", membershipPlansSchema);
