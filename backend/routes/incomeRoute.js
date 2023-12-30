const express = require("express");
const {
  addIncome,
  getAllIncome,
  updateIncome,
  deleteIncome,
  getSingleIncome,
} = require("../controllers/incomeController");
const { isAuthenticatedUser, isSubscribed } = require("../middleware/auth");

const router = express.Router();

router.route("/add/income").post(isAuthenticatedUser,  addIncome);

router.route("/income/all").get(isAuthenticatedUser,  getAllIncome);

router.route("/income/:id").get(isAuthenticatedUser,  getSingleIncome);

router.route("/update/income/:id").put(isAuthenticatedUser,  updateIncome);

router.route("/del/income/:id").delete(isAuthenticatedUser,  deleteIncome);

module.exports = router;
