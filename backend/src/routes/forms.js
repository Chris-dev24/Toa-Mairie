const express = require('express');
const { body, validationResult } = require('express-validator');
const { Form, FormSubmission, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Create form
router.post('/', authMiddleware, [
  body('title').notEmpty().trim(),
  body('formSchema').notEmpty().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { title, description, formSchema, allowOffline } = req.body;

    const form = await Form.create({
      title,
      description,
      formSchema,
      allowOffline: allowOffline !== false,
      createdBy: req.user.id
    });

    logger.info(`Form created: ${form.id}`);

    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      data: form
    });
  } catch (error) {
    logger.error('Create form error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get all forms
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Form.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
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
    logger.error('Get forms error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get form by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const form = await Form.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    if (!form) {
      return res.status(404).json({ 
        success: false, 
        message: 'Form not found' 
      });
    }

    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Submit form
router.post('/:id/submit', authMiddleware, [
  body('data').notEmpty().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const form = await Form.findByPk(req.params.id);
    if (!form) {
      return res.status(404).json({ 
        success: false, 
        message: 'Form not found' 
      });
    }

    const { data, geoLocation, attachments, isOfflineSubmission } = req.body;

    const submission = await FormSubmission.create({
      formId: req.params.id,
      submittedBy: req.user.id,
      data,
      geoLocation,
      attachments: attachments || [],
      isOfflineSubmission: isOfflineSubmission || false,
      syncedAt: isOfflineSubmission ? null : new Date()
    });

    logger.info(`Form submitted: ${submission.id}`);

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('form_submitted', { formId: req.params.id, submission });

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      data: submission
    });
  } catch (error) {
    logger.error('Submit form error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get form submissions
router.get('/:id/submissions', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { formId: req.params.id };
    if (status) where.status = status;

    const { count, rows } = await FormSubmission.findAndCountAll({
      where,
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['submittedAt', 'DESC']]
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
    logger.error('Get submissions error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Sync offline submissions
router.post('/sync/offline', authMiddleware, [
  body('submissions').isArray().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { submissions } = req.body;
    const syncedSubmissions = [];

    for (const sub of submissions) {
      const submission = await FormSubmission.findOrCreate({
        where: { id: sub.id },
        defaults: {
          ...sub,
          syncedAt: new Date()
        }
      });

      if (!submission[1]) {
        // Already exists, update it
        await submission[0].update({ syncedAt: new Date() });
      }

      syncedSubmissions.push(submission[0]);
    }

    logger.info(`Synced ${syncedSubmissions.length} offline submissions`);

    res.json({
      success: true,
      message: 'Offline submissions synced successfully',
      data: syncedSubmissions
    });
  } catch (error) {
    logger.error('Sync error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
