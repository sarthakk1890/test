const express = require("express");

const { isAuthenticatedUser } = require("../middleware/auth");
const { createEstimate, updateEstimate, convertEstimateToSalesOrder, getEstimate, getAllEstimates } = require("../controllers/estimateController");

const router = express.Router();

router.route("/estimate/new").post(isAuthenticatedUser, createEstimate);

// router.route("/estimate/all").get(isAuthenticatedUser, getAllEstimates);

router.route("/estimate/:id")
// .get(isAuthenticatedUser, getEstimate)
.put(isAuthenticatedUser, updateEstimate)
.post(isAuthenticatedUser, convertEstimateToSalesOrder);

module.exports = router;