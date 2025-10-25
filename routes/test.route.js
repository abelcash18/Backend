const express = require ('express');
 const {shouldBeAdmin, shouldBeLoggedIn} = require(' shouldBeAdmin, shouldBeLoggedIn');
const verifyToken = require ('../Middleware/verifyToken.js');


const router = express.Router();


router.get("/should-be-logged-in", verifyToken, shouldBeLoggedIn);
router.get("/should-be-admin", shouldBeAdmin);


export default router;