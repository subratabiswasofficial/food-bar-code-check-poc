const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth.controller");
const sessionMiddleware = require("../middlewares/session.middleware");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/logout", sessionMiddleware, auth.logout);

module.exports = router;
