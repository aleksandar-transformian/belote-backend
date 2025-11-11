import request from 'supertest';
import { app } from '../../src/index';
import { pool } from '@infrastructure/database/connection';

describe('Authentication Integration Tests', () => {
  const API_PREFIX = '/api/v1';
  let dbAvailable = false;

  beforeAll(async () => {
    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if database is available
    try {
      await pool.query('SELECT 1');
      dbAvailable = true;
      // Clean up test data
      await pool.query('DELETE FROM users WHERE email LIKE $1', ['test%@test.com']);
    } catch (error) {
      console.warn('Database not available, skipping integration tests. Run docker-compose up to enable them.');
      dbAvailable = false;
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (dbAvailable) {
      try {
        await pool.query('DELETE FROM users WHERE email LIKE $1', ['test%@test.com']);
        await pool.end();
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      if (!dbAvailable) {
        console.log('Skipping test: database not available');
        return;
      }

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
      if (!dbAvailable) {
        console.log('Skipping test: database not available');
        return;
      }

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
      if (!dbAvailable) {
        console.log('Skipping test: database not available');
        return;
      }

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
      if (!dbAvailable) {
        console.log('Skipping test: database not available');
        return;
      }

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
      if (!dbAvailable) {
        console.log('Skipping test: database not available');
        return;
      }

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
      if (!dbAvailable) {
        console.log('Skipping test: database not available');
        return;
      }

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
      if (!dbAvailable) {
        return;
      }

      const loginResponse = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email: 'test@test.com',
          password: 'Test1234',
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should get user profile with valid token', async () => {
      if (!dbAvailable) {
        console.log('Skipping test: database not available');
        return;
      }

      const response = await request(app)
        .get(`${API_PREFIX}/users/profile`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@test.com');
    });

    it('should fail without token', async () => {
      if (!dbAvailable) {
        console.log('Skipping test: database not available');
        return;
      }

      const response = await request(app).get(`${API_PREFIX}/users/profile`);

      expect(response.status).toBe(401);
    });

    it('should fail with invalid token', async () => {
      if (!dbAvailable) {
        console.log('Skipping test: database not available');
        return;
      }

      const response = await request(app)
        .get(`${API_PREFIX}/users/profile`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
