import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import userRouter from '../../routes/user.routes';
import { mockUser, mockUserArray, mockUserRequest } from '../helpers/mockData';

// Mock dependencies
vi.mock('../../services/user.mongo.service', () => ({
  getAllUsersFromMongo: vi.fn(),
  getUserByIdFromMongo: vi.fn(),
  createUserInMongo: vi.fn(),
  updateUserInMongo: vi.fn(),
  deleteUserFromMongo: vi.fn(),
}));

vi.mock('../../utilities/jwt', () => ({
  verifyToken: vi.fn(),
}));

import * as mongoService from '../../services/user.mongo.service';
import { verifyToken } from '../../utilities/jwt';

describe('User Routes Integration Tests', () => {
  let app: express.Application;
  const validToken = 'Bearer valid-token-12345';
  const mockPayload = { userId: '507f1f77bcf86cd799439011' };

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/users', userRouter);

    // Clear all mocks
    vi.clearAllMocks();

    // Default mock for verifyToken
    (verifyToken as any).mockReturnValue(mockPayload);
  });

  describe('GET /users', () => {
    it('should return all users with valid token', async () => {
      (mongoService.getAllUsersFromMongo as any).mockResolvedValue(mockUserArray);

      const response = await request(app)
        .get('/users')
        .set('Authorization', validToken)
        .expect(200);

      expect(response.body).toEqual(mockUserArray);
      expect(mongoService.getAllUsersFromMongo).toHaveBeenCalledOnce();
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .get('/users')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'User is not authenticated');
      expect(mongoService.getAllUsersFromMongo).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      (verifyToken as any).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });

    it('should return empty array when no users exist', async () => {
      (mongoService.getAllUsersFromMongo as any).mockResolvedValue([]);

      const response = await request(app)
        .get('/users')
        .set('Authorization', validToken)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /users/:userid', () => {
    it('should return user by id with valid token', async () => {
      const userId = '507f1f77bcf86cd799439011';
      (mongoService.getUserByIdFromMongo as any).mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', validToken)
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(mongoService.getUserByIdFromMongo).toHaveBeenCalledWith(userId);
    });

    it('should return 404 when user not found', async () => {
      const userId = 'nonexistent-id';
      (mongoService.getUserByIdFromMongo as any).mockResolvedValue(null);

      const response = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', validToken)
        .expect(404);

      expect(response.body).toBe('User data not found');
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .get('/users/507f1f77bcf86cd799439011')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'User is not authenticated');
    });
  });

  describe('POST /users/create', () => {
    it('should create user with valid data and token', async () => {
      (mongoService.createUserInMongo as any).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/users/create')
        .set('Authorization', validToken)
        .send(mockUserRequest)
        .expect(201);

      expect(response.body).toBe('User created successfully');
      expect(mongoService.createUserInMongo).toHaveBeenCalledWith(mockUserRequest);
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .post('/users/create')
        .send(mockUserRequest)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'User is not authenticated');
      expect(mongoService.createUserInMongo).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid user data', async () => {
      const invalidData = {
        name: 'Jo', // Too short
        email: 'invalid-email',
        phone: '123',
        website: 'test',
      };

      const response = await request(app)
        .post('/users/create')
        .set('Authorization', validToken)
        .send(invalidData)
        .expect(400);

      expect(response.body.name).toBe('ZodError');
      expect(mongoService.createUserInMongo).not.toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteData = {
        name: 'John Doe',
        // Missing email, phone, website
      };

      const response = await request(app)
        .post('/users/create')
        .set('Authorization', validToken)
        .send(incompleteData)
        .expect(400);

      expect(response.body.name).toBe('ZodError');
    });

    it('should validate email format', async () => {
      const invalidEmail = {
        ...mockUserRequest,
        email: 'not-an-email',
      };

      const response = await request(app)
        .post('/users/create')
        .set('Authorization', validToken)
        .send(invalidEmail)
        .expect(400);

      expect(response.body.name).toBe('ZodError');
    });

    it('should validate name length', async () => {
      const shortName = {
        ...mockUserRequest,
        name: 'Jo', // Less than 5 characters
      };

      const response = await request(app)
        .post('/users/create')
        .set('Authorization', validToken)
        .send(shortName)
        .expect(400);

      expect(response.body.name).toBe('ZodError');
    });
  });

  describe('PUT /users/update/:userid', () => {
    it('should update user with valid data and token', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updatedData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '9999999999',
        website: 'https://updated.com',
      };
      (mongoService.updateUserInMongo as any).mockResolvedValue({ _id: userId, ...updatedData });

      const response = await request(app)
        .put(`/users/update/${userId}`)
        .set('Authorization', validToken)
        .send(updatedData)
        .expect(200);

      expect(response.body).toBe('User updated successfully');
      expect(mongoService.updateUserInMongo).toHaveBeenCalledWith(userId, updatedData);
    });

    it('should return 404 when updating non-existent user', async () => {
      const userId = 'nonexistent-id';
      (mongoService.updateUserInMongo as any).mockResolvedValue(null);

      const response = await request(app)
        .put(`/users/update/${userId}`)
        .set('Authorization', validToken)
        .send(mockUserRequest)
        .expect(404);

      expect(response.body).toBe('User data not found');
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .put('/users/update/507f1f77bcf86cd799439011')
        .send(mockUserRequest)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'User is not authenticated');
    });

    it('should return 400 for invalid update data', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const invalidData = {
        name: 'Ab', // Too short
        email: 'invalid',
        phone: '123',
        website: 'test',
      };

      const response = await request(app)
        .put(`/users/update/${userId}`)
        .set('Authorization', validToken)
        .send(invalidData)
        .expect(400);

      expect(response.body.name).toBe('ZodError');
      expect(mongoService.updateUserInMongo).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /users/delete/:userid', () => {
    it('should delete user with valid token', async () => {
      const userId = '507f1f77bcf86cd799439011';
      (mongoService.deleteUserFromMongo as any).mockResolvedValue(mockUser);

      const response = await request(app)
        .delete(`/users/delete/${userId}`)
        .set('Authorization', validToken)
        .expect(200);

      expect(response.body).toBe('User deleted successfully');
      expect(mongoService.deleteUserFromMongo).toHaveBeenCalledWith(userId);
    });

    it('should return 404 when deleting non-existent user', async () => {
      const userId = 'nonexistent-id';
      (mongoService.deleteUserFromMongo as any).mockResolvedValue(null);

      const response = await request(app)
        .delete(`/users/delete/${userId}`)
        .set('Authorization', validToken)
        .expect(404);

      expect(response.body).toBe('User data not found');
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .delete('/users/delete/507f1f77bcf86cd799439011')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'User is not authenticated');
      expect(mongoService.deleteUserFromMongo).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      (verifyToken as any).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .delete('/users/delete/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });

  describe('Authentication Flow', () => {
    it('should accept token with userId field', async () => {
      (verifyToken as any).mockReturnValue({ userId: '507f1f77bcf86cd799439011' });
      (mongoService.getAllUsersFromMongo as any).mockResolvedValue(mockUserArray);

      const response = await request(app)
        .get('/users')
        .set('Authorization', validToken)
        .expect(200);

      expect(response.body).toEqual(mockUserArray);
    });

    it('should accept token with id field', async () => {
      (verifyToken as any).mockReturnValue({ id: '507f1f77bcf86cd799439011' });
      (mongoService.getAllUsersFromMongo as any).mockResolvedValue(mockUserArray);

      const response = await request(app)
        .get('/users')
        .set('Authorization', validToken)
        .expect(200);

      expect(response.body).toEqual(mockUserArray);
    });

    it('should reject token without userId or id', async () => {
      (verifyToken as any).mockReturnValue({ someField: 'value' });

      const response = await request(app)
        .get('/users')
        .set('Authorization', validToken)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid token payload');
    });
  });
});
