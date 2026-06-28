const { Conversation, Message } = require('../models/Message');

exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const { otherUserId, productId } = req.body;
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, otherUserId] },
      product: productId || null,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, otherUserId],
        product: productId || null,
      });
    }

    await conversation.populate('participants', 'name avatar');
    if (productId) await conversation.populate('product', 'name images');

    res.json(conversation);
  } catch (err) { next(err); }
};

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar')
      .populate('product', 'name images')
      .populate('lastMessage')
      .sort({ lastActivity: -1 });
    res.json(conversations);
  } catch (err) { next(err); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.participants.includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { conversation: req.params.conversationId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json(messages);
  } catch (err) { next(err); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.participants.map(p => p.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
      readBy: [req.user._id],
    });

    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    await message.populate('sender', 'name avatar');
    res.status(201).json(message);
  } catch (err) { next(err); }
};
