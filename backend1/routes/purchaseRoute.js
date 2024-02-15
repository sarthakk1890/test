const express = require("express");
const {
  newPurchaseOrder,
  getSinglePurchaseOrder,
  myPurchaseOrders,
  getAllPurchaseOrders,
  updatePurchaseOrder,
  deletePurchaseOrder,
  getCreditPurchaseOrders,
  updatePurchaseOrders,
} = require("../controllers/purchaseController");
const router = express.Router();

const {
  isAuthenticatedUser,
  authorizeRoles,
  isAuthenticatedAdmin,
  isSubscribed,
} = require("../middleware/auth");
const cntlr = require("../controllers/purchaseController");

router.route("/purchaseOrder/new").post(isAuthenticatedUser, newPurchaseOrder);

router
  .route("/purchaseOrder/:id")
  .get(isAuthenticatedUser, getSinglePurchaseOrder);

router
  .route("/purchase/credit-history/:id")
  .get(isAuthenticatedUser, cntlr.partyCreditHistory)
  .post(isAuthenticatedUser, cntlr.addCreditHistoryTransaction);

router.route("/purchaseOrders/me").get(isAuthenticatedUser, myPurchaseOrders);
router
  .route("/purchaseOrders/me/credit")
  .get(isAuthenticatedUser, getCreditPurchaseOrders);

router
  .route("/admin/purchaseOrders")
  .get(isAuthenticatedAdmin, authorizeRoles("admin"), getAllPurchaseOrders);

router
  .route("/purchaseOrder/:id")
  .delete(isAuthenticatedUser, deletePurchaseOrder);

router
  .route("/upd/purchaseOrder/:id")
  .put(isAuthenticatedUser, updatePurchaseOrders);

router
  .route("/admin/purchaseOrder/:id")
  .put(isAuthenticatedAdmin, authorizeRoles("admin"), updatePurchaseOrder)
  .delete(isAuthenticatedAdmin, authorizeRoles("admin"), deletePurchaseOrder);

router.route("/purchasesNum")
  .get(isAuthenticatedUser, cntlr.getNumberofPurchases)
  .put(isAuthenticatedUser, cntlr.resetPurchasesCount)

module.exports = router;
