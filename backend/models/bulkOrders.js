const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: String,
    description: String,
    purchaseprice: Number,
    sellingprice: Number,
    barcode: String,
    image: String,
    category: String,
    quantity: Number,
    gstrate: Number,
    salesgst: Number,
    saleigst: Number,
    basesellingprice: Number
  });

//   const Item = mongoose.model('Item', itemSchema);

  module.exports = mongoose.model('Item', itemSchema);