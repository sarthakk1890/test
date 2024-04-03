const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const subUserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
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

        phoneNumber: {
            type: Number,
            required: [true, "Please enter your phone Number"],
            maxlength: [10, "Phone number cannot exceed more than 10"],
            trim: true,
            unique: true,
        },

        role: {
            type: String,
            default: "staff"
        },

        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },

        emailOTP: String,

        emailOTPExpire: Date,

        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    { timestamps: true }
);

subUserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
subUserSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

subUserSchema.methods.generateAndStoreOTP = async function () {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in the user document
    this.emailOTP = otp;
    this.emailOTPExpire = Date.now() + 15 * 60 * 1000;

    // Save the user document
    await this.save();

    return otp;
};

// Compare Password
subUserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generating Password Reset Token
subUserSchema.methods.getResetPasswordToken = function () {
    // Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hashing and adding resetPasswordToken to subUserSchema
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model("SubUser", subUserSchema);
