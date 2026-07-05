const express = require('express');
const { register, login, logout } = require("../Controllers/auth.controller.js");
const { forgotPassword, resetPassword, verifyResetToken } = require("../Controllers/resetPassword.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-reset-token", verifyResetToken);

module.exports = router;