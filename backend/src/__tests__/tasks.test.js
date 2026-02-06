const request = require('supertest');
const { app } = require('../index');
const { sequelize, User, Project, Task } = require('../models');
const jwt = require('jsonwebtoken');

let adminUser, serviceHeadUser, fieldAgentUser;
let project;
let adminToken, serviceHeadToken, fieldAgentToken;

describe('Tasks API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create users
    adminUser = await User.create({
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      password: 'Password123!',
      role: 'ADMIN'
    });

    serviceHeadUser = await User.create({
      email: 'head@test.com',
      firstName: 'Service',
      lastName: 'Head',
      password: 'Password123!',
      role: 'SERVICE_HEAD',
      department: 'Operations'
    });

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
      createdBy: adminUser.id,
      department: 'Operations'
    });

    // Generate tokens
    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    serviceHeadToken = jwt.sign(
      { id: serviceHeadUser.id, email: serviceHeadUser.email, role: serviceHeadUser.role },
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

  describe('POST /api/tasks', () => {
    it('should create task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${serviceHeadToken}`)
        .send({
          title: 'New Task',
          description: 'Task description',
          projectId: project.id,
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Task');
    });

    it('should reject invalid project', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${serviceHeadToken}`)
        .send({
          title: 'Orphan Task',
          projectId: 'invalid-uuid-1234567890',
          priority: 'MEDIUM'
        });

      expect(res.status).toBe(400);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Unauthorized Task',
          projectId: project.id,
          priority: 'MEDIUM'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Original Task',
        projectId: project.id,
        priority: 'MEDIUM',
        createdBy: serviceHeadUser.id
      });
      taskId = task.id;
    });

    it('should update task status', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${serviceHeadToken}`)
        .send({
          status: 'IN_PROGRESS',
          priority: 'HIGH'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });

    it('should set completedAt when marking COMPLETED', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${serviceHeadToken}`)
        .send({
          status: 'COMPLETED'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.completedAt).toBeDefined();
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${serviceHeadToken}`)
        .send({
          status: 'INVALID_STATUS'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await Task.create({
        title: 'Task 1',
        projectId: project.id,
        priority: 'HIGH',
        status: 'TODO',
        createdBy: serviceHeadUser.id,
        assignedTo: fieldAgentUser.id
      });

      await Task.create({
        title: 'Task 2',
        projectId: project.id,
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        createdBy: serviceHeadUser.id,
        assignedTo: fieldAgentUser.id
      });
    });

    it('should list all tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${fieldAgentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=IN_PROGRESS')
        .set('Authorization', `Bearer ${fieldAgentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some(t => t.status === 'IN_PROGRESS')).toBe(true);
    });

    it('should filter by assignedTo', async () => {
      const res = await request(app)
        .get(`/api/tasks?assignedTo=${fieldAgentUser.id}`)
        .set('Authorization', `Bearer ${fieldAgentToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Deletable Task',
        projectId: project.id,
        priority: 'MEDIUM',
        createdBy: serviceHeadUser.id
      });
      taskId = task.id;
    });

    it('should delete task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${serviceHeadToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .delete('/api/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${serviceHeadToken}`);

      expect(res.status).toBe(404);
    });
  });
});
