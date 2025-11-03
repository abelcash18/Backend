const express = require('express');
const  {verifyToken} = require("../Middleware/verifyToken.js");
const userController = require('../Controllers/user.controller');



const router = express.Router();

router.get("/", userController.getUsers);
router.get("/:id", verifyToken,userController.getUser);
router.put("/:id", verifyToken, userController.updateUser);
router.delete("/:id", verifyToken, userController.deleteUser);


module.exports = router;