const mongoose = require('mongoose');

// Define the main Invoice schema
const invoiceSchema = new mongoose.Schema({
  orderInput: [
    {
      price: Number,
      quantity: Number,
      product: {
        name: String,
        baseSellingPriceGst: Number,
        sellingPrice: Number,
        gstRate: Number,
      },
    },
  ],
  invoice: String,
  address: {
    locality: String,
    city: String,
    state: String,
  },
  companyName: String,
  email: String,
  phone: String,
  date: String,
});

// Create the Invoice model based on the schema
const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
