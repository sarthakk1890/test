const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const mongoose = require("mongoose");
const moment = require('moment-timezone');
const KOT = require("../models/kotModel");
const BillingOrder = require("../models/billingOrderModel");

//-----Helper functions-----
function currentDate() {
    const indiaTime = moment.tz('Asia/Kolkata');
    const currentDateTimeInIndia = indiaTime.add(0, 'days').format('YYYY-MM-DD HH:mm:ss');
    return currentDateTimeInIndia;
}

// create new billing order
exports.createBillingOrder = catchAsyncErrors(async (req, res, next) => {

    req.body.user = req.user._id;
    req.body.createdAt = currentDate();

    const billingOrder = await BillingOrder.create(req.body);

    res.status(201).json({
        success: true,
        billingOrder,
    });
});


//get all billing order
exports.getBillingOrder = catchAsyncErrors(async (req, res, next) => {

    const user = req.user._id;

    const allBillingOrder = await BillingOrder.find({ user }).populate('user');

    res.status(201).json({
        success: true,
        allBillingOrder,
    });

})

//Update the BillingOrder
exports.updateBillingOrder = catchAsyncErrors(async (req, res, next) => {

    const { kotId } = req.params;
    const updatedFields = req.body;

    const updatedBillingOrder = await BillingOrder.findOneAndUpdate(
        kotId,
        updatedFields,
        { new: true }
    ).populate('user');

    if (!updatedBillingOrder) {
        return res.status(404).json({
            success: false,
            message: 'Billing order not found'
        });
    }

    res.status(200).json({
        success: true,
        updatedBillingOrder,
    });
});
