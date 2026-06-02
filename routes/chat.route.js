const express = require('express');
const chatController = require('../Controllers/chatController');

const router = express.Router();

router.post("/client/start", chatController.startChat);
router.get("/client/:chatId", chatController.getClientChat);
router.post("/client/:chatId/message", chatController.sendClientMessage);

router.get("/owner/chats", chatController.getOwnerChats);
router.get("/owner/chat/:chatId", chatController.getOwnerChat);
router.post("/owner/chat/:chatId/message", chatController.sendOwnerMessage);
router.put("/owner/chat/:chatId/read", chatController.markAsRead);

module.exports = router;