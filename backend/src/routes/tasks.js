const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const controller = require('../controllers/taskController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware(['ADMIN', 'SERVICE_HEAD', 'SECRETARY', 'FIELD_AGENT']), controller.createTask);
router.get('/', controller.listTasks);
router.get('/:id', controller.getTask);
router.put('/:id', roleMiddleware(['ADMIN', 'SERVICE_HEAD']), controller.updateTask);
router.delete('/:id', roleMiddleware(['ADMIN']), controller.deleteTask);

module.exports = router;
const express = require('express');
const { body, validationResult } = require('express-validator');
const { Task, Project, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Create task
router.post('/', authMiddleware, [
  body('title').notEmpty().trim(),
  body('projectId').notEmpty().isUUID(),
  body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  body('dueDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { title, description, projectId, assignedTo, priority, dueDate, startDate, estimatedHours, tags } = req.body;

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    // Enforce that only users from same department or admins can assign to a SERVICE_HEAD or restrict assignedTo
    if (assignedTo) {
      const assignee = await User.findByPk(assignedTo);
      if (!assignee) return res.status(404).json({ success: false, message: 'Assignee not found' });
      if (req.user.role === 'SERVICE_HEAD' && assignee.department && req.user.department && assignee.department !== req.user.department) {
        return res.status(403).json({ success: false, message: 'Cannot assign tasks to users outside your department' });
      }
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      priority,
      dueDate,
      startDate,
      estimatedHours,
      tags: tags || [],
      createdBy: req.user.id
    });

    logger.info(`Task created: ${task.id}`);

    // Emit WebSocket event
    const io = req.app.get('io');
    io.to(`project_${projectId}`).emit('task_created', task);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    logger.error('Create task error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get all tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, projectId, assignedTo, priority, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;
    if (assignedTo) where.assignedTo = assignedTo;
    if (priority) where.priority = priority;

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] },
        { model: Project, attributes: ['id', 'title'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['dueDate', 'ASC'], ['createdAt', 'DESC']]
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
    logger.error('Get tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get task by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Project, attributes: ['id', 'title', 'status'] }
      ]
    });

    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Update task
router.put('/:id', authMiddleware, [
  body('title').optional().notEmpty().trim(),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  body('actualHours').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    // Mark as completed if status is COMPLETED
    if (req.body.status === 'COMPLETED' && task.status !== 'COMPLETED') {
      req.body.completedAt = new Date();
    }

    await task.update(req.body);

    logger.info(`Task updated: ${task.id}`);

    // Emit WebSocket event
    const io = req.app.get('io');
    io.to(`project_${task.projectId}`).emit('task_updated', task);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    logger.error('Update task error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    const projectId = task.projectId;
    await task.destroy();

    logger.info(`Task deleted: ${task.id}`);

    // Emit WebSocket event
    const io = req.app.get('io');
    io.to(`project_${projectId}`).emit('task_deleted', { id: task.id });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
