const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");

const {
  registerParty,
  getAllParty,
  getSingleParty,
  updateParty,
  deleteParty,
  getMyParties,
  searchParty,
  getCreditSaleParties,
  getCreditPurchaseParties,
} = require("../controllers/partyController");
const cntlr = require("../controllers/partyController");
const router = express.Router();

router
  .route("/party/sale/credit")
  .get(isAuthenticatedUser, getCreditSaleParties);
router
  .route("/party/purchase/credit")
  .get(isAuthenticatedUser, getCreditPurchaseParties);
router
  .route("/party/purchase/credit/:id")
  .get(isAuthenticatedUser, cntlr.getCreditPurchaseParty);
router
  .route("/party/sale/credit/:id")
  .get(isAuthenticatedUser, cntlr.getCreditSaleParty);
router.route("/party/new").post(isAuthenticatedUser, registerParty);
router.route("/party/search").get(isAuthenticatedUser, searchParty);

router.route("/party/all").get(getAllParty);
router.route("/party/me").get(isAuthenticatedUser, getMyParties);

router.route("/party/:id").get(isAuthenticatedUser,getSingleParty);

router.route("/update/party/:id").put(isAuthenticatedUser,updateParty);

router.route("/del/party/:id").delete(isAuthenticatedUser,deleteParty);

module.exports = router;
