const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    // name: {
    //   type: String,
    //   required: [true, "Please Enter Your Name"],
    //   maxLength: [30, "Name cannot exceed 30 characters"],
    //   minLength: [4, "Name should have more than 4 characters"],
    // },
    rating: {
      type: Number,
      // required: true,
    },
    discount:{
      type: Number,
      default: 0
    },
    avgRating: {
      type: Number,
    },
    shopRating: {
      type: Number,
    },

    email: {
      type: String,
      required: [true, "Please Enter Your Email"],
      unique: true,
      validate: [validator.isEmail, "Please Enter a valid Email"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please Enter Your Password"],
      minLength: [8, "Password should be greater than 8 characters"],
      select: false,
      trim: true,
    },
    address: {
      locality: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String, default: "India" }, // Assuming the country is always India
    },
    role: {
      type: String,
      default: "user",
    },
    businessName: {
      type: String,
      required: [true, "Please Enter Your Business Name"],
      maxLength: [30, "Business Name cannot exceed 30 characters"],
      minLength: [4, "Business Name should have more than 4 characters"],
    },
    businessType: {
      type: String,
      required: [true, "Please choose Your Business Type"],
      // $in: ["business1, business2"],
    },
    image: {
      type: String,
    },
    phoneNumber: {
      type: Number,
      required: [true, "Please enter your phone Number"],
      maxlength: [10, "Phone number cannot exceed more than 10"],
      trim: true,
      unique: true,
    },
    phoneOtp: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    referredBy: {
      type: String,
      trim: true,
    },
    taxFile: {
      type: String,
      trim: true,
      // create enum of monthly and quarterly
      enum: ["monthly", "quarterly"],
      default: "monthly",
    },
    GstIN: {
      type: String,
      trim: true,
    },
    upi_id: {
      type: String,
      required: false,
    },

    latitude: {
      type: String,
      //required: true,
    },
    longitude: {
      type: String,
      //required: true,
    },
    openingTime: {
      type: String,
      // required: true
    },
    closingTime: {
      type: String,
      // required: true
    },
    shopOpen: {
      type: Boolean,
      default: true,
    },

    pin:{
      type: Number
    },
    isPin:{
      type: Boolean,
      default: false
    },
    numSales:{
      type: Number,
      default: 0,
    },
    numPurchases:{
      type: Number,
      default: 0,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
