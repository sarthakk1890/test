// router basic template
const express = require("express");
const { loginAgent, logoutAgent, registerAgent, getUsers } = require("../controllers/agentController");
const router = express.Router();
const { isAuthenticatedAgent } = require("../middleware/auth");

router.route("/register").post(registerAgent);

router.route("/login").post(loginAgent);

router.route("/logout").get(logoutAgent);

router.route("/getuser").post( isAuthenticatedAgent ,getUsers)

module.exports = router;
