const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const versionModel = require("../models/versionModel");

exports.updateVersionByAppName = catchAsyncErrors(async (req, res, next) => {
    const { app } = req.params;
    const { version } = req.body;

    let updatedVersion = await versionModel.findOneAndUpdate({ app }, { version }, { new: true });

    if (!updatedVersion) {
        updatedVersion = new versionModel({ app, version });
        await updatedVersion.save();
    }

    res.status(200).json({ success: true, data: updatedVersion });
});

exports.getVersion = catchAsyncErrors(async (req, res, next) => {

    const { app } = req.params;

    const version = await versionModel.findOne({ app });
    if (!version) {
        return res.status(404).json({ success: false, message: "Version not found" });
    }
    res.status(200).json({ success: true, data: version });
})

// Create a new collection
exports.createVersion = catchAsyncErrors(async (req, res, next) => {
    const { app, version } = req.body;

    const newCollection = new versionModel({ app, version });
    await newCollection.save();

    res.status(201).json({ success: true, data: newCollection });
});