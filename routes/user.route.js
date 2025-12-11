const express = require('express');
const  {verifyToken} = require("../Middleware/verifyToken.js");
const userController = require('../Controllers/user.controller');



const router = express.Router();

router.get("/", userController.getUsers);
router.get("/:id",userController.getUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);


module.exports = router;