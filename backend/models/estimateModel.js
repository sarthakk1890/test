const mongoose = require("mongoose");

const estimateSchema = new mongoose.Schema({
  orderItems: [
    {
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        // required: true,
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
      saleSGST:{
        type:Number
      },
      saleCGST:{ 
        type:Number
      },
      baseSellingPrice:{
        type: Number
      },
      saleIGST:{
        type: Number
      },
      hsn:{
        type:String
      },
      discountAmt:{
        type:Number
      },
      originalbaseSellingPrice:{
        type: Number
      }
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: String,
  },
  reciverName:{
    type: String
  },
  businessName:{
    type: String
  },
  businessAddress:{
    type: String
  },
  gst:{
    type: String
  }

});

module.exports = mongoose.model("estimateModel", estimateSchema);
