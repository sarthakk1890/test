const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const { createKot, getKot, updateKot, getSingleKot } = require("../controllers/kotController");

const router = express.Router();

router.post("/kot/new", isAuthenticatedUser, createKot);
router.get("/kot/all", isAuthenticatedUser, getKot);
router.put("/kot/:id", isAuthenticatedUser, updateKot);
router.get("/kot/:id", isAuthenticatedUser, getSingleKot);

module.exports = router;
