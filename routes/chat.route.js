const express = require('express');
const { verifyToken } = require('../Middleware/verifyToken.js');
const chatController = require('../Controllers/chatController');

const router = express.Router();

router.post("/client/start", chatController.startChat);
router.get("/client/:chatId", chatController.getClientChat);
router.post("/client/:chatId/message", chatController.sendClientMessage);

router.get("/owner/chats", verifyToken, chatController.getOwnerChats);
router.get("/owner/chat/:chatId", verifyToken, chatController.getOwnerChat);
router.post("/owner/chat/:chatId/message", verifyToken, chatController.sendOwnerMessage);
router.put("/owner/chat/:chatId/read", verifyToken, chatController.markAsRead);

module.exports = router;