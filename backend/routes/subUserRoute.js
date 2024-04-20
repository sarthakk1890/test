const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const { registerSubUser, loginSubUser, editSubUser, deleteSubUser, getAllSubUsers, getSubUserDetails } = require("../controllers/subUserController");

const router = express.Router();

router.post("/sub-user/new", isAuthenticatedUser, registerSubUser);
// router.post("/sub-user/login", loginSubUser);
router.route("/sub-user/:subUserId")
    .put(isAuthenticatedUser, editSubUser)
    .delete(isAuthenticatedUser, deleteSubUser);
router.get("/sub-user/all", isAuthenticatedUser, getAllSubUsers);

router.get("/subuser/:id", isAuthenticatedUser, getSubUserDetails);

module.exports = router;