const mongoose = require("mongoose");

const incomeSchema = mongoose.Schema({
  header: {
    type: String,
    required: [true, "Please Enter income header"],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
  },
  amount: {
    type: Number,
    required: [true, "Please Enter income amount"],
    minLength: [1, "Price should atleast be 1 character"],
  },

  modeOfPayment: {
    type: String,
    required: [true, "Please choose your mode of payment"],
    $in: ["cash", "bank transfer"],
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
});

module.exports = mongoose.model("incomeModel", incomeSchema);
