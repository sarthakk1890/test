const mongoose = require("mongoose");

const expenseSchema = mongoose.Schema({
  header: {
    type: String,
    required: [true, "Please Enter income header"],
    trim: true,
  },
  description: {
    type: String,
  },
  amount: {
    type: Number,
    required: [true, "Please Enter expense amount"],
    minLength: [1, "Price should atleast be 1 character"],
  },

  modeOfPayment: {
    type: String,
    required: [true, "Please choose your mode of payment"],
    $in: ["cash", "bank_transfer"],
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  date:{
    type: String
  },
  
  createdAt: {
    type: Date,
     default: Date.now,
  },
});

module.exports = mongoose.model("expenseModel", expenseSchema);
