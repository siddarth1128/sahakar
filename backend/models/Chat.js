// Chat.js - Model for real-time messaging in FixItNow
// Fields: participants (userId, techId), messages (array with sender, content, timestamp), lastMessage
// Indexes: Compound on participants for quick room lookup, createdAt for history
// Usage: Socket.io joins room by chatId, adds messages, queries for history; separate from Dispute chat
// Compatible with Activity.logActivity('message_sent') for analytics
const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    refPath: 'messages.senderModel', // Dynamic ref: 'User' or 'Technician'
    required: true
  },
  senderModel: {
    type: String,
    enum: ['User', 'Technician'],
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    refPath: 'messages.readByModel',
    default: []
  }],
  readByModel: {
    type: String,
    enum: ['User', 'Technician'],
    default: 'User'
  }
}, { _id: false }); // Embedded, no _id for messages

const chatSchema = new Schema({
  participants: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    techId: {
      type: Schema.Types.ObjectId,
      ref: 'Technician',
      required: true
    }
  },
  messages: [messageSchema],
  lastMessage: {
    content: String,
    timestamp: Date,
    senderId: Schema.Types.ObjectId
  },
  unreadCount: {
    forUser: { type: Number, default: 0 },
    forTech: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
chatSchema.index({ 'participants.userId': 1, 'participants.techId': 1 }, { unique: true }); // Unique chat per user-tech pair
chatSchema.index({ 'lastMessage.timestamp': -1 }); // Recent chats first
chatSchema.index({ 'unreadCount.forUser': 1 });
chatSchema.index({ 'unreadCount.forTech': 1 });

// Static to get or create chat room (call from Socket.io connection)
chatSchema.statics.getOrCreateChat = async function(userId, techId) {
  let chat = await this.findOne({
    'participants.userId': userId,
    'participants.techId': techId
  });
  if (!chat) {
    chat = new this({
      participants: { userId, techId }
    });
    await chat.save();
  }
  return chat;
};

// Method to add message and update lastMessage/unread (call from Socket.io handler)
chatSchema.methods.addMessage = async function(senderId, senderModel, content) {
  const message = {
    senderId,
    senderModel,
    content,
    timestamp: new Date()
  };
  this.messages.push(message);
  this.lastMessage = {
    content,
    timestamp: message.timestamp,
    senderId
  };
  // Increment unread for the other participant
  if (senderModel === 'User') {
    this.unreadCount.forTech += 1;
  } else {
    this.unreadCount.forUser += 1;
  }
  await this.save();
  // Emit via Socket.io in controller
  return message;
};

// Method to mark as read (decrement unread)
chatSchema.methods.markAsRead = function(participantModel) {
  if (participantModel === 'User') {
    this.unreadCount.forUser = 0;
  } else {
    this.unreadCount.forTech = 0;
  }
  // Update readBy for last messages if needed
  this.save();
  return this;
};

module.exports = mongoose.model('Chat', chatSchema);