const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const SalesOrder = require("../models/salesModel");
const PurchaseModel = require("../models/purchaseModel");
const ExpenseModel = require("../models/expenseModel");
const SalesModel = require("../models/salesModel");
const InventoryModel = require("../models/inventoryModel");
const PartyModel = require("../models/partyModel");
const User = require("../models/userModel");
const Estimate = require("../models/estimateModel");
const SalesReturnModel = require("../models/SalesReturnModel");

function concatenateValues(obj) {
  const arrNew = Object.values(JSON.parse(JSON.stringify(obj)));
  const word = arrNew.slice(0, -1).join('');
  return word;
}

// to get report of user sales, purchase, and expense between starting date and end date
exports.getReportofUser = catchAsyncErrors(async (req, res, next) => {
  const { start_date, end_date, type } = req.query;

  const user = req.user._id;

  if (!type) {
    res.status(404).json({
      success: false,
      message: "Please provide type of report",
    });
  }

  if (type === "sale") {
    const sales = await SalesModel.find({
      createdAt: { $gte: start_date, $lte: end_date },
      user: user,
    }).populate([
      { path: "orderItems.product", model: 'inventory' },
      { path: "orderItems.membership", select: "plan validity sellingPrice basePrice GSTincluded GSTRate CGST SGST IGST membershipType" },
      "party",
      { path: "user", select: "taxFile" },
    ]);

    sales.map((value, idx) => {
      if (!value.modeOfPayment[0].mode) {
        const mode = concatenateValues(value.modeOfPayment[0]);
        const amount = value.total;
        value.modeOfPayment[0] = { mode, amount };
      }
    });

    res.status(200).json({
      success: true,
      sales,

    });

  }

  if (type === "purchase") {
    const purchase = await PurchaseModel.find({
      createdAt: { $gte: start_date, $lte: end_date },
      user: user,
    }).populate([
      {
        path: "orderItems",
        populate: { path: "product", model: InventoryModel },
      },
      "party",
      { path: "user", select: "taxFile" },
    ]);

    purchase.map((value, idx) => {
      if (!value.modeOfPayment[0].mode) {
        const mode = concatenateValues(value.modeOfPayment[0]);
        const amount = value.total;
        value.modeOfPayment[0] = { mode, amount };
      }
    });

    res.status(200).json({
      success: true,
      purchase,

    });
  }

  if (type === "expense") {
    const expense = await ExpenseModel.find({
      createdAt: { $gte: start_date, $lte: end_date },
      user: user,
    }).populate(
      { path: "user", select: "taxFile" },
    )
    res.status(200).json({
      success: true,
      expense,

    });
  }

  if (type === "saleReturn") {
    const sales = await SalesReturnModel.find({
      createdAt: { $gte: start_date, $lte: end_date },
      user: user,
    }).populate([
      {
        path: "orderItems",
        populate: { path: "product", model: InventoryModel },
      },
      "party",
      { path: "user", select: "taxFile" },
    ]).select("-modeOfPayment");

    res.status(200).json({
      success: true,
      sales,

    });
  }

  if (type === "report") {
    // return item names, stock quantity, and stock value
    const inventories = await InventoryModel.find({
      user: user,
    });

    res.status(200).json({
      success: true,
      inventories,

    });
  }

  if (type === "estimate") {
    const estimates = await Estimate.find({ user: req.user._id }).populate({
      path: 'orderItems.product',
      model: 'inventory',
    }).exec();

    res.status(200).json({
      success: true,
      count: estimates.length,
      estimates,

    });
  }

});