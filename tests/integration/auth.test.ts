import request from 'supertest';
import { app } from '../../src/index';
import { pool } from '@infrastructure/database/connection';

describe('Authentication Integration Tests', () => {
  const API_PREFIX = '/api/v1';

  beforeAll(async () => {
    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Clean up test data
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test%@test.com']);
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test%@test.com']);
    await pool.end();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/auth/register`)
        .send({
          username: 'testuser',
          email: 'test@test.com',
          password: 'Test1234',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe('test@test.com');
    });

    it('should fail with duplicate email', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/auth/register`)
        .send({
          username: 'testuser2',
          email: 'test@test.com',
          password: 'Test1234',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/auth/register`)
        .send({
          username: 'testuser3',
          email: 'test3@test.com',
          password: 'weak',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email: 'test@test.com',
          password: 'Test1234',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email: 'test@test.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email: 'nonexistent@test.com',
          password: 'Test1234',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /users/profile', () => {
    let accessToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email: 'test@test.com',
          password: 'Test1234',
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/users/profile`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@test.com');
    });

    it('should fail without token', async () => {
      const response = await request(app).get(`${API_PREFIX}/users/profile`);

      expect(response.status).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get(`${API_PREFIX}/users/profile`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
