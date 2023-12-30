const mongoose = require('mongoose');

const forceUpdateSchema = new mongoose.Schema({
    forceUpdateCube: {
        type: Boolean,
        required: true,
        default: false
    },
    forceUpdateBuyNow: {
        type: Boolean,
        required: true,
        default: false
    },
    forceUpdateCute: {
        type: Boolean,
        required: true,
        default: false
    },
   
}, {
    timestamps: true
});

const ForceUpdate = mongoose.model('ForceUpdate', forceUpdateSchema);

module.exports = ForceUpdate;
