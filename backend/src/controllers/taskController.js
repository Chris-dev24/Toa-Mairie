const { Task, Project, User } = require('../models');
const logger = require('../utils/logger');

const createTask = async (req, res) => {
  try {
    const data = req.body;
    data.createdBy = req.user.id;
    const project = await Project.findByPk(data.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const task = await Task.create(data);
    logger.info(`Task created: ${task.id} by ${req.user.id}`);
    res.status(201).json({ success: true, task });
  } catch (err) {
    logger.error('Create task error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    await task.update(req.body);
    res.json({ success: true, task });
  } catch (err) {
    logger.error('Update task error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'email', 'firstName', 'lastName'] },
        { model: User, as: 'assignee', attributes: ['id', 'email', 'firstName', 'lastName'] }
      ]
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    logger.error('Get task error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const listTasks = async (req, res) => {
  try {
    const where = {};
    if (req.query.projectId) where.projectId = req.query.projectId;
    if (req.query.assignedTo) where.assignedTo = req.query.assignedTo;

    const tasks = await Task.findAll({ where });
    res.json({ success: true, tasks });
  } catch (err) {
    logger.error('List tasks error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    await task.destroy();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    logger.error('Delete task error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createTask, updateTask, getTask, listTasks, deleteTask };
