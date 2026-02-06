const { Message, User, Document } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const sendMessage = async (req, res) => {
  try {
    const { content, receiverId, groupId, attachments } = req.body;
    const senderId = req.user.id;

    if (!receiverId && !groupId) {
      return res.status(400).json({
        success: false,
        message: 'Either receiverId or groupId must be provided'
      });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      groupId,
      content,
      attachments: attachments || []
    });

    logger.info(`Message sent: ${message.id} from ${senderId}`);

    // Emit WebSocket event
    const io = req.app.get('io');
    if (receiverId) {
      io.to(`user_${receiverId}`).emit('message_received', message);
    } else if (groupId) {
      io.to(`group_${groupId}`).emit('message_received', message);
    }

    const populated = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populated
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationWith, groupId, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      [Op.or]: [
        { senderId: userId },
        { receiverId: userId }
      ]
    };

    if (conversationWith) {
      where[Op.or] = [
        { [Op.and]: [{ senderId: userId }, { receiverId: conversationWith }] },
        { [Op.and]: [{ senderId: conversationWith }, { receiverId: userId }] }
      ];
    }

    if (groupId) {
      where.groupId = groupId;
    }

    const { count, rows } = await Message.findAndCountAll({
      where,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.body;
    const userId = req.user.id;

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.receiverId !== userId && message.groupId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await message.update({
      isRead: true,
      readAt: new Date()
    });

    logger.info(`Message marked as read: ${messageId}`);

    res.json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only sender can delete message'
      });
    }

    await message.destroy();

    logger.info(`Message deleted: ${messageId}`);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group by conversation partners
    const conversations = new Map();

    messages.forEach(msg => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations.has(partnerId)) {
        const partner = msg.senderId === userId ? msg.receiver : msg.sender;
        conversations.set(partnerId, {
          partnerId,
          partner,
          lastMessage: msg,
          unreadCount: !msg.isRead && msg.receiverId === userId ? 1 : 0
        });
      } else {
        const conv = conversations.get(partnerId);
        if (!msg.isRead && msg.receiverId === userId) {
          conv.unreadCount++;
        }
      }
    });

    res.json({
      success: true,
      data: Array.from(conversations.values())
    });
  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
  getConversations
};
