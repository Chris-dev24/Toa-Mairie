const express = require('express');
const { body, validationResult } = require('express-validator');
const { Message, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Send message
router.post('/', authMiddleware, [
  body('content').notEmpty().trim(),
  body('receiverId').optional().isUUID(),
  body('groupId').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { content, receiverId, groupId, attachments } = req.body;

    const message = await Message.create({
      content,
      senderId: req.user.id,
      receiverId,
      groupId,
      attachments: attachments || []
    });

    logger.info(`Message sent: ${message.id}`);

    // Emit WebSocket event
    const io = req.app.get('io');
    const room = receiverId || groupId;
    io.to(`chat_${room}`).emit('new_message', message);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get conversation
router.get('/conversation/:userId', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Message.findAndCountAll({
      where: {
        [require('sequelize').Op.or]: [
          {
            senderId: req.user.id,
            receiverId: req.params.userId
          },
          {
            senderId: req.params.userId,
            receiverId: req.user.id
          }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
        { model: User, as: 'receiver', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: rows.reverse(),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Get conversation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Mark message as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    await message.update({
      isRead: true,
      readAt: new Date()
    });

    logger.info(`Message marked as read: ${message.id}`);

    res.json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get unread messages count
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const count = await Message.count({
      where: {
        receiverId: req.user.id,
        isRead: false
      }
    });

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
