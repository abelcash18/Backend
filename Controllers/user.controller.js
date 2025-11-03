const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../Models/userModel');

exports.getUsers = async (req, res) => {
	try {
		const users = await User.find().select('-password');
		return res.status(200).json(users);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "failed to get users" });
	}
};

exports.getUser = async (req, res) => {
	try {
		const id = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid user id" });
		}
		const user = await User.findById(id).select('-password');
		if (!user) return res.status(404).json({ message: "User not found" });
		return res.status(200).json(user);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "failed to get user" });
	}
};

exports.updateUser = async (req, res) => {
	try {
		const id = req.params.id;
		const tokenUserId = req.userId;
		// Allow user to update their own account or allow admins to update any account
		if (!id || (id !== tokenUserId && !req.isAdmin)) {
			return res.status(403).json({ message: "Not Authorized!" });
		}
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid user id" });
		}

		const { password, avatar, ...inputs } = req.body;
		const updateData = { ...inputs };
		if (typeof avatar !== 'undefined') updateData.avatar = avatar;
		if (password) {
			updateData.password = await bcrypt.hash(password, 10);
		}

		const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
		if (!updatedUser) return res.status(404).json({ message: "User not found" });
		return res.status(200).json(updatedUser);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Failed to update user" });
	}
};

exports.deleteUser = async (req, res) => {
	try {
		const id = req.params.id;
		const tokenUserId = req.userId;
		// Allow user to delete their own account or allow admins to delete any account
		if (!id || (id !== tokenUserId && !req.isAdmin)) {
			return res.status(403).json({ message: "Not Authorized!" });
		}
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid user id" });
		}

		const deleted = await User.findByIdAndDelete(id);
		if (!deleted) return res.status(404).json({ message: "User not found" });
		return res.status(200).json({ message: "User deleted" });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Failed to delete users" });
	}
};
