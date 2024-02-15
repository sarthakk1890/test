const mongoose = require("mongoose");

const ratingItemSchema = mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consumer",
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

const Rating = mongoose.model("Rating", ratingItemSchema);
module.exports = Rating;
