const express = require('express');
const { verifyToken } = require('../Middleware/verifyToken');
const propertyController = require ('../Controllers/propertyController')

const router = express.Router();

router.get("/",propertyController.getPosts );
router.get("/:id",propertyController.getPost);
router.post("/", verifyToken,propertyController.addPost);
router.put("/:id", verifyToken, propertyController.updatePost);
router.delete("/:id", verifyToken, propertyController.deletePost);




module.exports = router;  