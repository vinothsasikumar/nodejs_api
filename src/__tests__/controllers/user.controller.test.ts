import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../../controllers/user.controller';
import { mockRequest, mockResponse } from '../helpers/mockRequest';
import { mockUser, mockUserArray, mockUserRequest } from '../helpers/mockData';

// Mock the mongo service
vi.mock('../../services/user.mongo.service', () => ({
  getAllUsersFromMongo: vi.fn(),
  getUserByIdFromMongo: vi.fn(),
  createUserInMongo: vi.fn(),
  updateUserInMongo: vi.fn(),
  deleteUserFromMongo: vi.fn(),
}));

import * as mongoService from '../../services/user.mongo.service';

describe('User Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users with 200 status', async () => {
      (mongoService.getAllUsersFromMongo as any).mockResolvedValue(mockUserArray);

      const req = mockRequest();
      const res = mockResponse();

      await getAllUsers(req as any, res as any);

      expect(mongoService.getAllUsersFromMongo).toHaveBeenCalledOnce();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUserArray);
    });

    it('should return empty array when no users exist', async () => {
      (mongoService.getAllUsersFromMongo as any).mockResolvedValue([]);

      const req = mockRequest();
      const res = mockResponse();

      await getAllUsers(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should throw error when service fails', async () => {
      const dbError = new Error('Database error');
      (mongoService.getAllUsersFromMongo as any).mockRejectedValue(dbError);

      const req = mockRequest();
      const res = mockResponse();

      await expect(getAllUsers(req as any, res as any)).rejects.toThrow('Database error');
    });
  });

  describe('getUserById', () => {
    it('should return user by id with 200 status', async () => {
      const userId = '507f1f77bcf86cd799439011';
      (mongoService.getUserByIdFromMongo as any).mockResolvedValue(mockUser);

      const req = mockRequest({ params: { userid: userId } });
      const res = mockResponse();

      await getUserById(req as any, res as any);

      expect(mongoService.getUserByIdFromMongo).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      const userId = 'nonexistent-id';
      (mongoService.getUserByIdFromMongo as any).mockResolvedValue(null);

      const req = mockRequest({ params: { userid: userId } });
      const res = mockResponse();

      await getUserById(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith('User data not found');
    });

    it('should handle missing userid parameter', async () => {
      (mongoService.getUserByIdFromMongo as any).mockResolvedValue(null);

      const req = mockRequest({ params: {} });
      const res = mockResponse();

      await getUserById(req as any, res as any);

      expect(mongoService.getUserByIdFromMongo).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createUser', () => {
    it('should create user and return 201 status', async () => {
      (mongoService.createUserInMongo as any).mockResolvedValue(mockUser);

      const req = mockRequest({ body: mockUserRequest });
      const res = mockResponse();

      await createUser(req as any, res as any);

      expect(mongoService.createUserInMongo).toHaveBeenCalledWith(mockUserRequest);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith('User created successfully');
    });

    it('should create user with all fields', async () => {
      const fullUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        phone: '9876543210',
        website: 'https://newuser.com',
      };
      (mongoService.createUserInMongo as any).mockResolvedValue({ _id: 'new-id', ...fullUserData });

      const req = mockRequest({ body: fullUserData });
      const res = mockResponse();

      await createUser(req as any, res as any);

      expect(mongoService.createUserInMongo).toHaveBeenCalledWith(fullUserData);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should throw error when creation fails', async () => {
      const dbError = new Error('Duplicate email');
      (mongoService.createUserInMongo as any).mockRejectedValue(dbError);

      const req = mockRequest({ body: mockUserRequest });
      const res = mockResponse();

      await expect(createUser(req as any, res as any)).rejects.toThrow('Duplicate email');
    });
  });

  describe('updateUser', () => {
    it('should update user and return 200 status', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updatedData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '1111111111',
        website: 'https://updated.com',
      };
      (mongoService.updateUserInMongo as any).mockResolvedValue({ _id: userId, ...updatedData });

      const req = mockRequest({ params: { userid: userId }, body: updatedData });
      const res = mockResponse();

      await updateUser(req as any, res as any);

      expect(mongoService.updateUserInMongo).toHaveBeenCalledWith(userId, updatedData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith('User updated successfully');
    });

    it('should return 404 when user not found', async () => {
      const userId = 'nonexistent-id';
      (mongoService.updateUserInMongo as any).mockResolvedValue(null);

      const req = mockRequest({ params: { userid: userId }, body: mockUserRequest });
      const res = mockResponse();

      await updateUser(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith('User data not found');
    });

    it('should handle partial updates', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const partialUpdate = {
        name: 'Partial Update',
        email: 'partial@example.com',
        phone: '1234567890',
        website: 'https://example.com',
      };
      (mongoService.updateUserInMongo as any).mockResolvedValue({ _id: userId, ...partialUpdate });

      const req = mockRequest({ params: { userid: userId }, body: partialUpdate });
      const res = mockResponse();

      await updateUser(req as any, res as any);

      expect(mongoService.updateUserInMongo).toHaveBeenCalledWith(userId, partialUpdate);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw error when update fails', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const dbError = new Error('Update failed');
      (mongoService.updateUserInMongo as any).mockRejectedValue(dbError);

      const req = mockRequest({ params: { userid: userId }, body: mockUserRequest });
      const res = mockResponse();

      await expect(updateUser(req as any, res as any)).rejects.toThrow('Update failed');
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return 200 status', async () => {
      const userId = '507f1f77bcf86cd799439011';
      (mongoService.deleteUserFromMongo as any).mockResolvedValue(mockUser);

      const req = mockRequest({ params: { userid: userId } });
      const res = mockResponse();

      await deleteUser(req as any, res as any);

      expect(mongoService.deleteUserFromMongo).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith('User deleted successfully');
    });

    it('should return 404 when user not found', async () => {
      const userId = 'nonexistent-id';
      (mongoService.deleteUserFromMongo as any).mockResolvedValue(null);

      const req = mockRequest({ params: { userid: userId } });
      const res = mockResponse();

      await deleteUser(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith('User data not found');
    });

    it('should throw error when delete fails', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const dbError = new Error('Delete operation failed');
      (mongoService.deleteUserFromMongo as any).mockRejectedValue(dbError);

      const req = mockRequest({ params: { userid: userId } });
      const res = mockResponse();

      await expect(deleteUser(req as any, res as any)).rejects.toThrow('Delete operation failed');
    });

    it('should handle missing userid parameter', async () => {
      (mongoService.deleteUserFromMongo as any).mockResolvedValue(null);

      const req = mockRequest({ params: {} });
      const res = mockResponse();

      await deleteUser(req as any, res as any);

      expect(mongoService.deleteUserFromMongo).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
