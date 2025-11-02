import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '../../middlewares/errorhandler.middleware';
import { AppError } from '../../errors/appError';
import { mockRequest, mockResponse, mockNext } from '../helpers/mockRequest';

describe('Error Handler Middleware', () => {
  it('should handle AppError with custom status code and message', () => {
    const error = new AppError('Custom error message', 400);
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorHandler(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Custom error message',
      statusCode: 400,
    });
  });

  it('should handle AppError with 404 status code', () => {
    const error = new AppError('Resource not found', 404);
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorHandler(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Resource not found',
      statusCode: 404,
    });
  });

  it('should handle AppError with 401 unauthorized status', () => {
    const error = new AppError('Unauthorized access', 401);
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorHandler(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized access',
      statusCode: 401,
    });
  });

  it('should handle generic Error with 500 status code', () => {
    const error = new Error('Something went wrong');
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorHandler(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      statusCode: 500,
    });
  });

  it('should handle non-Error objects with 500 status code', () => {
    const error = { someField: 'some value' };
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorHandler(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      statusCode: 500,
    });
  });

  it('should handle string errors with 500 status code', () => {
    const error = 'String error message';
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorHandler(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      statusCode: 500,
    });
  });

  it('should handle null error with 500 status code', () => {
    const error = null;
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorHandler(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      statusCode: 500,
    });
  });

  it('should handle undefined error with 500 status code', () => {
    const error = undefined;
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorHandler(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      statusCode: 500,
    });
  });

  it('should preserve custom AppError status codes', () => {
    const testCases = [
      { statusCode: 400, message: 'Bad Request' },
      { statusCode: 403, message: 'Forbidden' },
      { statusCode: 404, message: 'Not Found' },
      { statusCode: 422, message: 'Unprocessable Entity' },
      { statusCode: 500, message: 'Internal Server Error' },
      { statusCode: 503, message: 'Service Unavailable' },
    ];

    testCases.forEach(({ statusCode, message }) => {
      const error = new AppError(message, statusCode);
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      errorHandler(error, req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith({
        message,
        statusCode,
      });

      vi.clearAllMocks();
    });
  });

  it('should not call next() after handling error', () => {
    const error = new AppError('Test error', 400);
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorHandler(error, req as any, res as any, next);

    expect(next).not.toHaveBeenCalled();
  });

  it('should return JSON response with correct structure', () => {
    const error = new AppError('Validation failed', 422);
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorHandler(error, req as any, res as any, next);

    const jsonCall = (res.json as any).mock.calls[0][0];
    expect(jsonCall).toHaveProperty('message');
    expect(jsonCall).toHaveProperty('statusCode');
    expect(Object.keys(jsonCall)).toHaveLength(2);
  });
});
