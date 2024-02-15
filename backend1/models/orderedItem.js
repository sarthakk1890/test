const mongoose = require("mongoose");

const orderedItemSchema = mongoose.Schema({
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "inventory",
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      productPrice: {
        type: Number,
        required: true,
      },
      productImage: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      status:{
        type: String,
        // enum: ['pending', 'confirmed','dispatched','delivered','rejected','cancelled','refunded'],
        default: 'pending'
      },
      
      sellerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      sellerName:{
        type: String,
      }
    },
  ],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  isPaid:{
    type: Boolean,
    default: false
  },
  orederStatus:{
    type: String
  },
  consumerId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Consumer",
    required: true,
  },

  consumerName:{
    type: String
  },
  sellerNum:{
    type: String
  },
  sellerUpi:{
    type: String
  },
  invoiceNum:{
    type: String
  },
  

addresses: {
    name:{
      type: String
    },
     country: {
      type: String,
      default: "india"
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
date:{
  type: Date,
  default: Date.now,
},

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("orderedItem", orderedItemSchema);
