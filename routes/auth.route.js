const express = require('express');
const { register, login, logout } = require("../controllers/auth.controller.js");
const { forgotPassword, resetPassword, verifyResetToken } = require("../controllers/resetPassword.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-reset-token", verifyResetToken);

module.exports = router;