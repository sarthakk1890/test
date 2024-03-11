const express = require("express");
const {
  newSalesOrder,
  getSingleSalesOrder,
  mySalesOrders,
  getAllSalesOrders,
  deleteSalesOrder,
  getCreditSaleOrders,
  UpdateSalesOrder,
  salesReturn,
} = require("../controllers/salesController");
const cntlr = require("../controllers/salesController");
const router = express.Router();
const expiringItemsController = require("../controllers/inventoryController");

const cntrl = require("../controllers/salesController");
const {
  isAuthenticatedUser,
  authorizeRoles,
  isAuthenticatedAdmin,

} = require("../middleware/auth");

router
  .route("/salesOrder/new")
  .post(isAuthenticatedUser, newSalesOrder);

router
  .route("/sales/credit-history/:id")
  .get(isAuthenticatedUser, cntrl.partyCreditHistory)
  .post(isAuthenticatedUser, cntrl.addCreditSettleTransaction);

// router
//   .route("/salesOrder/:id")
//   .get(isAuthenticatedUser, getSingleSalesOrder);
router
  .route("/salesOrder/:invoiceNum")
  .get(isAuthenticatedUser, getSingleSalesOrder);

router
  .route("/sales/credit")
  .get(isAuthenticatedUser, getCreditSaleOrders);

router
  .route("/salesOrders/me")
  .get(isAuthenticatedUser, mySalesOrders);

router
  .route("/admin/salesOrders")
  .get(isAuthenticatedAdmin, authorizeRoles("admin"), getAllSalesOrders);

router
  .route("/salesOrder/:id")
  .delete(isAuthenticatedUser, deleteSalesOrder);
router
  .route("/admin/salesOrder/:id")
  .delete(isAuthenticatedAdmin, authorizeRoles("admin"), deleteSalesOrder);

router
  .route("/upd/salesOrder/:id")
  .put(isAuthenticatedUser, UpdateSalesOrder);
module.exports = router;

router
  .route("/salesOrder/return")
  .post(isAuthenticatedUser, salesReturn);

router
  .route("/inventory/:userId/expiring/:days")
  .get(expiringItemsController.getExpiringItemsForUser);

router.route("/salesNum")
  .get(isAuthenticatedUser, cntlr.getNumberofSales)
  .put(isAuthenticatedUser, cntlr.resetSalesCount)

router.route("/sale/:invoiceNum").delete(isAuthenticatedUser, cntlr.deleteUsingInvoiceNum);

module.exports = router;

