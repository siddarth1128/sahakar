// controllers/chat.js - Chat controllers for FixItNow
// Features: getOrCreateChat (get room or create), sendMessage (add message, emit real-time), markRead (update unread)
// Security: Auth, validate participants
// Connections: Models/Chat, Activity; Socket.io for real-time
const Chat = require('../models/Chat');
const Activity = require('../models/Activity');
const { body, validationResult } = require('express-validator');

// getOrCreateChat - Get or create chat room between user and tech
const getOrCreateChat = [
  body('techId').isMongoId(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const { techId } = req.body;

      const chat = await Chat.getOrCreateChat(userId, techId);
      await chat.populate('participants.userId', 'name');
      await chat.populate('participants.techId', 'name');

      res.json({ success: true, chat });
    } catch (err) {
      console.error('Get Chat Error:', err);
      res.status(500).json({ msg: 'Failed to get chat', error: err.message });
    }
  }
];

// sendMessage - Send message in chat
const sendMessage = [
  body('chatId').isMongoId(),
  body('content').isLength({ min: 1, max: 1000 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { chatId, content } = req.body;
      const senderId = req.user.id;
      const senderModel = req.user.role === 'tech' ? 'Technician' : 'User';

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ msg: 'Chat not found' });
      }

      // Check if sender is participant
      const isParticipant = chat.participants.userId.toString() === senderId || chat.participants.techId.toString() === senderId;
      if (!isParticipant) {
        return res.status(403).json({ msg: 'Not a participant' });
      }

      const message = await chat.addMessage(senderId, senderModel, content);

      // Emit real-time
      req.io.to(chatId.toString()).emit('newMessage', { chatId, message });

      // Log
      await Activity.logActivity('message_sent', senderId, { chatId, content: content.substring(0, 50) + '...' });

      res.json({ success: true, message });
    } catch (err) {
      console.error('Send Message Error:', err);
      res.status(500).json({ msg: 'Failed to send message', error: err.message });
    }
  }
];

// markRead - Mark messages as read in chat
const markRead = [
  body('chatId').isMongoId(),
  async (req, res) => {
    try {
      const { chatId } = req.body;
      const participantModel = req.user.role === 'tech' ? 'Technician' : 'User';

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ msg: 'Chat not found' });
      }

      await chat.markAsRead(participantModel);

      // Emit to other participant
      req.io.to(chatId.toString()).emit('messagesRead', { chatId, by: participantModel });

      res.json({ success: true });
    } catch (err) {
      console.error('Mark Read Error:', err);
      res.status(500).json({ msg: 'Failed to mark read', error: err.message });
    }
  }
];

// getChats - Get user's chats
const getChats = [
  async (req, res) => {
    try {
      const userId = req.user.id;
      const role = req.user.role;

      const filter = role === 'user' 
        ? { 'participants.userId': userId } 
        : { 'participants.techId': userId };

      const chats = await Chat.find(filter)
        .populate('participants.userId', 'name')
        .populate('participants.techId', 'name')
        .sort({ 'lastMessage.timestamp': -1 })
        .limit(50);

      res.json({ success: true, chats });
    } catch (err) {
      console.error('Get Chats Error:', err);
      res.status(500).json({ msg: 'Failed to get chats', error: err.message });
    }
  }
];

// getChatById - Fetch a single chat and its messages
const getChatById = [
  async (req, res) => {
    try {
      const { chatId } = req.params;
      const chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ msg: 'Chat not found' });

      // Ensure requester participates
      const userId = req.user.id;
      const isParticipant = chat.participants.userId.toString() === userId || chat.participants.techId.toString() === userId;
      if (!isParticipant) return res.status(403).json({ msg: 'Not a participant' });

      res.json(chat.messages || []);
    } catch (err) {
      console.error('Get Chat By Id Error:', err);
      res.status(500).json({ msg: 'Failed to fetch chat', error: err.message });
    }
  }
];

module.exports = { getOrCreateChat, sendMessage, markRead, getChats, getChatById };