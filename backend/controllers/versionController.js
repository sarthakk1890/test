const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const versionModel = require("../models/versionModel");

exports.editVersion = catchAsyncErrors(async (req, res, next) => {
    let version = await versionModel.findOne();
    if (!version) {
        version = new versionModel(req.body);
        await version.save();
    } else {
        version.set(req.body);
        await version.save();
    }
    res.status(200).json({ success: true, data: version });
})

exports.getVersion = catchAsyncErrors(async (req, res, next) => {
    const version = await versionModel.findOne();
    if (!version) {
        return res.status(404).json({ success: false, message: "Version not found" });
    }
    res.status(200).json({ success: true, data: version });
})