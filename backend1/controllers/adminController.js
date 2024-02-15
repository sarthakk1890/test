const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Admin = require("../models/adminModel");
const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");
const User = require("../models/userModel");
const PurchaseModel = require("../models/purchaseModel");
const ExpenseModel = require("../models/expenseModel");
const SalesModel = require("../models/salesModel");
const InventoryModel = require("../models/inventoryModel");
const PartyModel = require("../models/partyModel");

// creating admin
exports.createAdmin = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const admin = await Admin.create({
    name,
    email,
    password,
  });

  sendToken(admin, 201, res);
});

// admin login
exports.loginAdmin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  const isPasswordMatched = await admin.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  sendToken(admin, 200, res);
});

// admin logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// get all user details
exports.getAllUserDetailsAdmin = catchAsyncErrors(async (req, res, next) => {
  const user = await User.find();
  res.status(200).json({
    success: true,
    user,
  });
});
// for consumer
exports.getAllUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.find();
  res.status(200).json({
    success: true,
    user,
  });
});

// get single user details
exports.getSingleUserDetail = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// / Delete User
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const { securityKey } = req.query;
  if (!securityKey) {
    return next(new ErrorHandler("Please enter security key", 400));
  }
  if (securityKey !== process.env.SECURITY_KEY) {
    return next(new ErrorHandler("Invalid security key", 400));
  }
  if (securityKey === process.env.SECURITY_KEY) {
    const user = await User.find({
      email: req.query.email,
    });
    if (!user) {
      return next(
        new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }
    await user[0].remove();
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  }
});

// get report of users
exports.getReportofUserAdmin = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.query;
  if (!type) {
    return next(new ErrorHandler("Please enter type", 400));
  }
  const user1 = await User.find({ email: req.query.email });
  if (!user1) {
    return next(
      new ErrorHandler(
        "User does not exist with email: " + req.query.email,
        400
      )
    );
  }
  const user = user1[0]._id;
  if (type == "sale") {
    const sales = await SalesModel.find({
      user: user,
    }).populate([
      {
        path: "orderItems",
        populate: { path: "product", model: InventoryModel },
      },
    ]);
    res.status(200).json({
      success: true,
      sales,
    });
  }
  if (type == "purchase") {
    const purchase = await PurchaseModel.find({
      user: user,
    }).populate({
      path: "orderItems",
      populate: { path: "product", model: InventoryModel },
    });
    res.status(200).json({
      success: true,

      purchase,
    });
  }

  if (type == "expense") {
    const expense = await ExpenseModel.find({
      user: user,
    });
    res.status(200).json({
      success: true,
      expense,
    });
  }
});
