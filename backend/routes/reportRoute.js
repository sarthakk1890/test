const express = require("express");
const { getReportofUser } = require("../controllers/reportController");
const { isAuthenticatedUser, isSubscribed } = require("../middleware/auth");

const router = express.Router();
// get purchase report  , sales report ,  expense report of user between starting date and end date
router.route("/report").get(isAuthenticatedUser, getReportofUser);

module.exports = router;
