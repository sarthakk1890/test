const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const { createQrOrder, getQrOrder, rejectQrOrder, acceptQrOrder } = require("../controllers/qrOrderController");

const router = express.Router();

router.post("/qrOrder/new", createQrOrder);
router.get("/qrOrder/all", isAuthenticatedUser, getQrOrder);
router.delete("/qrOrder/reject/:id", isAuthenticatedUser, rejectQrOrder);
router.post("/qrOrder/accept/:id", isAuthenticatedUser, acceptQrOrder);

module.exports = router;