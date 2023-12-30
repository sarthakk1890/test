var Tabledb = require("../models/orderedItem");

//create and save new items
exports.create = (req, res) => {
  const table = new Tabledb({
    date: req.body.createdAt,
    sellerName: req.body.sellerName,
    productId: req.body.productId,
    status: req.body.status,
    productName: req.body.productName,
    // productPrice: req.body.productPrice,
  });
  table
    .save(table)
    .then((data) => {
      res.redirect("/table");
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating",
      });
    });
};
