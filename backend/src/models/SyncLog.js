const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SyncLog = sequelize.define('SyncLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deviceType: {
    type: DataTypes.ENUM('MOBILE', 'TABLET', 'WEB'),
    defaultValue: 'MOBILE'
  },
  syncType: {
    type: DataTypes.ENUM('PUSH', 'PULL', 'FULL'),
    defaultValue: 'PUSH'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED'),
    defaultValue: 'PENDING'
  },
  recordsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  conflictCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastSyncAt: {
    type: DataTypes.DATE,
    allowNull: true
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
    tableName: 'sync_logs'
  });

  return SyncLog;
};
