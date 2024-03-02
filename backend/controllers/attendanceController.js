const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const moment = require('moment-timezone');
const Attendance = require("../models/attendanceModel");

//-----Helper functions-----
function currentDate() {
    const indiaTime = moment.tz('Asia/Kolkata');
    const currentDateTimeInIndia = indiaTime.add(3, 'days').format('YYYY-MM-DD HH:mm:ss');
    return currentDateTimeInIndia;
}

// Mark attendance
exports.markAttendance = catchAsyncErrors(async (req, res, next) => {

    const { party, status } = req.body;

    let attendanceRecord = await Attendance.findOne({ party });

    if (!attendanceRecord) {
        attendanceRecord = await Attendance.create({ party });
    }

    switch (status) {
        case 'present':
            attendanceRecord.present.push(currentDate());
            break;
        case 'absent':
            attendanceRecord.absent.push(currentDate());
            break;
        case 'sickLeave':
            attendanceRecord.sickLeaves.push(currentDate());
            break;
        case 'casualLeave':
            attendanceRecord.casualLeaves.push(currentDate());
            break;
        default:
            return res.status(400).json({
                success: false,
                message: 'Invalid status provided',
            });
    }

    await attendanceRecord.save();

    res.status(201).json({
        success: true,
        attendanceRecord,
    });
});

//Get attendance details of a party --> Using party id
exports.getAttendance = catchAsyncErrors(async (req, res, next) => {
    
    const { id } = req.params;

    const foundAttendance = await Attendance.findOne({ party: id });

    if (!foundAttendance) {
        return res.status(404).json({
            success: false,
            message: 'Attendance details not found for the party',
        });
    }

    res.status(200).json({
        success: true,
        attendanceDetails: {
            totalPresent: foundAttendance.present.length,
            totalAbsent: foundAttendance.absent.length,
            totalCasualLeaves: foundAttendance.casualLeaves.length,
            totalSickLeaves: foundAttendance.sickLeaves.length,
        },
    });
});