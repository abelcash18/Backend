const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel.js');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendTestEmail } = require('../utils/emailService');

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const user = await User.findOne({ email });
        
        // For security, don't reveal if email exists or not
        const successMessage = "If an account with that email exists, we've sent password reset instructions.";

        if (!user) {
            console.log(`Password reset requested for non-existent email: ${email}`);
            return res.status(200).json({ 
                message: successMessage 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = Date.now() + 3600000; // 1 hour from now

        // Store token in database
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpiry;
        await user.save();

        // Send email
        let emailResult;
        if (process.env.NODE_ENV === 'production') {
            emailResult = await sendPasswordResetEmail(user.email, user.username, resetToken);
        } else {
            // Use test service in development
            emailResult = await sendTestEmail(user.email, user.username, resetToken);
        }

        console.log(`Password reset email processed for: ${user.email}`);
        
        return res.status(200).json({ 
            message: successMessage,
            // In development, return preview URL and token for testing
            ...(process.env.NODE_ENV !== 'production' && emailResult.usingTestService !== false && {
                previewUrl: emailResult.previewUrl,
                resetToken: resetToken,
                testMode: true
            })
        });

    } catch (err) {
        console.error("Forgot password error:", err);
        return res.status(500).json({ 
            message: err.message || "Failed to process password reset request. Please try again later." 
        });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    try {
        // Find user by valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        
        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        console.log(`Password reset successfully for user: ${user.email}`);

        return res.status(200).json({ message: "Password reset successfully" });

    } catch (err) {
        console.error("Reset password error:", err);
        return res.status(500).json({ message: "Failed to reset password" });
    }
};

exports.verifyResetToken = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        return res.status(200).json({ 
            message: "Token is valid",
            email: user.email
        });

    } catch (err) {
        console.error("Verify token error:", err);
        return res.status(500).json({ message: "Failed to verify token" });
    }
};