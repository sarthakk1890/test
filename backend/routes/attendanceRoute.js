const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");
const { markAttendance, getAttendance } = require('../controllers/attendanceController');

router.post("/mark", isAuthenticatedUser, markAttendance);
router.get("/:id", isAuthenticatedUser, getAttendance);

module.exports = router; 