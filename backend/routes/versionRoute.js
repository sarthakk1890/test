const express = require('express');
const { getVersion, createVersion, updateVersionByAppName } = require('../controllers/versionController');
const { watch } = require('../models/partyModel');
const router = express.Router();

router.get("/latest/:app", getVersion);
router.put("/update/:app", updateVersionByAppName);
router.post("/new", createVersion)

module.exports = router;