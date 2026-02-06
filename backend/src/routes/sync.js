const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const { canSyncOfflineData } = require('../middleware/permissions');
const controller = require('../controllers/syncController');
const logger = require('../utils/logger');

const router = express.Router();

router.use(authMiddleware);

// Full sync: push local changes and pull server updates
router.post('/full', [
  body('deviceId').notEmpty().trim(),
  body('deviceType').isIn(['MOBILE', 'TABLET', 'WEB']),
  body('records').optional().isArray(),
  body('lastSyncAt').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Check if user can sync
    if (!canSyncOfflineData(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Role not authorized for offline sync'
      });
    }

    // First push, then pull
    const { deviceId, deviceType, records, lastSyncAt } = req.body;

    // Push changes
    const pushResult = await new Promise((resolve) => {
      req.body = { deviceId, deviceType, records, lastSyncAt };
      const res = {
        json: (data) => resolve(data),
        status: () => res
      };
      controller.pushSyncData(req, res);
    });

    if (!pushResult.success) {
      return res.status(500).json(pushResult);
    }

    // Pull updates
    const pullResult = await new Promise((resolve) => {
      req.body = { deviceId, deviceType, lastSyncAt };
      const res = {
        json: (data) => resolve(data),
        status: () => res
      };
      controller.pullSyncData(req, res);
    });

    res.json({
      success: true,
      message: 'Full synchronization completed',
      push: pushResult,
      pull: pullResult
    });
  } catch (error) {
    logger.error('Full sync error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Push local changes to server
router.post('/push', [
  body('deviceId').notEmpty().trim(),
  body('deviceType').isIn(['MOBILE', 'TABLET', 'WEB']),
  body('records').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    if (!canSyncOfflineData(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Role not authorized for offline sync'
      });
    }

    await controller.pushSyncData(req, res);
  } catch (error) {
    logger.error('Push sync error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Pull updates from server
router.post('/pull', [
  body('deviceId').notEmpty().trim(),
  body('deviceType').isIn(['MOBILE', 'TABLET', 'WEB']),
  body('lastSyncAt').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    if (!canSyncOfflineData(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Role not authorized for offline sync'
      });
    }

    await controller.pullSyncData(req, res);
  } catch (error) {
    logger.error('Pull sync error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get sync queue/logs
router.get('/logs', async (req, res) => {
  try {
    await controller.getOfflineQueue(req, res);
  } catch (error) {
    logger.error('Get sync logs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Resolve conflict
router.post('/resolve-conflict', [
  body('recordId').notEmpty().isUUID(),
  body('recordType').isIn(['TASK', 'FORM_SUBMISSION']),
  body('resolution').isIn(['SERVER', 'CLIENT'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    await controller.resolveSyncConflict(req, res);
  } catch (error) {
    logger.error('Resolve conflict error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
