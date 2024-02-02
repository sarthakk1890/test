const Estimate = require("../models/estimateModel");
const SalesOrder = require("../models/salesModel");
const Inventory = require("../models/inventoryModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const moment = require('moment-timezone');
const User = require("../models/userModel");


//Create new Estimate 
exports.createEstimate = catchAsyncErrors(async (req, res, next) => {
    const { orderItems, reciverName, gst, businessName, businessAddress, estimateNum } = req.body;

    for (const item of orderItems) {
        const product = await Inventory.findById(item.product);
        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }
    }

    const total = calcTotalAmount(orderItems);

    const estimate = await Estimate.create({
        orderItems,
        total,
        user: req.user._id,
        estimateNum,
        createdAt: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
        reciverName,
        businessName,
        businessAddress,
        gst
    });

    // Increment numSales in User model
    await User.findByIdAndUpdate(req.user._id, { $inc: { numEstimates: 1 } });

    res.status(201).json({
        success: true,
        estimate,
    });
});

const calcTotalAmount = (orderItems) => {
    let total = 0;
    for (const item of orderItems) {
        total += item.price * item.quantity;
    }
    return total;
};

// Get single Estimate with product details
exports.getEstimate = catchAsyncErrors(async (req, res, next) => {
    const user = req.user._id;
    const { estimateNum } = req.params;

    const estimate = await Estimate.findOne({ user, estimateNum })
        .populate({
            path: 'orderItems.product',
            model: 'inventory',
        })
        .exec();

    if (!estimate) {
        return next(new ErrorHandler("Estimate not found", 404));
    }

    res.status(200).json({
        success: true,
        estimate,
    });
});


//Update Estimate
exports.updateEstimate = catchAsyncErrors(async (req, res, next) => {
    const user = req.user._id;
    const { id } = req.params;

    const updatedEstimate = await Estimate.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedEstimate) {
        return next(new ErrorHandler("Estimate not found", 404));
    }

    updatedEstimate.total = calcTotalAmount(updatedEstimate.orderItems);

    await updatedEstimate.save();

    res.status(200).json({
        success: true,
        estimate: updatedEstimate,
    });
});

//Convert estimate to sales
exports.convertEstimateToSalesOrder = catchAsyncErrors(async (req, res, next) => {

    const { id: estimateId } = req.params;

    const { modeOfPayment, invoiceNum, party } = req.body;

    const estimate = await Estimate.findById(estimateId);
    if (!estimate) {
        return next(new ErrorHandler("Estimate not found", 404));
    }

    const { orderItems, reciverName, gst, businessName, businessAddress, total } = estimate;

    for (const item of orderItems) {
        const product = await Inventory.findById(item.product);

        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }

        // Reduce main product quantity
        product.quantity -= item.quantity;
        await product.save();

        // Reduce subproduct quantities
        if (product.subProducts && product.subProducts.length > 0) {
            for (const subProduct of product.subProducts) {
                const subProductItem = await Inventory.findById(subProduct.inventoryId);

                if (subProductItem) {
                    // Calculate the quantity to reduce for the subProduct
                    const subProductReduction = item.quantity * subProduct.quantity;

                    // Check if there is enough quantity to reduce for the subProduct
                    if (subProductReduction > subProductItem.quantity) {
                        console.error(`Insufficient quantity for ${subProductItem.name}`);
                    } else {
                        // Reduce the quantity of the subProduct
                        subProductItem.quantity -= subProductReduction;
                        await subProductItem.save();
                    }
                }
            }
        }
    }


    // Convert modeOfPayment to an array if it is a string
    const paymentArray = typeof modeOfPayment === 'string'
        ? [{ mode: modeOfPayment, amount: total }]
        : modeOfPayment;

    const salesOrder = await SalesOrder.create({
        orderItems,
        party,
        modeOfPayment: paymentArray,
        total,
        user: req.user._id,
        createdAt: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
        reciverName,
        businessName,
        businessAddress,
        gst,
        invoiceNum
    });

    // Increment numSales in User model
    await User.findByIdAndUpdate(req.user._id, { $inc: { numSales: 1 } });

    // Delete the estimate after creating the sales order
    await Estimate.findByIdAndDelete(estimateId);

    res.status(201).json({
        success: true,
        salesOrder,
    });

});

//Get number of estimates
exports.getNumberofEstimates = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return next(new ErrorHandler("User not found", 400));
        }

        const numEstimates = user.numEstimates;

        res.status(200).json({
            success: true,
            numEstimates,
        });
    } catch (err) {
        return next(new ErrorHandler("Error fetching number of sales", 500));
    }
});


//Reset number of estimates
exports.resetEstimatesCount = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;
    const { numEstimates = 0 } = req.body;

    try {
        await User.findByIdAndUpdate(userId, { $set: { numEstimates } }, { upsert: true });

        res.status(200).json({
            success: true,
            message: "Sales count reset successfully",
        });
    } catch (err) {
        return next(new ErrorHandler("Error resetting sales count", 500));
    }
});
