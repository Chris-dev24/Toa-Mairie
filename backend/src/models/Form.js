const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Form = sequelize.define('Form', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  formSchema: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Dynamic form structure with fields, validation, etc.'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'ARCHIVED'),
    defaultValue: 'DRAFT'
  },
  allowOffline: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Allow form submission while offline'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'forms'
});

module.exports = Form;
