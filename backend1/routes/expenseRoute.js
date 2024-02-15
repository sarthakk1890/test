const express = require("express");
const {
  addExpense,
  getAllExpense,
  getSingleExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const { isAuthenticatedUser, isSubscribed } = require("../middleware/auth");

const router = express.Router();

router.route("/add/expense").post(isAuthenticatedUser, addExpense);

router.route("/expense/all").get(isAuthenticatedUser, getAllExpense);

router.route("/expense/:id").get(isAuthenticatedUser,getSingleExpense);

router.route("/update/expense/:id").put(isAuthenticatedUser,updateExpense);

router.route("/del/expense/:id").delete(isAuthenticatedUser,deleteExpense);

module.exports = router;
