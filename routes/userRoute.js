const express = require('express');
const  {verifyToken} = require("../Middleware/verifyToken.js");
const {getUser, getUsers, updateUser, deleteUser} = require("../Controllers/auth.Controller.js");


const router = express.Router();

router.get("/", getUsers);
router.get("/:id" , verifyToken, getUser);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);


module.exports = router; 