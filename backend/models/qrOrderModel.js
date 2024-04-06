const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true
    },
    barCode: {
        type: String
    },
    image: {
        type: String
    },
    quantity: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    hsn: {
        type: String
    },
    mrp: {
        type: Number
    },
    purchasePrice: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    GSTRate: {
        type: Number
    },
    saleSGST: {
        type: Number
    },
    saleCGST: {
        type: Number
    },
    saleIGST: {
        type: Number
    },
    baseSellingPrice: {
        type: Number
    },
    purchaseSGST: {
        type: Number
    },
    purchaseCGST: {
        type: Number
    },
    purchaseIGST: {
        type: Number
    },
    basePurchasePrice: {
        type: Number
    },
    sellerName: {
        type: String
    },
    batchNumber: {
        type: String
    },
    expiryDate: {
        type: Date
    },
    quantityToBeSold: {
        type: Number
    }
});


const itemDetails = mongoose.Schema({
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        // required: true
    },
    product: {
        type: productSchema,
        required: true,
    },
    saleCGST: {
        type: Number,
        maxLength: [10, "CGST Rate cannot exceed 5 characters"],
    },
    saleSGST: {
        type: Number,
        maxLength: [10, "CGST Rate cannot exceed 5 characters"],
    },
    saleIGST: {
        type: Number,
    },
    baseSellingPrice: {
        type: Number,
    },
    discountAmt: {
        type: Number,
    },
    originalbaseSellingPrice: {
        type: Number,
    }
})

const qrOrderSchema = mongoose.Schema({
    orderItems: {
        type: [itemDetails]
    },
    tableNo: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: String,
    }
});

module.exports = mongoose.model("QrOrderModel", qrOrderSchema);