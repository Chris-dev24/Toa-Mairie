const { Task, Project, FormSubmission, User, SyncLog } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const pushSyncData = async (req, res) => {
  try {
    const { deviceId, deviceType, records, lastSyncAt } = req.body;
    const userId = req.user.id;

    const syncLog = await SyncLog.create({
      userId,
      deviceId,
      deviceType,
      syncType: 'PUSH',
      status: 'IN_PROGRESS',
      recordsCount: records ? records.length : 0
    });

    let conflictCount = 0;
    const syncedRecords = [];

    try {
      // Process each record
      if (records && Array.isArray(records)) {
        for (const record of records) {
          try {
            const { type, id, data, timestamp } = record;

            // Handle different record types
            if (type === 'TASK') {
              const existing = await Task.findByPk(id);

              if (existing) {
                // Check for conflicts
                if (new Date(existing.updatedAt) > new Date(timestamp)) {
                  conflictCount++;
                  syncedRecords.push({
                    id,
                    type,
                    status: 'CONFLICT',
                    serverVersion: existing,
                    clientVersion: data
                  });
                } else {
                  await existing.update(data);
                  syncedRecords.push({ id, type, status: 'SYNCED' });
                }
              } else {
                // Create new without projectId or with validation
                if (data.projectId) {
                  const project = await Project.findByPk(data.projectId);
                  if (project) {
                    await Task.create({ ...data, id, createdBy: userId });
                    syncedRecords.push({ id, type, status: 'SYNCED' });
                  }
                }
              }
            } else if (type === 'FORM_SUBMISSION') {
              const existing = await FormSubmission.findByPk(id);

              if (existing) {
                if (new Date(existing.updatedAt) > new Date(timestamp)) {
                  conflictCount++;
                  syncedRecords.push({
                    id,
                    type,
                    status: 'CONFLICT',
                    serverVersion: existing,
                    clientVersion: data
                  });
                } else {
                  await existing.update(data);
                  syncedRecords.push({ id, type, status: 'SYNCED' });
                }
              } else {
                await FormSubmission.create({ ...data, id, submittedBy: userId });
                syncedRecords.push({ id, type, status: 'SYNCED' });
              }
            }
          } catch (recordError) {
            logger.warn(`Sync error for record ${record.id}:`, recordError.message);
            syncedRecords.push({
              id: record.id,
              type: record.type,
              status: 'ERROR',
              error: recordError.message
            });
          }
        }
      }

      await syncLog.update({
        status: 'SUCCESS',
        conflictCount,
        completedAt: new Date()
      });

      logger.info(`Push sync succeeded: user=${userId}, device=${deviceId}, records=${records?.length || 0}`);

      res.json({
        success: true,
        message: 'Data synchronized successfully',
        syncLogId: syncLog.id,
        conflictCount,
        syncedRecords
      });
    } catch (err) {
      await syncLog.update({
        status: 'FAILED',
        errorMessage: err.message,
        completedAt: new Date()
      });

      throw err;
    }
  } catch (error) {
    logger.error('Push sync error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const pullSyncData = async (req, res) => {
  try {
    const { deviceId, deviceType, lastSyncAt } = req.body;
    const userId = req.user.id;

    const syncLog = await SyncLog.create({
      userId,
      deviceId,
      deviceType,
      syncType: 'PULL',
      status: 'IN_PROGRESS',
      lastSyncAt: lastSyncAt ? new Date(lastSyncAt) : null
    });

    try {
      const since = lastSyncAt ? new Date(lastSyncAt) : new Date(0);

      // Fetch updated/new tasks
      const tasks = await Task.findAll({
        where: {
          [Op.or]: [
            { createdBy: userId },
            { assignedTo: userId }
          ],
          updatedAt: { [Op.gte]: since }
        },
        include: [
          { model: Project, attributes: ['id', 'title', 'status'] },
          { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
        ]
      });

      // Fetch form submissions for this user
      const formSubmissions = await FormSubmission.findAll({
        where: {
          submittedBy: userId,
          updatedAt: { [Op.gte]: since }
        }
      });

      const totalRecords = tasks.length + formSubmissions.length;

      await syncLog.update({
        status: 'SUCCESS',
        recordsCount: totalRecords,
        completedAt: new Date()
      });

      logger.info(`Pull sync succeeded: user=${userId}, device=${deviceId}, records=${totalRecords}`);

      res.json({
        success: true,
        message: 'Data pulled successfully',
        syncLogId: syncLog.id,
        timestamp: new Date().toISOString(),
        data: {
          tasks: tasks.map(t => ({
            type: 'TASK',
            id: t.id,
            data: t,
            timestamp: t.updatedAt
          })),
          formSubmissions: formSubmissions.map(f => ({
            type: 'FORM_SUBMISSION',
            id: f.id,
            data: f,
            timestamp: f.updatedAt
          }))
        }
      });
    } catch (err) {
      await syncLog.update({
        status: 'FAILED',
        errorMessage: err.message,
        completedAt: new Date()
      });
      throw err;
    }
  } catch (error) {
    logger.error('Pull sync error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getOfflineQueue = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceId } = req.query;

    const logs = await SyncLog.findAll({
      where: {
        userId,
        deviceId: deviceId || { [Op.ne]: null }
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    logger.error('Get offline queue error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const resolveSyncConflict = async (req, res) => {
  try {
    const { recordId, recordType, resolution } = req.body; // resolution: 'SERVER' or 'CLIENT'
    const userId = req.user.id;

    if (!['SERVER', 'CLIENT'].includes(resolution)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resolution: must be SERVER or CLIENT'
      });
    }

    // Log the conflict resolution
    logger.info(`Conflict resolved: record=${recordId}, type=${recordType}, resolution=${resolution}, user=${userId}`);

    res.json({
      success: true,
      message: 'Conflict resolved',
      record: { id: recordId, type: recordType, resolution }
    });
  } catch (error) {
    logger.error('Resolve conflict error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  pushSyncData,
  pullSyncData,
  getOfflineQueue,
  resolveSyncConflict
};
