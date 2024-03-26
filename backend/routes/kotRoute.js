const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const { createKot, getKot, updateKot, getSingleKot, deletekot } = require("../controllers/kotController");
const { create } = require("../models/agentModel");
const { createBillingOrder, getBillingOrder, updateBillingOrder, deleteBillingOrder, updateOrderStatus } = require("../controllers/billingOrderController");

const router = express.Router();

router.post("/kot/new", isAuthenticatedUser, createKot);
router.get("/kot/all", isAuthenticatedUser, getKot);
router.put("/kot/:id", isAuthenticatedUser, updateKot);
router.get("/kot/:id", isAuthenticatedUser, getSingleKot);
router.delete("/kot/:kotId", isAuthenticatedUser, deletekot);

//----Billing Order Routes------------
router.post("/billingorder/new", isAuthenticatedUser, createBillingOrder);
router.get("/billingorder/all", isAuthenticatedUser, getBillingOrder);
router.put("/billingorder/:kotId", isAuthenticatedUser, updateBillingOrder)
router.delete("/billingorder/:kotId", isAuthenticatedUser, deleteBillingOrder)

router.put("/billingorder/change/:kotId", isAuthenticatedUser, updateOrderStatus)

module.exports = router;
