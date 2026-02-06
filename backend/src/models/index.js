const Sequelize = require('sequelize');
const config = require('../config/database');
const logger = require('../utils/logger');

const sequelize = new Sequelize(config);

// Import models
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const Document = require('./Document');
const Message = require('./Message');
const Form = require('./Form');
const FormSubmission = require('./FormSubmission');
const AuditLog = require('./AuditLog');
const SyncLog = require('./SyncLog');

// Define associations
User.hasMany(Project, { as: 'createdProjects', foreignKey: 'createdBy' });
User.hasMany(Project, { as: 'assignedProjects', foreignKey: 'assignedTo' });
User.hasMany(Task, { as: 'createdTasks', foreignKey: 'createdBy' });
User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assignedTo' });
User.hasMany(Document, { foreignKey: 'createdBy' });
User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId' });
User.hasMany(FormSubmission, { foreignKey: 'submittedBy' });

Project.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Project.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });
Project.hasMany(Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });

Task.belongsTo(Project, { foreignKey: 'projectId' });
Task.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });

Document.belongsTo(User, { foreignKey: 'createdBy' });

Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

Form.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Form.hasMany(FormSubmission, { foreignKey: 'formId', onDelete: 'CASCADE' });

FormSubmission.belongsTo(Form, { foreignKey: 'formId' });
FormSubmission.belongsTo(User, { as: 'submitter', foreignKey: 'submittedBy' });

AuditLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Project,
  Task,
  Document,
  Message,
  Form,
  FormSubmission,
  AuditLog,
  SyncLog
};
