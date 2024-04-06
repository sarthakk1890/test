const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const mongoose = require("mongoose");
const moment = require('moment-timezone');
const KOT = require("../models/kotModel");
const BillingOrder = require("../models/billingOrderModel");
const qrOrderModel = require("../models/qrOrderModel");
const userModel = require("../models/userModel");

//-----Helper functions-----
function currentDate() {
    const indiaTime = moment.tz('Asia/Kolkata');
    const currentDateTimeInIndia = indiaTime.add(0, 'days').format('YYYY-MM-DD HH:mm:ss');
    return currentDateTimeInIndia;
}

// create new qr order
exports.createQrOrder = catchAsyncErrors(async (req, res, next) => {

    const phoneNumber = req.body.phoneNumber;

    const user = await userModel.findOne({ phoneNumber });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Unable to create Order'
        });
    }

    req.body.user = user._id;

    req.body.createdAt = currentDate();
    const qrOrder = await qrOrderModel.create(req.body);
    res.status(201).json({
        success: true,
        qrOrder,
    });
});


//get all qr order
exports.getQrOrder = catchAsyncErrors(async (req, res, next) => {
    const user = req.user._id;
    const allQrOrder = await qrOrderModel.find({ user }).populate('user');
    res.status(201).json({
        success: true,
        allQrOrder,
    });
})


//Reject QR model
exports.rejectQrOrder = catchAsyncErrors(async (req, res, next) => {

    const { id } = req.params;
    const user = req.user._id

    const deleteQrOrder = await qrOrderModel.findOneAndDelete({ user, _id: id })

    if (!deleteQrOrder) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    res.status(200).json({
        success: true,
        message: "Order Deleted successfully",
    });
});


//Accept QR order
exports.acceptQrOrder = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user._id

    const qrData = await qrOrderModel.findById(id);

    if (!qrData) {
        return res.status(404).json({
            success: false,
            message: 'QR Order not found'
        });
    }

    const userName = req.user.businessName;
    let subUserName;

    if (req.subUser) {
        subUserName = req.subUser.name;
    }

    const billingOrder = await BillingOrder.create({
        kotId: req.body.kotId,
        userName,
        subUserName,
        createdAt: currentDate(),
        user,
        tableNo: qrData.tableNo,
        orderItems: qrData.orderItems
    });

    console.log(qrData.tableNo);

    await qrOrderModel.findOneAndDelete({ user, _id: id })

    return res.status(200).json({
        success: true,
        billingOrder
    });

});