const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token not provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: insufficient permissions' 
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware
};

// Permission helpers
const canManageProject = (user, project) => {
  if (!user) return false;
  if (user.role === 'ADMIN' || user.role === 'DIRECTOR') return true;
  if (user.role === 'SERVICE_HEAD') {
    // SERVICE_HEAD can manage projects in their department or projects they created
    if (project.department && user.department && project.department === user.department) return true;
    if (project.createdBy === user.id) return true;
  }
  return false;
};

const canManageTask = (user, task) => {
  if (!user) return false;
  if (user.role === 'ADMIN' || user.role === 'DIRECTOR' || user.role === 'SERVICE_HEAD') return true;
  // Creator or assignee can modify the task
  if (task.createdBy === user.id) return true;
  if (task.assignedTo === user.id) return true;
  return false;
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  canManageProject,
  canManageTask
};

