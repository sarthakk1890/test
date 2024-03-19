const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
    version: {
        type: Number
    }
});

module.exports = mongoose.model("VersionControl", versionSchema);
