const express = require("express");
const router = express.Router();
var tablemodel = require("../models/orderedItem");

router.get("/api/table", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch data in descending order by creation date (newest first)
    const data = await tablemodel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalItems = await tablemodel.countDocuments();

    const arr = [];
    for (const order of data) {
      for (const item of order.items) {
        const dataInfo = {
          date: order.createdAt.toLocaleDateString("en-US"),
          orderId: order._id,
          orderStatus: item.status,
          sellerName: item.sellerName,
          price: parseFloat(item.productPrice),
          status: item.status,
          productName: item.productName,
          quantity: item.quantity,
          total: item.quantity * item.price,
        };
        arr.push(dataInfo);
      }
    }

    return res.render("table", {
      data: arr,
      page: page,
      pages: Math.ceil(totalItems / limit),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports = router;
