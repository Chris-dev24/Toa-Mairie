const logger = require('../utils/logger');

// Role hierarchy: ADMIN > DIRECTOR > SERVICE_HEAD > SECRETARY > COMMUNICATION > FIELD_AGENT
const ROLE_HIERARCHY = {
  ADMIN: 6,
  DIRECTOR: 5,
  SERVICE_HEAD: 4,
  SECRETARY: 3,
  COMMUNICATION: 2,
  FIELD_AGENT: 1
};

const canCreateProject = (user) => {
  return ['ADMIN', 'DIRECTOR', 'SERVICE_HEAD'].includes(user.role);
};

const canUpdateProject = (user, project) => {
  // ADMIN can update anything
  if (user.role === 'ADMIN') return true;
  // Creator can update their own project
  if (project.createdBy === user.id) return true;
  // DIRECTOR of same department can update
  if (user.role === 'DIRECTOR' && user.department === project.department) return true;
  return false;
};

const canDeleteProject = (user) => {
  return user.role === 'ADMIN';
};

const canCreateTask = (user) => {
  return ['ADMIN', 'SERVICE_HEAD', 'SECRETARY', 'FIELD_AGENT'].includes(user.role);
};

const canAssignTask = (user, toUser) => {
  // ADMIN can assign to anyone
  if (user.role === 'ADMIN') return true;
  // SERVICE_HEAD can assign within their service/department
  if (user.role === 'SERVICE_HEAD' && user.department === toUser.department) return true;
  return false;
};

const canModifyTask = (user, task) => {
  // ADMIN can modify anything
  if (user.role === 'ADMIN') return true;
  // Creator can modify
  if (task.createdBy === user.id) return true;
  // Assignee can modify their own task
  if (task.assignedTo === user.id) return true;
  return false;
};

const canViewDocument = (user, document) => {
  // ADMIN sees all
  if (user.role === 'ADMIN') return true;
  // Creator can view
  if (document.createdBy === user.id) return true;
  // DIRECTOR views all in department
  if (user.role === 'DIRECTOR' && user.department === document.department) return true;
  return false;
};

const canDeleteDocument = (user, document) => {
  if (user.role === 'ADMIN') return true;
  if (document.createdBy === user.id) return true;
  return false;
};

const canAccessFormSubmissions = (user) => {
  // FIELD_AGENT and above can access
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY['FIELD_AGENT'];
};

const canSyncOfflineData = (user) => {
  // Field agents and lower roles can sync
  return ['FIELD_AGENT', 'SECRETARY'].includes(user.role) || user.role === 'ADMIN';
};

module.exports = {
  ROLE_HIERARCHY,
  canCreateProject,
  canUpdateProject,
  canDeleteProject,
  canCreateTask,
  canAssignTask,
  canModifyTask,
  canViewDocument,
  canDeleteDocument,
  canAccessFormSubmissions,
  canSyncOfflineData
};
