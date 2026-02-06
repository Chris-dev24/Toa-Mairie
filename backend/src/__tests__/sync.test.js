const request = require('supertest');
const { app } = require('../index');
const { sequelize, User, SyncLog, Task, Project } = require('../models');
const jwt = require('jsonwebtoken');

let fieldAgentUser, fieldAgentToken;
let project;

describe('Offline Synchronization API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create user
    fieldAgentUser = await User.create({
      email: 'agent@test.com',
      firstName: 'Field',
      lastName: 'Agent',
      password: 'Password123!',
      role: 'FIELD_AGENT',
      department: 'Operations'
    });

    // Create project
    project = await Project.create({
      title: 'Test Project',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: 'HIGH',
      createdBy: fieldAgentUser.id,
      department: 'Operations'
    });

    fieldAgentToken = jwt.sign(
      { id: fieldAgentUser.id, email: fieldAgentUser.email, role: fieldAgentUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/sync/push', () => {
    it('should push local changes', async () => {
      const records = [
        {
          type: 'TASK',
          id: 'temp-id-1',
          data: {
            id: 'temp-id-1',
            title: 'Field Task 1',
            projectId: project.id,
            priority: 'MEDIUM',
            status: 'IN_PROGRESS'
          },
          timestamp: new Date().toISOString()
        }
      ];

      const res = await request(app)
        .post('/api/sync/push')
        .set('Authorization', `Bearer ${fieldAgentToken}`)
        .send({
          deviceId: 'device-123',
          deviceType: 'MOBILE',
          records
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.syncLogId).toBeDefined();
    });

    it('should reject unauthorized roles', async () => {
      // Create director user (not allowed to sync)
      const directorUser = await User.create({
        email: 'director@test.com',
        firstName: 'Director',
        lastName: 'User',
        password: 'Password123!',
        role: 'DIRECTOR'
      });

      const directorToken = jwt.sign(
        { id: directorUser.id, email: directorUser.email, role: directorUser.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '7d' }
      );

      const res = await request(app)
        .post('/api/sync/push')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          deviceId: 'device-456',
          deviceType: 'MOBILE',
          records: []
        });

      expect(res.status).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/sync/push')
        .send({
          deviceId: 'device-789',
          deviceType: 'MOBILE',
          records: []
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/sync/pull', () => {
    it('should pull server updates', async () => {
      const res = await request(app)
        .post('/api/sync/pull')
        .set('Authorization', `Bearer ${fieldAgentToken}`)
        .send({
          deviceId: 'device-123',
          deviceType: 'MOBILE',
          lastSyncAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.tasks)).toBe(true);
      expect(Array.isArray(res.body.data.formSubmissions)).toBe(true);
    });
  });

  describe('POST /api/sync/full', () => {
    it('should perform full synchronization', async () => {
      const res = await request(app)
        .post('/api/sync/full')
        .set('Authorization', `Bearer ${fieldAgentToken}`)
        .send({
          deviceId: 'device-full-123',
          deviceType: 'MOBILE',
          records: [],
          lastSyncAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.push).toBeDefined();
      expect(res.body.pull).toBeDefined();
    });
  });

  describe('GET /api/sync/logs', () => {
    it('should retrieve sync history', async () => {
      // Create a sync log first
      await SyncLog.create({
        userId: fieldAgentUser.id,
        deviceId: 'device-123',
        deviceType: 'MOBILE',
        syncType: 'PUSH',
        status: 'SUCCESS',
        recordsCount: 5
      });

      const res = await request(app)
        .get('/api/sync/logs')
        .set('Authorization', `Bearer ${fieldAgentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/sync/resolve-conflict', () => {
    it('should resolve conflicts', async () => {
      const res = await request(app)
        .post('/api/sync/resolve-conflict')
        .set('Authorization', `Bearer ${fieldAgentToken}`)
        .send({
          recordId: '00000000-0000-0000-0000-000000000001',
          recordType: 'TASK',
          resolution: 'SERVER'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid resolution', async () => {
      const res = await request(app)
        .post('/api/sync/resolve-conflict')
        .set('Authorization', `Bearer ${fieldAgentToken}`)
        .send({
          recordId: '00000000-0000-0000-0000-000000000001',
          recordType: 'TASK',
          resolution: 'INVALID'
        });

      expect(res.status).toBe(400);
    });
  });
});
