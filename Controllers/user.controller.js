const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../Models/userModel');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.status(200).json(users);
    } catch (err) {
        console.error('Get Users Error:', err);
        return res.status(500).json({ message: "Failed to get users" });
    }
};

exports.getUser = async (req, res) => {
    try {
        const id = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (err) {
        console.error('Get User Error:', err);
        return res.status(500).json({ message: "Failed to get user" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const tokenUserId = req.userId;

        console.log('Update User Request:', { id, tokenUserId, body: req.body });

        // Validate user ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user id format" });
        }

        // Authorization check
        if (id !== tokenUserId && !req.isAdmin) {
            return res.status(403).json({ message: "Not Authorized! You can only update your own profile." });
        }

        const { password, avatar, username, email, ...otherInputs } = req.body;
        
        // Build update object
        const updateData = { ...otherInputs };
        
        // Only include fields that are provided
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        if (avatar !== undefined) updateData.avatar = avatar;
        
        // Handle password update
        if (password && password.trim() !== '') {
            if (password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long" });
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        console.log('Update Data:', updateData);

        // Use findByIdAndUpdate with proper options
        const updatedUser = await User.findByIdAndUpdate(
            id, 
            { $set: updateData }, 
            { 
                new: true, // Return updated document
                runValidators: true, // Run model validators
                context: 'query'
            }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log('User updated successfully:', updatedUser._id);
        return res.status(200).json(updatedUser);

    } catch (err) {
        console.error('Update User Error:', err);
        
        // Handle duplicate key errors
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(400).json({ 
                message: `${field} already exists` 
            });
        }
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(error => error.message);
            return res.status(400).json({ 
                message: messages.join(', ') 
            });
        }

        return res.status(500).json({ message: "Failed to update user" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const tokenUserId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        if (id !== tokenUserId && !req.isAdmin) {
            return res.status(403).json({ message: "Not Authorized!" });
        }

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error('Delete User Error:', err);
        return res.status(500).json({ message: "Failed to delete user" });
    }
};