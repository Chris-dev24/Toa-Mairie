const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { User } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all users (ADMIN/DIRECTOR only)
router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'DIRECTOR']), async (req, res) => {
  try {
    const { role, department, isActive, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (department) where.department = department;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
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
    logger.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Users can only view their own profile, except admins
    if (req.user.id !== user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Update user (ADMIN or self)
router.put('/:id', authMiddleware, [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('phone').optional().trim(),
  body('department').optional().trim(),
  body('role').optional().isIn(['DIRECTOR', 'SERVICE_HEAD', 'SECRETARY', 'FIELD_AGENT', 'COMMUNICATION', 'ADMIN'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check permissions
    if (req.user.id !== user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Don't allow role change except by admin
    if (req.body.role && req.user.role !== 'ADMIN') {
      delete req.body.role;
    }

    await user.update(req.body);

    logger.info(`User updated: ${user.id}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user.toJSON()
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Deactivate user (ADMIN only)
router.patch('/:id/deactivate', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await user.update({ isActive: false });

    logger.info(`User deactivated: ${user.id}`);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get user by role
router.get('/role/:role', authMiddleware, roleMiddleware(['ADMIN', 'DIRECTOR', 'SERVICE_HEAD']), async (req, res) => {
  try {
    const users = await User.findAll({
      where: { 
        role: req.params.role,
        isActive: true
      },
      attributes: { exclude: ['password'] },
      order: [['firstName', 'ASC']]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
