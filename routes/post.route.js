const express = require('express');

const router = express.Router();

router.get("/login", (req, res) => {
   console.log("Post route works!");
});


router.get("/register", (req, res) => {
   console.log("Post route works!");
});

module.exports = router; 