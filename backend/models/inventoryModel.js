const mongoose = require("mongoose");

const subProductSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  inventoryId: {
    type: mongoose.Schema.ObjectId,
    required: true, 
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const inventorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      // required: [true, "Please Enter inventory Name"],
      trim: true,
      // unique: true,
    },
    discount: {
      type: Number
    },
    description: {
      type: String,
      // required: [true, "Please Enter inventory Description"],
    },
    purchasePrice: {
      type: Number,
      // required: true,
      // required: [true, "Please Enter purchasing price of inventory"],
      maxLength: [8, "Price cannot exceed 8 characters"],
    },
    sellingPrice: {
      type: Number,
      // required: true,
      // required: [true, "Please Enter selling price of inventory"],
      maxLength: [8, "Price cannot exceed 8 characters"],
    },

    //------Added MRP--------------
    mrp:{
      type: Number,
      required: false
    },

    returnPeriod: {
      type: Number,
      default: 0,
    },
    barCode: {
      type: String,
      required: false,
    },
    img: {
      // type:String,
      data: Buffer,
      contentType: String,
      // required:true,
      // default:
      //   "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    image: {
      type: String,
      // required: true,
      // default:"https://res.cloudinary.com/dpzjsgt4s/image/upload/v1649381378/Inventories/download_pfzdir.jpg",
    },

    category: {
      type: String,
      // required: [true, "Please Enter inventory Category"],
    },
    quantity: {
      type: Number,
      required: false,
      maxLength: [7, "Stock cannot exceed 4 characters"],
      default: 1,
    },

    subProducts: {
      type: [subProductSchema],
      required: false,
    },

    GSTincluded: {
      type: Boolean,
    },
    GSTRate: {
      type: Number,
      maxLength: [5, "GST Rate cannot exceed 5 characters"],
    },
    saleSGST: {
      type: Number,
      maxLength: [10, "SGST Rate cannot exceed 5 characters"],
    },
    saleCGST: {
      type: Number,
      maxLength: [10, "CGST Rate cannot exceed 5 characters"],
    },
    saleIGST: {
      type: Number,
    },
    baseSellingPrice: {
      type: Number,
    },
    purchaseSGST: {
      type: Number,
      maxLength: [10, "SGST Rate cannot exceed 5 characters"],
    },
    purchaseCGST: {
      type: Number,
      maxLength: [10, "CGST Rate cannot exceed 5 characters"],
    },
    purchaseIGST: {
      type: Number,
    },
    basePurchasePrice: {
      type: Number,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    rating: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Consumer",
      },
    ],
    avgRating: {
      type: Number,
    },
    sellerName: {
      type: String,
    },
    batchNumber: {
      type: String
    },
    expiryDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    available: {
      type: Boolean,
      default: true,
    },
    hsn: {
      type: String,
    },

    //Added unit
    unit:{
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("inventory", inventorySchema);
