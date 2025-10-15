const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getConversationMessages,
  deleteConversation
} = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

router.post('/message', authenticateToken, sendMessage);
router.get('/conversations', authenticateToken, getConversations);
router.get('/conversations/:id', authenticateToken, getConversationMessages);
router.delete('/conversations/:id', authenticateToken, deleteConversation);

module.exports = router;