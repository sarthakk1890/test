const express = require("express");
const router = express.Router();
const xlsx = require('xlsx');
const { bulkUpload,bulkUpload3} = require("../controllers/bulkController");
const { isAuthenticatedAgent } = require("../middleware/auth");
const multer = require('multer')
//multerconnection

  
  



  
  // app.post('/api/v1/bulkupload/:id', upload.single('file'), async (req, res) => );

module.exports = router;