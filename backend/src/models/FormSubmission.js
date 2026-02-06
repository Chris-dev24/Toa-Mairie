const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const FormSubmission = sequelize.define('FormSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  formId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'forms',
      key: 'id'
    }
  },
  submittedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Submitted form data'
  },
  geoLocation: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  syncedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When offline submission was synced to server'
  },
  isOfflineSubmission: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('SUBMITTED', 'VALIDATED', 'REJECTED', 'PROCESSING'),
    defaultValue: 'SUBMITTED'
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
  tableName: 'form_submissions'
});

module.exports = FormSubmission;
