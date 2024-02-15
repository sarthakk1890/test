const Agent = require("../models/agentModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Consumer = require("../models/consumerModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");
const subscribedUsersModel = require("../models/subscribedUsersModel");


exports.registerAgent = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, phoneNumber } = req.body;
  if (!name || !email || !password || !phoneNumber) {
    return next(new ErrorHandler("Please provide all the details", 400));
  }
  const agent = await Agent.create({
    name,
    email,
    password,
    phoneNumber,
  });
  const token = agent.getJWTToken();
  sendToken(agent, 201, res);
});

// consumer login
exports.loginAgent = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please provide all the details", 400));
  }
  const agent = await Agent.findOne({ email }).select("+password");
  if (!agent) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }
  const isMatch = await agent.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }
  sendToken(agent, 200, res);
});

// consumer logout
exports.logoutAgent = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// get number of users referred by the agent and their details
exports.getUsers = catchAsyncErrors(async (req, res, next) => {
  let users = await User.find({
    referredBy: req.user.email,
  }).select("email phoneNumber");

  let temp =[];
  for (let i = 0; i < users.length; i++) {
    const isSubbed = await subscribedUsersModel.findOne({
      phoneNumber: users[i].phoneNumber,
    });
    if (isSubbed) {
      temp.push({
        phoneNumber: users[i].phoneNumber,
        email: users[i].email,
        isActive: true,
      });
    } else {
      temp.push({
        phoneNumber: users[i].phoneNumber,
        email: users[i].email,
        isActive: false,
      });
    }
  }
  if (!temp) {
    return next(new ErrorHandler("No users Referred yet", 404));
  }
  res.status(200).json({
    success: true,
    data: temp,
  });
});
