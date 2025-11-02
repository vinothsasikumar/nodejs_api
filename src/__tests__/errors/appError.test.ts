import { describe, it, expect } from 'vitest';
import { AppError } from '../../errors/appError';

describe('AppError', () => {
  it('should create an AppError instance with message and status code', () => {
    const message = 'Test error message';
    const statusCode = 400;

    const error = new AppError(message, statusCode);

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
  });

  it('should set the error name to "AppError"', () => {
    const error = new AppError('Test error', 500);

    expect(error.name).toBe('AppError');
  });

  it('should capture stack trace', () => {
    const error = new AppError('Test error', 500);

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('AppError');
  });

  it('should handle different HTTP status codes', () => {
    const testCases = [
      { message: 'Bad Request', statusCode: 400 },
      { message: 'Unauthorized', statusCode: 401 },
      { message: 'Forbidden', statusCode: 403 },
      { message: 'Not Found', statusCode: 404 },
      { message: 'Internal Server Error', statusCode: 500 },
    ];

    testCases.forEach(({ message, statusCode }) => {
      const error = new AppError(message, statusCode);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
    });
  });

  it('should be throwable', () => {
    const throwError = () => {
      throw new AppError('Something went wrong', 500);
    };

    expect(throwError).toThrow(AppError);
    expect(throwError).toThrow('Something went wrong');
  });

  it('should be catchable as Error', () => {
    try {
      throw new AppError('Test error', 400);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(400);
      }
    }
  });

  it('should preserve error message through inheritance', () => {
    const customMessage = 'Custom error message with special characters: @#$%';
    const error = new AppError(customMessage, 422);

    expect(error.message).toBe(customMessage);
    expect(error.toString()).toContain(customMessage);
  });
});
