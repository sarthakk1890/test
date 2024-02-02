const mongoose = require("mongoose");

const subProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    inventoryId: {
        type: mongoose.Schema.ObjectId,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});

const processSchema = new mongoose.Schema(
    {
        inventory: {
            type: mongoose.Schema.ObjectId,
            ref: 'Inventory',
            required: true
        },
        subProducts: {
            type: [subProductSchema],
            required: false,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("processModel", processSchema);
