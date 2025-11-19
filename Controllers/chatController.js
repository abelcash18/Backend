const mongoose = require('mongoose');

// Use existing models from mongoose
const Property = mongoose.models.Property || require('../models/propertyModel');
const User = mongoose.models.User || require('../Models/userModel');

// Define Chat model inline
const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  senderType: {
    type: String,
    enum: ['client', 'owner'],
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    default: 'Guest'
  },
  clientEmail: {
    type: String,
    default: ''
  },
  messages: [messageSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ propertyId: 1, clientId: 1 });
chatSchema.index({ ownerId: 1, lastActivity: -1 });
chatSchema.index({ clientId: 1 });

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);

// Start a new chat (for clients)
exports.startChat = async (req, res) => {
  try {
    const { propertyId, clientId, clientName, initialMessage } = req.body;

    if (!propertyId || !clientId || !initialMessage) {
      return res.status(400).json({ 
        message: "Property ID, client ID, and initial message are required" 
      });
    }

    // Verify property exists and get owner using the separate Property model
    const property = await Property.findById(propertyId).populate('userId');
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if chat already exists for this client and property
    let chat = await Chat.findOne({ 
      propertyId, 
      clientId 
    });

    if (!chat) {
      // Create new chat
      chat = new Chat({
        propertyId,
        ownerId: property.userId._id,
        clientId,
        clientName: clientName || 'Guest',
        messages: [{
          text: initialMessage,
          senderType: 'client',
          clientId
        }]
      });
    } else {
      // Add message to existing chat
      chat.messages.push({
        text: initialMessage,
        senderType: 'client',
        clientId
      });
      chat.lastActivity = new Date();
      chat.isActive = true;
    }

    await chat.save();
    await chat.populate('propertyId', 'title images');

    // Notify owner about new chat
    if (req.io) {
      req.io.to(chat.ownerId.toString()).emit('newChat', {
        chatId: chat._id,
        property: chat.propertyId,
        clientName: chat.clientName
      });
    }

    res.status(200).json({
      chatId: chat._id,
      message: "Chat started successfully"
    });

  } catch (err) {
    console.error('Start Chat Error:', err);
    res.status(500).json({ message: "Failed to start chat" });
  }
};

// Get chat for client
exports.getClientChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate('propertyId', 'title images price type propertyType')
      .populate('ownerId', 'username avatar');

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error('Get Client Chat Error:', err);
    res.status(500).json({ message: "Failed to get chat" });
  }
};

// Send message from client
exports.sendClientMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text, clientId } = req.body;

    if (!text || !clientId) {
      return res.status(400).json({ message: "Message text and client ID are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Verify client owns this chat
    if (chat.clientId !== clientId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    chat.messages.push({
      text,
      senderType: 'client',
      clientId
    });
    chat.lastActivity = new Date();

    await chat.save();

    // Emit real-time message to owner
    if (req.io) {
      req.io.to(chat.ownerId.toString()).emit('newMessage', {
        chatId: chat._id,
        message: chat.messages[chat.messages.length - 1]
      });
    }

    res.status(200).json({ 
      message: "Message sent successfully",
      chatId: chat._id
    });

  } catch (err) {
    console.error('Send Client Message Error:', err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get all chats for property owner
exports.getOwnerChats = async (req, res) => {
  try {
    const ownerId = req.userId;

    const chats = await Chat.find({ ownerId, isActive: true })
      .populate('propertyId', 'title images price')
      .sort({ lastActivity: -1 });

    // Count unread messages for each chat
    const chatsWithUnread = chats.map(chat => {
      const unreadCount = chat.messages.filter(
        msg => msg.senderType === 'client' && !msg.isRead
      ).length;
      
      return {
        ...chat.toObject(),
        unreadCount
      };
    });

    res.status(200).json(chatsWithUnread);
  } catch (err) {
    console.error('Get Owner Chats Error:', err);
    res.status(500).json({ message: "Failed to get chats" });
  }
};

// Get specific chat for owner
exports.getOwnerChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const ownerId = req.userId;

    const chat = await Chat.findOne({ _id: chatId, ownerId })
      .populate('propertyId', 'title images price type propertyType address')
      .populate('ownerId', 'username avatar');

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error('Get Owner Chat Error:', err);
    res.status(500).json({ message: "Failed to get chat" });
  }
};

// Send message from owner
exports.sendOwnerMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const ownerId = req.userId;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const chat = await Chat.findOne({ _id: chatId, ownerId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.messages.push({
      text,
      senderType: 'owner',
      clientId: chat.clientId
    });
    chat.lastActivity = new Date();

    await chat.save();

    // Emit real-time message to client
    if (req.io) {
      req.io.to(chat.clientId).emit('newMessage', {
        chatId: chat._id,
        message: chat.messages[chat.messages.length - 1]
      });
    }

    res.status(200).json({ 
      message: "Message sent successfully",
      chatId: chat._id
    });

  } catch (err) {
    console.error('Send Owner Message Error:', err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const ownerId = req.userId;

    const chat = await Chat.findOne({ _id: chatId, ownerId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Mark all client messages as read
    chat.messages.forEach(msg => {
      if (msg.senderType === 'client') {
        msg.isRead = true;
      }
    });

    await chat.save();

    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    console.error('Mark as Read Error:', err);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};