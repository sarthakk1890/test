const mongoose = require("mongoose");

const productList = mongoose.Schema({
  name: {
    type: String,
    // required: [true, "Please Enter inventory Name"],
    trim: true,
    // unique: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
    // required: [true, "Please Enter selling price of inventory"],
    maxLength: [8, "Price cannot exceed 8 characters"],
  },
  barCode: {
    type: String,
    // required: true,
  },
  image: {
    type: String,
  },
  GSTRate: {
    type: Number,
    maxLength: [5, "GST Rate cannot exceed 5 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
  }
});

module.exports = mongoose.model("products", productList);
