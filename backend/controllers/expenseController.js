const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ExpenseModel = require("../models/expenseModel");

exports.addExpense = catchAsyncErrors(async (req, res, next) => {
  // const income=req.body;
  const userDetails = req.user._id;
  req.body.user = userDetails;

  const expense = await ExpenseModel.create(req.body);

  res.status(201).json({
    success: true,
    message: "Expense added successfully",
    expense,
  });
});

exports.getAllExpense = catchAsyncErrors(async (req, res, next) => {
  const user = req.user._id;
  const allExpense = await ExpenseModel.find({ user: user }).sort("-createdAt");
  res.status(200).json({
    success: true,
    allExpense,
  });
});

exports.getSingleExpense = catchAsyncErrors(async (req, res, next) => {
  const expense = await ExpenseModel.findById(req.params.id);

  if (!expense) {
    return next(new ErrorHandler("Expense not found", 404));
  }

  res.status(200).json({
    success: true,
    expense,
  });
});

exports.updateExpense = catchAsyncErrors(async (req, res, next) => {
  let expense = await ExpenseModel.findById(req.params.id);

  if (!expense) {
    return next(new ErrorHandler("Income not found", 404));
  }

  expense = await ExpenseModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    expense,
  });
});

exports.deleteExpense = catchAsyncErrors(async (req, res, next) => {
  const expense = await ExpenseModel.findById(req.params.id);

  if (!expense) {
    return next(new ErrorHandler("Expense not found", 404));
  }

  await expense.remove();
  res.status(200).json({
    success: true,
    message: "Expense Deleted Successfully",
  });
});
