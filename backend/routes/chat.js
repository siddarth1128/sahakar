const express = require('express');
const router = express.Router();
const { getOrCreateChat, sendMessage, markRead, getChats, getChatById } = require('../controllers/chat');

const auth = require('../middleware/auth');

// All routes require auth
router.use(auth());

// POST /api/chat/create - Get or create chat
router.post('/create', getOrCreateChat);

// POST /api/chat/send - Send message
router.post('/send', sendMessage);

// POST /api/chat/read - Mark as read
router.post('/read', markRead);

// GET /api/chat/list - Get user's chats
router.get('/list', getChats);

// GET /api/chat/:chatId - Get single chat messages
router.get('/:chatId', getChatById);

module.exports = router;