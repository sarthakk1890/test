const mongoose = require("mongoose");

const itemDetails = mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   quantity: {
      type: Number,
      // required: true
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
   discountAmt: {
      type: Number,
   },
   createdAt: {
      type: String,
      required: true
   }
})

const kotSchema = mongoose.Schema({
   kotId: {
      type: String
   },
   item: {
      type: [itemDetails]
   },
   date: {
      type: String
   },
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
   }
});

module.exports = mongoose.model("kotModel", kotSchema);