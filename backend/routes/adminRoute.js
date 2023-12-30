const express = require("express");
const {
  createAdmin,
  loginAdmin,
  logout,
  getAllUserDetails,
  getSingleUserDetail,
  updateUserRole,
  deleteUser,
  getReportofUserAdmin,
  getAllUserDetailsAdmin,
} = require("../controllers/adminController");
const { authorizeRoles, isAuthenticatedAdmin } = require("../middleware/auth");

const router = express.Router();

router.route("/admin/register").post(createAdmin);

router.route("/admin/login").post(loginAdmin);

router.route("/admin/logout").get(logout);

router
  .route("/admin/users/all")
  .post(isAuthenticatedAdmin,getAllUserDetailsAdmin);

router
  .route("/admin/user/:id")
  .get(isAuthenticatedAdmin, authorizeRoles("admin"), getSingleUserDetail)
  .put(isAuthenticatedAdmin, authorizeRoles("admin"), updateUserRole)

router.route("/admin/del/user").post(isAuthenticatedAdmin, deleteUser);

router
  .route("/admin/report")
  .post(isAuthenticatedAdmin, getReportofUserAdmin);

module.exports = router;
