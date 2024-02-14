const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    inventory: {
        type: mongoose.Schema.ObjectId,
        ref: "Product"
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

const billingOrderSchema = mongoose.Schema({
    kotId: {
        type: String
    },
    orderItems: {
        type: [itemDetails]
    },
    tableNo: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: String
    }
});

module.exports = mongoose.model("BillingOrderModel", billingOrderSchema);