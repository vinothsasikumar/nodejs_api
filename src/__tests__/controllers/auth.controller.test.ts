import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from '../../controllers/auth.controller';
import { mockRequest, mockResponse } from '../helpers/mockRequest';
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

describe('Auth Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return token and user for valid userId', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockToken = 'mock-jwt-token';

      (userDatabase.findById as any).mockResolvedValue(mockUser);
      (generateToken as any).mockReturnValue(mockToken);

      const req = mockRequest({ body: { userId } });
      const res = mockResponse();

      await login(req as any, res as any);

      expect(userDatabase.findById).toHaveBeenCalledWith(userId);
      expect(generateToken).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith({
        token: mockToken,
        user: mockUser,
      });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid userId', async () => {
      const userId = 'invalid-user-id';

      (userDatabase.findById as any).mockResolvedValue(null);

      const req = mockRequest({ body: { userId } });
      const res = mockResponse();

      await login(req as any, res as any);

      expect(userDatabase.findById).toHaveBeenCalledWith(userId);
      expect(generateToken).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid User ID' });
    });

    it('should return 401 when user not found', async () => {
      const userId = '507f1f77bcf86cd799439099';

      (userDatabase.findById as any).mockResolvedValue(null);

      const req = mockRequest({ body: { userId } });
      const res = mockResponse();

      await login(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid User ID' });
    });

    it('should return 500 when database operation fails', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const dbError = new Error('Database connection failed');

      (userDatabase.findById as any).mockRejectedValue(dbError);

      const req = mockRequest({ body: { userId } });
      const res = mockResponse();

      await login(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: 'Database connection failed',
      });
    });

    it('should return 500 when token generation fails', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const tokenError = new Error('Token generation failed');

      (userDatabase.findById as any).mockResolvedValue(mockUser);
      (generateToken as any).mockImplementation(() => {
        throw tokenError;
      });

      const req = mockRequest({ body: { userId } });
      const res = mockResponse();

      await login(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: 'Token generation failed',
      });
    });

    it('should handle missing userId in request body', async () => {
      const req = mockRequest({ body: {} });
      const res = mockResponse();

      (userDatabase.findById as any).mockResolvedValue(null);

      await login(req as any, res as any);

      expect(userDatabase.findById).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle non-Error objects in catch block', async () => {
      const userId = '507f1f77bcf86cd799439011';

      (userDatabase.findById as any).mockRejectedValue('String error');

      const req = mockRequest({ body: { userId } });
      const res = mockResponse();

      await login(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: 'Unknown error',
      });
    });

    it('should call generateToken with correct userId', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockToken = 'generated-token';

      (userDatabase.findById as any).mockResolvedValue(mockUser);
      (generateToken as any).mockReturnValue(mockToken);

      const req = mockRequest({ body: { userId } });
      const res = mockResponse();

      await login(req as any, res as any);

      expect(generateToken).toHaveBeenCalledWith(userId);
      expect(generateToken).toHaveBeenCalledOnce();
    });

    it('should return complete user object in response', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockToken = 'jwt-token';
      const fullUserObject = {
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        phone: '1234567890',
        website: 'https://example.com',
      };

      (userDatabase.findById as any).mockResolvedValue(fullUserObject);
      (generateToken as any).mockReturnValue(mockToken);

      const req = mockRequest({ body: { userId } });
      const res = mockResponse();

      await login(req as any, res as any);

      const responseData = (res.json as any).mock.calls[0][0];
      expect(responseData.user).toEqual(fullUserObject);
      expect(responseData.token).toBe(mockToken);
    });
  });
});
