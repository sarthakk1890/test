const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const { createKot, getKot, updateKot, getSingleKot } = require("../controllers/kotController");
const { create } = require("../models/agentModel");
const { createBillingOrder, getBillingOrder, updateBillingOrder } = require("../controllers/billingOrderController");

const router = express.Router();

router.post("/kot/new", isAuthenticatedUser, createKot);
router.get("/kot/all", isAuthenticatedUser, getKot);
router.put("/kot/:id", isAuthenticatedUser, updateKot);
router.get("/kot/:id", isAuthenticatedUser, getSingleKot);

//----Billing Order Routes------------
router.post("/billingorder/new", isAuthenticatedUser, createBillingOrder);
router.get("billingorder/all", isAuthenticatedUser, getBillingOrder);
router.put("billingorder/:id", isAuthenticatedUser, updateBillingOrder)

module.exports = router;
