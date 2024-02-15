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