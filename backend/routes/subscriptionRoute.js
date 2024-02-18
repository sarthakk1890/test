const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const {
    // getSubscriptionPlanById, 
    // createSubscriptionPlan, 
    // getAllSubscription, 
    createSubscription, paymentVerification } = require("../controllers/subscriptionController");

const router = express.Router();

// router.post("/plan/new", isAuthenticatedUser, createSubscriptionPlan);
// router.get("/plan/all", isAuthenticatedUser, getAllSubscription);
// router.get("/plan/:id", isAuthenticatedUser, getSubscriptionPlanById);

router.get("/new", createSubscription);
router.post("/paymentVerification", paymentVerification);

module.exports = router;
