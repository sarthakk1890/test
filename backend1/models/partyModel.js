const mongoose = require("mongoose");

const partySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter your party name"],
    unique: true,
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  address: {
    type: String,
    // required: [false, "Please enter your address"],
    // maxLength: [200, "Name cannot exceed 30 characters"],
    // minLength: [5, "Name should have more than 4 characters"],
  },
  phoneNumber: {
    type: Number,
    required: [true, "Please enter your phone Number"],
    maxlength: [10, "Phone number cannot exceed more than 10"],
  },
  type: {
    type: String,
    enum: ["supplier", "customer"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Party", partySchema);
