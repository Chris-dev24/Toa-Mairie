const express = require('express');
const { Sequelize } = require('sequelize');
const { Project, Task, User, FormSubmission } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();
const Op = Sequelize.Op;

// Director Dashboard
router.get('/director', authMiddleware, async (req, res) => {
  try {
    // Get all projects statistics
    const projectStats = await Project.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Get total tasks
    const totalTasks = await Task.count();
    const completedTasks = await Task.count({ where: { status: 'COMPLETED' } });

    // Get active projects
    const activeProjects = await Project.count({ 
      where: { status: 'IN_PROGRESS' } 
    });

    // Get team members
    const teamMembers = await User.count({ 
      where: { isActive: true } 
    });

    // Get pending tasks (overdue)
    const pendingTasks = await Task.findAll({
      where: {
        status: { [Op.ne]: 'COMPLETED' },
        dueDate: { [Op.lt]: new Date() }
      },
      limit: 10
    });

    res.json({
      success: true,
      data: {
        projectStats,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0,
        activeProjects,
        teamMembers,
        pendingTasks
      }
    });
  } catch (error) {
    logger.error('Director dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Service Head Dashboard
router.get('/service-head', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get my projects
    const myProjects = await Project.findAll({
      where: {
        [Op.or]: [
          { createdBy: userId },
          { assignedTo: userId }
        ]
      },
      attributes: ['id', 'title', 'status', 'progress']
    });

    // Get my team tasks
    const myTeamTasks = await Task.findAll({
      where: { createdBy: userId }
    });

    // Task statistics
    const taskStats = await Task.findAll({
      where: { [Op.or]: [{ createdBy: userId }, { assignedTo: userId }] },
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        projectCount: myProjects.length,
        projects: myProjects,
        taskCount: myTeamTasks.length,
        taskStats
      }
    });
  } catch (error) {
    logger.error('Service head dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Field Agent Dashboard
router.get('/field-agent', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get my tasks
    const myTasks = await Task.findAll({
      where: { assignedTo: userId },
      include: [
        { model: Project, attributes: ['id', 'title'] }
      ]
    });

    // Get my submissions
    const mySubmissions = await FormSubmission.findAll({
      where: { submittedBy: userId },
      limit: 10,
      order: [['submittedAt', 'DESC']]
    });

    // Statistics
    const completedTasks = myTasks.filter(t => t.status === 'COMPLETED').length;
    const inProgressTasks = myTasks.filter(t => t.status === 'IN_PROGRESS').length;

    res.json({
      success: true,
      data: {
        tasks: myTasks,
        taskStats: {
          total: myTasks.length,
          completed: completedTasks,
          inProgress: inProgressTasks
        },
        recentSubmissions: mySubmissions
      }
    });
  } catch (error) {
    logger.error('Field agent dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Communication Dashboard
router.get('/communication', authMiddleware, async (req, res) => {
  try {
    // Get all form submissions
    const totalSubmissions = await FormSubmission.count();
    const thisMonthSubmissions = await FormSubmission.count({
      where: {
        submittedAt: {
          [Op.gte]: new Date(new Date().setDate(1))
        }
      }
    });

    // Get submissions by status
    const submissionsByStatus = await FormSubmission.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        totalSubmissions,
        thisMonthSubmissions,
        submissionsByStatus
      }
    });
  } catch (error) {
    logger.error('Communication dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Admin Dashboard
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    // Get comprehensive statistics for admin view
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: 'IN_PROGRESS' } });
    const completedProjects = await Project.count({ where: { status: 'COMPLETED' } });
    
    const totalTasks = await Task.count();
    const completedTasks = await Task.count({ where: { status: 'COMPLETED' } });
    const overdueTasks = await Task.count({
      where: {
        status: { [Op.ne]: 'COMPLETED' },
        dueDate: { [Op.lt]: new Date() }
      }
    });

    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = await User.count({ where: { isActive: false } });

    const totalSubmissions = await FormSubmission.count();
    const pendingSubmissions = await FormSubmission.count({ where: { status: 'PENDING' } });

    // Get statistics by project status
    const projectStats = await Project.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Get users by role
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['role']
    });

    res.json({
      success: true,
      data: {
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          stats: projectStats
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          overdue: overdueTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        },
        users: {
          active: activeUsers,
          inactive: inactiveUsers,
          byRole: usersByRole
        },
        forms: {
          total: totalSubmissions,
          pending: pendingSubmissions
        }
      }
    });
  } catch (error) {
    logger.error('Admin dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
