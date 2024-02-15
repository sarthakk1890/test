const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const consumerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
    minlength: [4, "Name must be at least 4 characters"],
  },

  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    trim: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phoneNumber: {
    type: Number,
    required: [true, "Please enter your phone Number"],
    maxlength: [10, "Phone number cannot exceed more than 10"],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  cart: {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product: [
      {
        productName: {
          type: String,
        },
        sellerName: {
          type: String,
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "inventory",
        },
        qty: {
          type: Number,
        },
        price: {
          type: Number,
        },
        image: {
          type: String,
        },
      },
    ],
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
  },
  addresses: {
    type: [
      {
        name: {
          type: String,
        },
        country: {
          type: String,
          // required: true,
        },
        state: {
          type: String,
          // required: true,
        },
        city: {
          type: String,
          // required: true,
        },
        phoneNumber: {
          type: Number,
          // required: true,
        },
        pinCode: {
          type: String,
          // required: true,
        },
        streetAddress: {
          type: String,
          // required: true,
        },
        additionalInfo: {
          type: String,
        },
        landmark: {
          type: String,
        },
        latitude: {
          type: String,
        },
        longitude: {
          type: String,
        },
      },
    ],
    default: [], // Initialize as an empty array
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
consumerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});
// JWT TOKEN
consumerSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
// COMPARE PASSWORD
consumerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Consumer", consumerSchema);
