const { Project, User, Task } = require('../models');
const logger = require('../utils/logger');

const createProject = async (req, res) => {
  try {
    const data = req.body;
    data.createdBy = req.user.id;
    const project = await Project.create(data);
    logger.info(`Project created: ${project.id} by ${req.user.id}`);
    res.status(201).json({ success: true, project });
  } catch (err) {
    logger.error('Create project error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await project.update(req.body);
    res.json({ success: true, project });
  } catch (err) {
    logger.error('Update project error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'email', 'firstName', 'lastName'] },
        { model: User, as: 'assignee', attributes: ['id', 'email', 'firstName', 'lastName'] },
        { model: Task }
      ]
    });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) {
    logger.error('Get project error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const listProjects = async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json({ success: true, projects });
  } catch (err) {
    logger.error('List projects error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    await project.destroy();
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    logger.error('Delete project error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createProject, updateProject, getProject, listProjects, deleteProject };
