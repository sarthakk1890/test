const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Inventory = require("../models/inventoryModel");
const { response } = require("../app");

router.post("/getShopRating/:sellerId", async (req, res) => {
  try {
    // const userId = req.user._id;
    // const userId = await User.findById(user._id);
    const sellerId = req.params.sellerId;
    const seller = await User.findById(sellerId);

    const productWithRating = await Inventory.find({
      user: sellerId,
      avgRating: { $exists: true },
    });
    // console.log(productWithRating);
    let totalRating = 0;
    productWithRating.map((rate) => {
      totalRating += rate.avgRating;
    });
    // console.log(totalRating);
    const rating = totalRating / productWithRating.length;
    // console.log(rating);
    seller.shopRating = rating;
    await seller.save();
    res.send({ rating });
  } catch (error) {
    console.log(error);
    res.status(400).send({ success: false, msg: error.message });
  }
});
module.exports = router;

// if (ratings) {
//   const totalRatings = ratings.length;
//   let sumOfRatings = 0;
//   ratings.forEach((rating) => {
//     sumOfRatings += rating.rating;
//   });
//   const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;
//   console.log(averageRating);
//   res.status(200).send({ success: true, averageRating });
//   const addAvgRating = new User({
//     avgRating: averageRating,
//   });
//   await addAvgRating.save();
// } else {
//   res.status(200).send({ success: true, msg: "no ratings" });
// }
