const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const mongoose = require("mongoose");
const moment = require('moment-timezone');
const KOT = require("../models/kotModel");

//-----Helper functions-----
function currentDate() {
    const indiaTime = moment.tz('Asia/Kolkata');
    const currentDateTimeInIndia = indiaTime.add(0, 'days').format('YYYY-MM-DD HH:mm:ss');
    return currentDateTimeInIndia;
}

// create new KOT
exports.createKot = catchAsyncErrors(async (req, res, next) => {

    req.body.user = req.user._id;
    req.body.date = currentDate();

    const newKOT = await KOT.create(req.body);

    res.status(201).json({
        success: true,
        newKOT,
    });
});


//get all kot
exports.getKot = catchAsyncErrors(async (req, res, next) => {

    const user = req.user._id;

    const allKot = await KOT.find({ user });

    res.status(201).json({
        success: true,
        allKot,
    });

})

//get single KOT
exports.getSingleKot = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const kot = await KOT.findOne({ kotId: id });

    if (!kot) {
        return next(new ErrorHandler("KOT not found", 404));
    }

    res.status(201).json({
        success: true,
        kot
    })
})

//Update the KOT
exports.updateKot = catchAsyncErrors(async (req, res, next) => {

    const kotId = req.params.id;
    const { item } = req.body;

    const updatedKOT = await KOT.findOneAndUpdate(
        { kotId },
        { $push: { item: { $each: item } } },
        { new: true }
    );

    res.status(200).json({
        success: true,
        updatedKOT,
    });
})