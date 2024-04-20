const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const subUserModel = require("../models/subUserModel");
const sendToken = require("../utils/jwtToken");

exports.registerSubUser = catchAsyncErrors(async (req, res, next) => {

    if (req.cookies.token_subuser) {
        return next(new ErrorHandler("Access Restricted: Unauthorized User", 403));
    }

    const user = req.user._id;
    req.body.user = user;
    const subUser = await subUserModel.create(req.body);
    res.status(200).json({
        success: true,
        subUser,
        message: "Sub User created successfully",
    });
});


// exports.loginSubUser = catchAsyncErrors(async (req, res, next) => {
//     const { email, password } = req.body;
//     if (!email || !password) {
//         return next(new ErrorHandler("Please enter email and password", 400));
//     }
//     const subUser = await subUserModel.findOne({ email }).populate('user').select("+password");
//     if (!subUser) {
//         console.log("wrong password");
//         return next(new ErrorHandler("Invalid email or password", 400));
//     }
//     const isPasswordMatched = await subUser.comparePassword(password);
//     if (!isPasswordMatched) {
//         console.log("wrong password");
//         return next(new ErrorHandler("Invalid email or password", 400));
//     }
//     const user = subUser.user;
//     if (!user.subscription_status || user.subscription_status !== 'active') {
//         return next(new ErrorHandler("Your subscription is not active", 403));
//     }
//     sendToken(user, 200, res, subUser);
// })

// Edit Sub User
exports.editSubUser = catchAsyncErrors(async (req, res, next) => {

    if (req.cookies.token_subuser) {
        return next(new ErrorHandler("Access Restricted: Unauthorized User", 403));
    }

    const { subUserId } = req.params;
    const { name, email, phoneNumber, role, password } = req.body;

    // Find the subuser by ID
    let subUser = await subUserModel.findOne({ _id: subUserId, user: req.user._id });
    if (!subUser) {
        return next(new ErrorHandler("Subuser not found", 404));
    }

    // Update subuser details
    subUser.name = name || subUser.name;
    subUser.email = email || subUser.email;
    subUser.phoneNumber = phoneNumber || subUser.phoneNumber;
    subUser.role = role || subUser.role;

    if (password) {
        subUser.password = password;
    }

    // Save the updated subuser
    await subUser.save();

    res.status(200).json({
        success: true,
        subUser,
        message: "Subuser updated successfully",
    });
});

// Delete Sub User
exports.deleteSubUser = catchAsyncErrors(async (req, res, next) => {

    if (req.cookies.token_subuser) {
        return next(new ErrorHandler("Access Restricted: Unauthorized User", 403));
    }

    const { subUserId } = req.params;

    // Find the subuser by ID and delete
    const subUser = await subUserModel.findByIdAndDelete(subUserId);
    if (!subUser) {
        return next(new ErrorHandler("Subuser not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Subuser deleted successfully",
    });
});

//Get list of subUsers
exports.getAllSubUsers = catchAsyncErrors(async (req, res, next) => {

    if (req.cookies.token_subuser) {
        return next(new ErrorHandler("Access Restricted: Unauthorized User", 403));
    }

    const user = req.user._id;

    const subUsers = await subUserModel.find({ user });
    res.status(200).json({
        success: true,
        subUsers,
    });
});

//Get subUser from ID
exports.getSubUserDetails = catchAsyncErrors(async (req, res, next) => {

    if (req.cookies.token_subuser) {
        return next(new ErrorHandler("Access Restricted: Unauthorized User", 403));
    }

    const subUserId = req.params.id;
    const user = req.user._id;

    const subUSer = await subUserModel.findOne({ _id: subUserId, user });

    if (!subUSer) {
        return next(new ErrorHandler("Subuser not found", 404));
    }

    res.status(200).json({
        success: true,
        subUSer,
    });

})