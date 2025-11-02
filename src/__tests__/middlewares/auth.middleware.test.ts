import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate } from '../../middlewares/auth.middleware';
import { generateToken } from '../../utilities/jwt';
import { mockRequest, mockResponse, mockNext } from '../helpers/mockRequest';

// Mock the JWT utilities
vi.mock('../../utilities/jwt', async () => {
  const actual = await vi.importActual('../../utilities/jwt');
  return {
    ...actual,
    verifyToken: vi.fn(),
  };
});

import { verifyToken } from '../../utilities/jwt';

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call next() for valid Bearer token', () => {
    const payload = { userId: '507f1f77bcf86cd799439011' };
    (verifyToken as any).mockReturnValue(payload);

    const req = mockRequest({
      headers: { authorization: 'Bearer valid-token-here' },
    });
    const res = mockResponse();
    const next = mockNext();

    authenticate(req as any, res as any, next);

    expect(verifyToken).toHaveBeenCalledWith('valid-token-here');
    expect((req as any).user).toEqual(payload);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header is missing', () => {
    const req = mockRequest({ headers: {} });
    const res = mockResponse();
    const next = mockNext();

    authenticate(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User is not authenticated' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header does not start with Bearer', () => {
    const req = mockRequest({
      headers: { authorization: 'Basic some-token' },
    });
    const res = mockResponse();
    const next = mockNext();

    authenticate(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User is not authenticated' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', () => {
    (verifyToken as any).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = mockRequest({
      headers: { authorization: 'Bearer invalid-token' },
    });
    const res = mockResponse();
    const next = mockNext();

    authenticate(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is expired', () => {
    (verifyToken as any).mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const req = mockRequest({
      headers: { authorization: 'Bearer expired-token' },
    });
    const res = mockResponse();
    const next = mockNext();

    authenticate(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when payload does not contain userId or id', () => {
    (verifyToken as any).mockReturnValue({ someOtherField: 'value' });

    const req = mockRequest({
      headers: { authorization: 'Bearer token-without-userid' },
    });
    const res = mockResponse();
    const next = mockNext();

    authenticate(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token payload' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should accept token with id field instead of userId', () => {
    const payload = { id: '507f1f77bcf86cd799439011' };
    (verifyToken as any).mockReturnValue(payload);

    const req = mockRequest({
      headers: { authorization: 'Bearer valid-token-with-id' },
    });
    const res = mockResponse();
    const next = mockNext();

    authenticate(req as any, res as any, next);

    expect((req as any).user).toEqual(payload);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should handle token with both userId and additional fields', () => {
    const payload = { userId: '507f1f77bcf86cd799439011', role: 'admin', email: 'user@example.com' };
    (verifyToken as any).mockReturnValue(payload);

    const req = mockRequest({
      headers: { authorization: 'Bearer token-with-extra-fields' },
    });
    const res = mockResponse();
    const next = mockNext();

    authenticate(req as any, res as any, next);

    expect((req as any).user).toEqual(payload);
    expect(next).toHaveBeenCalledOnce();
  });

  it('should return 401 for empty token', () => {
    const req = mockRequest({
      headers: { authorization: 'Bearer ' },
    });
    const res = mockResponse();
    const next = mockNext();

    (verifyToken as any).mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    authenticate(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should extract token correctly from Bearer header', () => {
    const payload = { userId: '507f1f77bcf86cd799439011' };
    (verifyToken as any).mockReturnValue(payload);

    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
    const req = mockRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = mockResponse();
    const next = mockNext();

    authenticate(req as any, res as any, next);

    expect(verifyToken).toHaveBeenCalledWith(token);
    expect(next).toHaveBeenCalledOnce();
  });

  it('should return 401 when payload is null', () => {
    (verifyToken as any).mockReturnValue(null);

    const req = mockRequest({
      headers: { authorization: 'Bearer token-with-null-payload' },
    });
    const res = mockResponse();
    const next = mockNext();

    authenticate(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token payload' });
    expect(next).not.toHaveBeenCalled();
  });
});
