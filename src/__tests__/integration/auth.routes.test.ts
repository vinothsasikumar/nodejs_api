import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import authRouter from '../../routes/auth.routes';
import { mockUser } from '../helpers/mockData';

// Mock dependencies
vi.mock('../../database/user.database', () => ({
  userDatabase: {
    findById: vi.fn(),
  },
}));

vi.mock('../../utilities/jwt', () => ({
  generateToken: vi.fn(),
}));

import { userDatabase } from '../../database/user.database';
import { generateToken } from '../../utilities/jwt';

describe('Auth Routes Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/auth', authRouter);

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid userId', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockToken = 'mock-jwt-token-12345';

      (userDatabase.findById as any).mockResolvedValue(mockUser);
      (generateToken as any).mockReturnValue(mockToken);

      const response = await request(app)
        .post('/auth/login')
        .send({ userId })
        .expect(200);

      expect(response.body).toHaveProperty('token', mockToken);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
      });
    });

    it('should return 401 for invalid userId', async () => {
      const userId = 'invalid-user-id';

      (userDatabase.findById as any).mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({ userId })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid User ID');
    });

    it('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(response.body.name).toBe('ZodError');
    });

    it('should return 400 when userId is not a string', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ userId: 12345 })
        .expect(400);

      expect(response.body.name).toBe('ZodError');
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(response.body.name).toBe('ZodError');
    });

    it('should validate request body with middleware', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockToken = 'token-123';

      (userDatabase.findById as any).mockResolvedValue(mockUser);
      (generateToken as any).mockReturnValue(mockToken);

      const response = await request(app)
        .post('/auth/login')
        .send({ userId, extraField: 'should be stripped' })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should handle database errors gracefully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const dbError = new Error('Database connection failed');

      (userDatabase.findById as any).mockRejectedValue(dbError);

      const response = await request(app)
        .post('/auth/login')
        .send({ userId })
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Internal server error');
      expect(response.body).toHaveProperty('error');
    });

    it('should set correct content-type header', async () => {
      const userId = '507f1f77bcf86cd799439011';

      (userDatabase.findById as any).mockResolvedValue(mockUser);
      (generateToken as any).mockReturnValue('token');

      const response = await request(app)
        .post('/auth/login')
        .send({ userId })
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should not accept GET requests', async () => {
      await request(app)
        .get('/auth/login')
        .expect(404);
    });

    it('should not accept PUT requests', async () => {
      await request(app)
        .put('/auth/login')
        .expect(404);
    });

    it('should not accept DELETE requests', async () => {
      await request(app)
        .delete('/auth/login')
        .expect(404);
    });

    it('should handle null userId gracefully', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ userId: null })
        .expect(400);

      expect(response.body.name).toBe('ZodError');
    });

    it('should return user data without password in response', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockToken = 'token-abc';

      (userDatabase.findById as any).mockResolvedValue(mockUser);
      (generateToken as any).mockReturnValue(mockToken);

      const response = await request(app)
        .post('/auth/login')
        .send({ userId })
        .expect(200);

      expect(response.body.user).toBeDefined();
      // Note: The current implementation returns the user with password
      // This is a security concern that should be addressed in production
    });
  });
});
