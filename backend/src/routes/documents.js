const express = require('express');
const { body, validationResult } = require('express-validator');
const { Document, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Create document
router.post('/', authMiddleware, [
  body('title').notEmpty().trim(),
  body('filePath').notEmpty(),
  body('fileType').notEmpty(),
  body('fileSize').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { title, description, filePath, fileType, fileSize, department, category, isPublic, sharedWith } = req.body;

    const document = await Document.create({
      title,
      description,
      filePath,
      fileType,
      fileSize,
      department: department || req.user.department,
      category,
      isPublic,
      sharedWith: sharedWith || [],
      createdBy: req.user.id
    });

    logger.info(`Document created: ${document.id}`);

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: document
    });
  } catch (error) {
    logger.error('Create document error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get all documents
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { department, category, isPublic, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (department) where.department = department;
    if (category) where.category = category;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';

    const { count, rows } = await Document.findAndCountAll({
      where,
      include: [
        { model: User, as: 'User', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
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
    logger.error('Get documents error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get document by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        { model: User, as: 'User', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Share document
router.patch('/:id/share', authMiddleware, [
  body('userIds').isArray().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    const { userIds } = req.body;
    document.sharedWith = [...new Set([...document.sharedWith, ...userIds])];
    await document.save();

    logger.info(`Document shared: ${document.id}`);

    res.json({
      success: true,
      message: 'Document shared successfully',
      data: document
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Delete document
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    if (document.createdBy !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    await document.destroy();

    logger.info(`Document deleted: ${document.id}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
