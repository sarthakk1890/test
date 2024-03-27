const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const { registerSubUser, loginSubUser, editSubUser, deleteSubUser } = require("../controllers/subUserController");

const router = express.Router();

router.post("/sub-user/new", isAuthenticatedUser, registerSubUser);
router.post("/sub-user/login", loginSubUser);
router.route("/sub-user/:subUserId")
    .put(isAuthenticatedUser, editSubUser)
    .delete(isAuthenticatedUser, deleteSubUser);

module.exports = router;