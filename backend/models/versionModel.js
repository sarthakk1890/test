const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
    version: {
        type: String
    }
});

module.exports = mongoose.model("VersionControl", versionSchema);
