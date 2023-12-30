const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
    phoneNumber:{
        type: Number,
        required:true,
    },
    otp:{
        type: String,
        required:true
    },
    createdAt: {
        type:Date,
        default:Date.now,
        index: {
            expires:300
        }
    }
},{timestamps:true});

module.exports = mongoose.model("otpModel", otpSchema);
