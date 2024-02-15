const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Consumer = require("../models/consumerModel");
const subscribedUsersModel = require("../models/subscribedUsersModel");
const Agent = require("../models/agentModel");
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  // console.log(req.cookies);
  
  // const { token } = req.cookies;
  const { token } = req.cookies;


  // console.log(token);
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }
  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
  } catch (err) {
    return next(
      new ErrorHandler(
        "Invalid token, please login again or submit old token",
        401
      )
    );
  }
});

// auth for consumer
exports.isAuthenticatedConsumer = catchAsyncErrors(async (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization);
  const token = authorization

  // const { token } = req.cookies;
  console.log(token);
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }
  try {
    console.log('hh');
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Consumer.findById(decodedData.id);
    next();
  } catch (err) {
    return next(
      new ErrorHandler(
        "Invalid token, please login again or submit old token",
        401
      )
    );
  }
});

exports.isAuthenticatedAdmin = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.admin = await Admin.findById(decodedData.id);

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.admin.role} is not allowed to access this resouce `,
          403
        )
      );
    }
    next();
  };
};

// for subscribed user checking
exports.isSubscribed = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }
  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    // console.log(req.user.phoneNumber);
    const user = User.findById(decodedData.id);
    if(user === null){
      return next(new ErrorHandler("Please login to access this resource", 401));
    }
    
    const subbedUser = await subscribedUsersModel.find({
      phoneNumber: req.user.phoneNumber ,
    })
    // console.log(subbedUser);
    if(subbedUser.length === 0){
      return next(new ErrorHandler("Please subscribe to access this resource", 401));
    }
    next();
  } catch (err) {
    return next(
      new ErrorHandler(
        "Invalid token, please login again or submit old token",
        401
      )
    );
  }
});

// auth for agent
exports.isAuthenticatedAgent = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }
  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Agent.findById(decodedData.id);
    next();
  } catch (err) {
    return next(
      new ErrorHandler(
        "Invalid token, please login again or submit old token",
        401
      )
    );
  }
});
