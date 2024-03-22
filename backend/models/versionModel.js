const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
    app: {
        type: String,
        enum: ["bharatPos-subscriptions", "bharatPos"],
    },
    version: {
        type: String
    }
});

module.exports = mongoose.model("VersionControl", versionSchema);
