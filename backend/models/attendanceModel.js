const mongoose = require("mongoose");

const attendanceModel = new mongoose.Schema({

    party: {
        type: mongoose.Schema.ObjectId,
        ref: "Party",
        required: true
    },

    present: {
        type: [String],
        default: []
    },

    absent: {
        type: [String],
        default: []
    },

    casualLeaves: {
        type: [String],
        default: []
    },

    sickLeaves: {
        type: [String],
        default: []
    },
});

module.exports = mongoose.model("Attendance", attendanceModel);
