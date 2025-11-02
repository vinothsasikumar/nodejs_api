import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllUsersFromMongo,
  getUserByIdFromMongo,
  createUserInMongo,
  updateUserInMongo,
  deleteUserFromMongo,
} from '../../services/user.mongo.service';
import { mockUser, mockUserArray, mockUserRequest } from '../helpers/mockData';

// Mock the database
vi.mock('../../database/user.database', () => ({
  userDatabase: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

import { userDatabase } from '../../database/user.database';

describe('User Mongo Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUsersFromMongo', () => {
    it('should return all users from database', async () => {
      (userDatabase.find as any).mockResolvedValue(mockUserArray);

      const result = await getAllUsersFromMongo();

      expect(userDatabase.find).toHaveBeenCalledOnce();
      expect(result).toEqual(mockUserArray);
    });

    it('should return empty array when no users exist', async () => {
      (userDatabase.find as any).mockResolvedValue([]);

      const result = await getAllUsersFromMongo();

      expect(result).toEqual([]);
    });

    it('should throw error when database operation fails', async () => {
      const dbError = new Error('Database connection failed');
      (userDatabase.find as any).mockRejectedValue(dbError);

      await expect(getAllUsersFromMongo()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getUserByIdFromMongo', () => {
    it('should return user by id', async () => {
      const userId = '507f1f77bcf86cd799439011';
      (userDatabase.findById as any).mockResolvedValue(mockUser);

      const result = await getUserByIdFromMongo(userId);

      expect(userDatabase.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const userId = 'nonexistent-id';
      (userDatabase.findById as any).mockResolvedValue(null);

      const result = await getUserByIdFromMongo(userId);

      expect(result).toBeNull();
    });

    it('should throw error for invalid user id', async () => {
      const invalidId = 'invalid-id';
      const dbError = new Error('Cast to ObjectId failed');
      (userDatabase.findById as any).mockRejectedValue(dbError);

      await expect(getUserByIdFromMongo(invalidId)).rejects.toThrow('Cast to ObjectId failed');
    });
  });

  describe('createUserInMongo', () => {
    it('should create and return new user', async () => {
      const newUser = { ...mockUser };
      (userDatabase.create as any).mockResolvedValue(newUser);

      const result = await createUserInMongo(mockUserRequest);

      expect(userDatabase.create).toHaveBeenCalledWith(mockUserRequest);
      expect(result).toEqual(newUser);
    });

    it('should throw error when creating user with duplicate email', async () => {
      const duplicateError = new Error('E11000 duplicate key error');
      (userDatabase.create as any).mockRejectedValue(duplicateError);

      await expect(createUserInMongo(mockUserRequest)).rejects.toThrow('E11000 duplicate key error');
    });

    it('should create user with all fields', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        website: 'https://test.com',
      };
      (userDatabase.create as any).mockResolvedValue({ _id: 'new-id', ...userData });

      const result = await createUserInMongo(userData);

      expect(userDatabase.create).toHaveBeenCalledWith(userData);
      expect(result).toMatchObject(userData);
    });
  });

  describe('updateUserInMongo', () => {
    it('should update and return user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updatedData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '1111111111',
        website: 'https://updated.com',
      };
      const updatedUser = { _id: userId, ...updatedData };
      (userDatabase.findByIdAndUpdate as any).mockResolvedValue(updatedUser);

      const result = await updateUserInMongo(userId, updatedData);

      expect(userDatabase.findByIdAndUpdate).toHaveBeenCalledWith(userId, updatedData);
      expect(result).toEqual(updatedUser);
    });

    it('should return null when updating non-existent user', async () => {
      const userId = 'nonexistent-id';
      (userDatabase.findByIdAndUpdate as any).mockResolvedValue(null);

      const result = await updateUserInMongo(userId, mockUserRequest);

      expect(result).toBeNull();
    });

    it('should throw error when update fails', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const dbError = new Error('Update failed');
      (userDatabase.findByIdAndUpdate as any).mockRejectedValue(dbError);

      await expect(updateUserInMongo(userId, mockUserRequest)).rejects.toThrow('Update failed');
    });

    it('should update partial fields', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const partialUpdate = {
        name: 'Only Name Updated',
        email: 'same@example.com',
        phone: '1234567890',
        website: 'https://example.com',
      };
      (userDatabase.findByIdAndUpdate as any).mockResolvedValue({ _id: userId, ...partialUpdate });

      const result = await updateUserInMongo(userId, partialUpdate);

      expect(userDatabase.findByIdAndUpdate).toHaveBeenCalledWith(userId, partialUpdate);
    });
  });

  describe('deleteUserFromMongo', () => {
    it('should delete and return deleted user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      (userDatabase.findByIdAndDelete as any).mockResolvedValue(mockUser);

      const result = await deleteUserFromMongo(userId);

      expect(userDatabase.findByIdAndDelete).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when deleting non-existent user', async () => {
      const userId = 'nonexistent-id';
      (userDatabase.findByIdAndDelete as any).mockResolvedValue(null);

      const result = await deleteUserFromMongo(userId);

      expect(result).toBeNull();
    });

    it('should throw error when delete operation fails', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const dbError = new Error('Delete operation failed');
      (userDatabase.findByIdAndDelete as any).mockRejectedValue(dbError);

      await expect(deleteUserFromMongo(userId)).rejects.toThrow('Delete operation failed');
    });
  });
});
