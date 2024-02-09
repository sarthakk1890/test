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
   discountAmt:{
      type: Number,
   },
   createdAt: {
      type: String,
      required: true
   }
})

const kotSchema = mongoose.Schema({
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


// sample data
// {
//     "invoiceNum":"B257",
//     "guestName":"Raj",
//     "nuberOfGuest":2,
//     "address":{
//         "city":"Mandla",
//         "state":"MP",
//         "country": "INDIA",
//         "streetAddress":"Mandla"
//     },
//     "number":700061754,
//     "company":"MagicStep Solution",
//     "gst":"BI7987985",
//     "checkIn":"08/08/2023",
//     "checkOut":"10/08/2023",
//     "days":2,
//     "roomNo":"102A",
//     "otherCharges":50,
//     "adv":500,
//     "dis":200
// }
