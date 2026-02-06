const express = require('express');
const { body, validationResult } = require('express-validator');
const { Project, Task, User } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Create project
router.post('/', authMiddleware, roleMiddleware(['DIRECTOR', 'SERVICE_HEAD', 'ADMIN']), [
  body('title').notEmpty().trim(),
  body('description').optional().trim(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { title, description, startDate, endDate, budget, priority, department, assignedTo } = req.body;

    // If SERVICE_HEAD, enforce department
    if (req.user.role === 'SERVICE_HEAD' && department && req.user.department && department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'SERVICE_HEAD can only create projects for their department' });
    }

    const project = await Project.create({
      title,
      description,
      startDate,
      endDate,
      budget,
      priority,
      department: department || req.user.department,
      createdBy: req.user.id,
      assignedTo
    });

    logger.info(`Project created: ${project.id}`);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    logger.error('Create project error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get all projects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, priority, department, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (department) where.department = department;

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Task, attributes: ['id', 'status'] }
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
    logger.error('Get projects error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get project by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Task }
      ]
    });

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Update project
router.put('/:id', authMiddleware, [
  body('title').optional().notEmpty().trim(),
  body('description').optional().trim(),
  body('status').optional().isIn(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  body('progress').optional().isInt({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    // Check permissions using helper
    const { canManageProject } = require('../middleware/auth');
    if (!canManageProject(req.user, project)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await project.update(req.body);

    logger.info(`Project updated: ${project.id}`);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    logger.error('Update project error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Delete project
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    await project.destroy();

    logger.info(`Project deleted: ${project.id}`);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
