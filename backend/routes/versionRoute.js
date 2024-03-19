const express = require('express');
const { editVersion, getVersion } = require('../controllers/versionController');
const router = express.Router();

router.get("/latest", getVersion);
router.put("/update", editVersion);

module.exports = router; 