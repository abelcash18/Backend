const express = require('express');
const { verifyToken } = require('../Middleware/verifyToken');
const propertyController = require ('../Controllers/propertyController')

const router = express.Router();

router.get("/",propertyController.getPosts );
router.get("/:id",propertyController.getPost);
router.post("/", verifyToken,propertyController.addPost);
router.put("/:id", propertyController.updatePost);
router.delete("/:id", verifyToken, propertyController.deletePost);
router.get("/user/:userId", propertyController.getUserPosts);



module.exports = router;  