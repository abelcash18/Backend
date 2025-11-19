const mongoose = require('mongoose');

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
    type: String, // Can be session ID or temporary ID for non-logged in users
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
    type: String, // Session ID for non-logged in users
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

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;