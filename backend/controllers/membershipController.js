const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const MemberShip = require("../models/membershipPlans");
const ActiveMembership = require("../models/activeMemberships");
const moment = require('moment-timezone');
const Sales = require('../models/salesModel');
const User = require('../models/userModel');

//-----Helper functions-----
function currentDate() {
    const indiaTime = moment.tz('Asia/Kolkata');
    const currentDateTimeInIndia = indiaTime.add(0, 'days').format('YYYY-MM-DD HH:mm:ss');
    return currentDateTimeInIndia;
}

// Create new membership
exports.newMembership = catchAsyncErrors(async (req, res, next) => {
    const { plan, validity, sellingPrice } = req.body;

    if (!(plan && validity && sellingPrice)) {
        return next(new ErrorHandler("Plan, validity and sellingPrice are mandatory", 400));
    }

    req.body.user = req.user._id;

    const memberShip = await MemberShip.create(req.body);

    res.status(201).json({
        success: true,
        memberShip,
    });
});


//Sell membership
exports.sellMembership = catchAsyncErrors(async (req, res, next) => {
    const { party, membership, validity = 365 } = req.body;

    if (!(party && membership)) {
        return next(new ErrorHandler("Party and Membership are mandatory", 400));
    }

    const existingPlan = await ActiveMembership.findOne({ party, membership });

    if (existingPlan) {
        return next(new ErrorHandler("A plan with the provided party and membership already exists", 400));
    }

    const existingMembership = await MemberShip.findById(membership);
    const subscription_type = existingMembership.subscription_type;

    req.body.createdAt = currentDate();
    req.body.updatedAt = currentDate();
    req.body.checkedAt = currentDate();
    req.body.lastPaid = currentDate();
    req.body.user = req.user._id;
    req.body.activeStatus = true;
    req.body.validity = validity;

    if (subscription_type === 'postpaid') {
        req.body.due = 0;
    } else if (subscription_type === 'prepaid') {
        req.body.due = existingMembership.sellingPrice - req.body.total;
        await Sales.create(req.body);
        // Increment numSales in User model
        await User.findByIdAndUpdate(req.user._id, { $inc: { numSales: 1 } });
    }

    const newPlan = await ActiveMembership.create(req.body);

    res.status(201).json({
        success: true,
        newPlan,
    });

});


//Get plan by id --> (Sold membership ID)
exports.getPlan = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const plan = await ActiveMembership.findById(id)
        .populate('user', 'name email')
        .populate('party', 'name address phoneNumber type guardianName')
        .populate('membership', 'plan validity sellingPrice GSTincluded GSTRate CGST SGST IGST membershipType');

    if (!plan) {
        return next(new ErrorHandler('Plan not found', 404));
    }

    res.status(200).json({
        success: true,
        plan,
    });
});

//Get all plans
exports.getAllPlans = catchAsyncErrors(async (req, res, next) => {

    const user = req.user._id;

    const allPlans = await MemberShip.find({ user });

    if (!allPlans) {
        return next(new ErrorHandler('No plans found for this user', 404));
    }

    res.status(200).json({
        success: true,
        allPlans,
    });

})

//Get all memberships of a party by Id
exports.getAllMemberships = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const plans = await ActiveMembership.find({ party: id, user: req.user._id })
        .populate('user', 'name email')
        .populate('party', 'name address phoneNumber type guardianName')
        .populate('membership', 'plan validity sellingPrice basePrice GSTincluded GSTRate CGST SGST IGST membershipType');

    if (!plans) {
        return next(new ErrorHandler('No plans found for this Party', 404));
    }

    res.status(200).json({
        success: true,
        plans,
    });
});

//Payment made for Membership
exports.payDue = catchAsyncErrors(async (req, res, next) => {
    const { party, paymentDate, membership } = req.body;

    req.body.createdAt = currentDate();
    req.body.user = req.user._id;

    const activeMember = await ActiveMembership.findOne({ party: party, membership: membership });

    if (!activeMember) {
        return next(new ErrorHandler('No user found for this membership plan', 404));
    }

    activeMember.lastPaid = paymentDate;
    activeMember.due = activeMember.due - req.body.total;

    const savedActiveMember = await activeMember.save();

    const newSale = await Sales.create(req.body);

    // Increment numSales in User model
    await User.findByIdAndUpdate(req.user._id, { $inc: { numSales: 1 } });

    res.status(200).json({
        success: true,
        newSale,
        savedActiveMember
    });
});

//GetMembership
exports.getMembership = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const membership = await MemberShip.findById(id);

    res.status(200).json({
        success: true,
        membership
    });

});

//EditMembership
exports.editMembership = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const updatedMemberShip = await MemberShip.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({
        success: true,
        updatedMemberShip
    });

});

//Get all due
exports.getAllDues = catchAsyncErrors(async (req, res, next) => {
    try {
        const user = req.user._id;

        // Find all active memberships for the user
        const allActiveMemberships = await ActiveMembership.find({ user })
            .populate('user', 'name email')
            .populate('party', 'name address phoneNumber type guardianName createdAt')
            .populate('membership', 'plan validity sellingPrice GSTincluded GSTRate CGST SGST IGST membershipType');

        // Calculate total dues for each party using array reduce
        const partyDuesMap = allActiveMemberships.reduce((acc, membership) => {
            const partyId = membership.party._id;
            const dues = membership.due; // Use 'due' instead of 'dues'

            // If partyId not already in the map, initialize it with dues, else add dues to existing value
            acc[partyId] = (acc[partyId] || 0) + dues;
            return acc;
        }, {});

        // Convert partyDuesMap into array of objects with party information and total dues
        const partyDuesArray = Object.keys(partyDuesMap).map(partyId => ({
            party: allActiveMemberships.find(membership => membership.party._id.toString() === partyId.toString()).party,
            totalDues: partyDuesMap[partyId]
        }));

        res.status(200).json({
            success: true,
            dues: partyDuesArray
        });
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
});


//Delete Membership
exports.deleteMembership = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    await MemberShip.findByIdAndDelete(id);

    await ActiveMembership.deleteMany({ membership: id });

    res.status(200).json({
        success: true,
        message: "Membership Plan deleted successfully"
    })

})

exports.getInactiveMemberships = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;

    const inactiveMemberships = await ActiveMembership.find({ user: userId, activeStatus: false })
        .populate('user', 'name email')
        .populate('party', 'name address phoneNumber type guardianName createdAt');

    res.status(200).json({
        success: true,
        memberships: inactiveMemberships
    });
});
