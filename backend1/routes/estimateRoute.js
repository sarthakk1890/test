const express = require("express");

const { isAuthenticatedUser } = require("../middleware/auth");
const { createEstimate, updateEstimate, convertEstimateToSalesOrder, getEstimate, getAllEstimates, getNumberofEstimates, resetEstimatesCount } = require("../controllers/estimateController");

const router = express.Router();

router.route("/estimate/new").post(isAuthenticatedUser, createEstimate);

// router.route("/estimate/all").get(isAuthenticatedUser, getAllEstimates);

router.route("/estimate/:id")
.post(isAuthenticatedUser, convertEstimateToSalesOrder)
.put(isAuthenticatedUser, updateEstimate);

router.route("/estimate/:estimateNum")
.get(isAuthenticatedUser, getEstimate)

router.route("/estimatesNum")
  .get(isAuthenticatedUser, getNumberofEstimates)
  .put(isAuthenticatedUser, resetEstimatesCount)

module.exports = router;
