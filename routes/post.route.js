const express = require('express');
const { verifyToken } = require('../Middleware/verifyToken');
const propertyController = require ('../Controllers/propertyController')

const router = express.Router();

router.get("/", propertyController.getPosts);
router.get("/:id", propertyController.getPost);

// PASTED FIX: Added verifyToken here so req.userId becomes available
router.post("/", propertyController.addPost);

// OPTIONAL FIX: You will likely need verifyToken here too so users can only update/delete their own posts
router.put("/:id", verifyToken, propertyController.updatePost);
router.delete("/:id", verifyToken, propertyController.deletePost);

router.get("/user/:userId", propertyController.getUserPosts);

module.exports = router;