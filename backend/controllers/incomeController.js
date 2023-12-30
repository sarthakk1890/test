const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const IncomeModel = require("../models/incomeModel");
// const ErrorHandler = require("../utils/errorhandler");

exports.addIncome = catchAsyncErrors(async (req, res, next) => {
  // const income=req.body;
  const userDetails = req.user._id;
  req.body.user = userDetails;

  const income = await IncomeModel.create(req.body);

  res.status(201).json({
    success: true,
    message: "Income added successfully",
    income,
  });
});

exports.getAllIncome = catchAsyncErrors(async (req, res, next) => {
  const allIncome = await IncomeModel.find();

  res.status(200).json({
    success: true,
    allIncome,
  });
});

exports.getSingleIncome = catchAsyncErrors(async (req, res, next) => {
  const income = await IncomeModel.findById(req.params.id);

  if (!income) {
    return next(new ErrorHandler("Income not found", 404));
  }

  res.status(200).json({
    success: true,
    income,
  });
});

exports.updateIncome = catchAsyncErrors(async (req, res, next) => {
  let income = await IncomeModel.findById(req.params.id);

  if (!income) {
    return next(new ErrorHandler("Income not found", 404));
  }

  income = await IncomeModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    income,
  });
});

exports.deleteIncome = catchAsyncErrors(async (req, res, next) => {
  const income = await IncomeModel.findById(req.params.id);

  if (!income) {
    return next(new ErrorHandler("Income not found", 404));
  }

  await income.remove();

  res.status(200).json({
    success: true,
    message: "Income Deleted Successfully",
  });
});
