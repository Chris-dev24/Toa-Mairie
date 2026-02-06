const request = require('supertest');
const { app } = require('../index');
const { sequelize, User, Message } = require('../models');
const jwt = require('jsonwebtoken');

let user1, user2, user1Token, user2Token;

describe('Messaging API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    user1 = await User.create({
      email: 'user1@test.com',
      firstName: 'User',
      lastName: 'One',
      password: 'Password123!',
      role: 'SECRETARY'
    });

    user2 = await User.create({
      email: 'user2@test.com',
      firstName: 'User',
      lastName: 'Two',
      password: 'Password123!',
      role: 'SECRETARY'
    });

    user1Token = jwt.sign(
      { id: user1.id, email: user1.email, role: user1.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    user2Token = jwt.sign(
      { id: user2.id, email: user2.email, role: user2.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/messaging', () => {
    it('should send direct message', async () => {
      const res = await request(app)
        .post('/api/messaging')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          content: 'Hello User 2!',
          receiverId: user2.id
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Hello User 2!');
    });

    it('should require content', async () => {
      const res = await request(app)
        .post('/api/messaging')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          receiverId: user2.id
        });

      expect(res.status).toBe(400);
    });

    it('should require either receiverId or groupId', async () => {
      const res = await request(app)
        .post('/api/messaging')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          content: 'Test message'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/messaging', () => {
    beforeEach(async () => {
      await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Test message 1'
      });

      await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Test message 2'
      });
    });

    it('should get messages between users', async () => {
      const res = await request(app)
        .get(`/api/messaging?conversationWith=${user2.id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should respect pagination', async () => {
      const res = await request(app)
        .get('/api/messaging?page=1&limit=10')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('POST /api/messaging/mark-read', () => {
    let messageId;

    beforeEach(async () => {
      const msg = await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Unread message'
      });
      messageId = msg.id;
    });

    it('should mark message as read', async () => {
      const res = await request(app)
        .post('/api/messaging/mark-read')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          messageId
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isRead).toBe(true);
    });
  });

  describe('GET /api/messaging/conversations', () => {
    beforeEach(async () => {
      await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Conversation starter'
      });
    });

    it('should list user conversations', async () => {
      const res = await request(app)
        .get('/api/messaging/conversations')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /api/messaging/:messageId', () => {
    let messageId;

    beforeEach(async () => {
      const msg = await Message.create({
        senderId: user1.id,
        receiverId: user2.id,
        content: 'Deletable message'
      });
      messageId = msg.id;
    });

    it('should delete own message', async () => {
      const res = await request(app)
        .delete(`/api/messaging/${messageId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject delete by non-sender', async () => {
      const msg = await Message.create({
        senderId: user2.id,
        receiverId: user1.id,
        content: 'Others message'
      });

      const res = await request(app)
        .delete(`/api/messaging/${msg.id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(403);
    });
  });
});
