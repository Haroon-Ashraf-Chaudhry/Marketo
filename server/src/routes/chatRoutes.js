const router = require('express').Router();
const { getOrCreateConversation, getConversations, getMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);

module.exports = router;
