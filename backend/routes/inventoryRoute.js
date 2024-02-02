const express = require("express");
const multer = require('multer');
const {
  getAllInventories,
  createInventory,
  updateInventory,
  deleteInventory,
  getInventoryDetails,
  getAllInventoriesAndSearch,
  getInventoryForUser,
  findInventoryByBarcode,
  bulkUpload,
  availablility,
  updateExistingInventories,
  addInventoryImage
} = require("../controllers/inventoryController");
const { isAuthenticatedUser, isSubscribed } = require("../middleware/auth");

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router
  .route("/inventory/barcode/:code")
  .get(isAuthenticatedUser, findInventoryByBarcode);

router
  .route("/inventories")
  .get(isAuthenticatedUser, getAllInventoriesAndSearch);

router.route("/inventories/all").get(isAuthenticatedUser, getAllInventories);

router.route("/inventory/new").post(isAuthenticatedUser, createInventory);
router.route("/inventory/image").post(isAuthenticatedUser, addInventoryImage);

router.route("/inventory/bulk").post(upload.single('excelFile'), bulkUpload);

// Add the following route for updating existing inventories
router.route("/inventory/update-existing").post(isAuthenticatedUser, updateExistingInventories);

router.route("/inventory/me").get(isAuthenticatedUser, getInventoryForUser);

router.route("/update/inventory/:id").put(isAuthenticatedUser, updateInventory);

router.route("/del/inventory/:id").delete(isAuthenticatedUser, deleteInventory);

router.route("/inventory/:id").get(isAuthenticatedUser, getInventoryDetails);

router.route("/inventory/:productId/:status").get(isAuthenticatedUser, availablility)


module.exports = router;
