// const mongoose = require("mongoose");

// /// commit
// const purchaseSchema = new mongoose.Schema({
//   orderItems: [
//     {
//       name: {
//         type: String,
//         // required: true,
//       },
//       price: {
//         type: Number,
//         required: true,
//       },
//       quantity: {
//         type: Number,
//         required: true,
//       },
//       image: {
//         type: String,
//       },
//       product: {
//         type: mongoose.Schema.ObjectId,
//         ref: "Product",
//         required: true,
//       },
//       purchaseSGST: {
//         type: Number,

//       },
//       purchaseCGST: {
//         type: Number,

//       },
//       purchaseIGST: {
//         type: Number,
//       },
//       basePurchasePrice: {
//         type: Number,
//       },
//       hsn:{
//         type:String
//       },
//       discountAmt:{
//         type:Number
//       },
//       originalbasePurchasePrice:{
//         type: Number
//       }
//     },
//   ],
//   total: {
//     type: Number,
//     required: true,
//   },
//   modeOfPayment: {
//     type: String,
//     enum: ["Cash", "Credit", "Bank Transfer", "Settle","UPI"],
//     required: true,
//   },
//   party: {
//     type: mongoose.Schema.ObjectId,
//     ref: "Party",
//     required: false,
//   },
//   user: {
//     type: mongoose.Schema.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   invoiceNum:{
//     type: String
//   },
//   date:{type: Date,
//     default: Date.now
//   },
//   createdAt: {
//     type: String,
//     // default: Date.now,
//   },
//   businessName:{
//     type:String
//   },
//   businessGST:{
//     type:String
//   }
// });

// module.exports = mongoose.model("PurchaseModel", purchaseSchema);


const mongoose = require("mongoose");

const paymentModeSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ["Cash", "Credit", "Bank Transfer", "Settle", "UPI"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const purchaseSchema = new mongoose.Schema({
  orderItems: [
    {
      name: {
        type: String,
        // required: true,
      },
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
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
      purchaseSGST: {
        type: Number,
      },
      purchaseCGST: {
        type: Number,
      },
      purchaseIGST: {
        type: Number,
      },
      basePurchasePrice: {
        type: Number,
      },
      hsn: {
        type: String,
      },
      discountAmt: {
        type: Number,
      },
      originalbasePurchasePrice: {
        type: Number,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  
  modeOfPayment: [paymentModeSchema], // Array of payment modes
  
  party: {
    type: mongoose.Schema.ObjectId,
    ref: "Party",
    required: false,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  invoiceNum: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: String,
    // default: Date.now,
  },
  businessName: {
    type: String,
  },
  businessGST: {
    type: String,
  },
});

module.exports = mongoose.model("PurchaseModel", purchaseSchema);
