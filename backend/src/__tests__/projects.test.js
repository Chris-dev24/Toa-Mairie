const request = require('supertest');
const { app } = require('../index');
const { sequelize, User, Project, Task } = require('../models');
const jwt = require('jsonwebtoken');

let adminUser, directorUser, serviceHeadUser, fieldAgentUser;
let adminToken, directorToken, serviceHeadToken, fieldAgentToken;

describe('Projects API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create test users with different roles
    adminUser = await User.create({
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      password: 'Password123!',
      role: 'ADMIN'
    });

    directorUser = await User.create({
      email: 'director@test.com',
      firstName: 'Director',
      lastName: 'User',
      password: 'Password123!',
      role: 'DIRECTOR',
      department: 'Infrastructure'
    });

    serviceHeadUser = await User.create({
      email: 'head@test.com',
      firstName: 'Service',
      lastName: 'Head',
      password: 'Password123!',
      role: 'SERVICE_HEAD',
      department: 'Infrastructure'
    });

    fieldAgentUser = await User.create({
      email: 'agent@test.com',
      firstName: 'Field',
      lastName: 'Agent',
      password: 'Password123!',
      role: 'FIELD_AGENT',
      department: 'Infrastructure'
    });

    // Generate tokens
    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    directorToken = jwt.sign(
      { id: directorUser.id, email: directorUser.email, role: directorUser.role, department: directorUser.department },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    serviceHeadToken = jwt.sign(
      { id: serviceHeadUser.id, email: serviceHeadUser.email, role: serviceHeadUser.role, department: serviceHeadUser.department },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    fieldAgentToken = jwt.sign(
      { id: fieldAgentUser.id, email: fieldAgentUser.email, role: fieldAgentUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/projects', () => {
    it('should allow DIRECTOR to create project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          title: 'Test Project',
          description: 'Test Description',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'HIGH'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Project');
    });

    it('should reject FIELD_AGENT creating project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${fieldAgentToken}`)
        .send({
          title: 'Unauthorized Project',
          description: 'Test',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'MEDIUM'
        });

      expect(res.status).toBe(403);
    });

    it('should reject invalid dates', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${directorToken}`)
        .send({
          title: 'Bad Project',
          description: 'Test',
          startDate: 'invalid-date',
          endDate: 'also-invalid',
          priority: 'MEDIUM'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      await Project.create({
        title: 'Active Project',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        createdBy: directorUser.id,
        department: 'Infrastructure'
      });
    });

    it('should list projects', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${directorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/projects');

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    let projectId;

    beforeEach(async () => {
      const project = await Project.create({
        title: 'Deletable Project',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priority: 'MEDIUM',
        createdBy: directorUser.id,
        department: 'Infrastructure'
      });
      projectId = project.id;
    });

    it('should allow ADMIN to delete', async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject non-ADMIN', async () => {
      const project = await Project.create({
        title: 'Protected Project',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priority: 'MEDIUM',
        createdBy: directorUser.id,
        department: 'Infrastructure'
      });

      const res = await request(app)
        .delete(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${directorToken}`);

      expect(res.status).toBe(403);
    });
  });
});
