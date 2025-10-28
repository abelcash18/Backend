const express = require('express');
const router = express.Router();
const userController = require('../Controllers/user.controller');

// list users
router.get('/', userController.getUsers);

// get single user
router.get('/:id', userController.getUser);

// update user
router.put('/:id', userController.updateUser);

// delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
