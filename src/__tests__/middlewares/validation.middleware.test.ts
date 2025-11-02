import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validate } from '../../middlewares/validation.middleware';
import { mockRequest, mockResponse, mockNext } from '../helpers/mockRequest';

describe('Validation Middleware', () => {
  const testSchema = z.object({
    name: z.string().min(5).max(50),
    email: z.string().email(),
    phone: z.string(),
  });

  it('should call next() for valid data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
    };

    const req = mockRequest({ body: validData });
    const res = mockResponse();
    const next = mockNext();

    const middleware = validate(testSchema);
    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should set validated data to req.body', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
    };

    const req = mockRequest({ body: validData });
    const res = mockResponse();
    const next = mockNext();

    const middleware = validate(testSchema);
    middleware(req as any, res as any, next);

    expect(req.body).toEqual(validData);
    expect(next).toHaveBeenCalledOnce();
  });

  it('should return 400 for invalid data', () => {
    const invalidData = {
      name: 'Jo', // Too short (min 5 chars)
      email: 'invalid-email',
      phone: '1234567890',
    };

    const req = mockRequest({ body: invalidData });
    const res = mockResponse();
    const next = mockNext();

    const middleware = validate(testSchema);
    middleware(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should return validation errors for missing required fields', () => {
    const incompleteData = {
      name: 'John Doe',
      // Missing email and phone
    };

    const req = mockRequest({ body: incompleteData });
    const res = mockResponse();
    const next = mockNext();

    const middleware = validate(testSchema);
    middleware(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();

    const errorResponse = (res.json as any).mock.calls[0][0];
    expect(errorResponse.issues).toBeDefined();
    expect(errorResponse.issues.length).toBeGreaterThan(0);
  });

  it('should validate multiple fields and return all errors', () => {
    const multipleErrors = {
      name: 'Jo', // Too short
      email: 'not-an-email', // Invalid email
      phone: '123', // Valid but we're testing multiple errors
    };

    const req = mockRequest({ body: multipleErrors });
    const res = mockResponse();
    const next = mockNext();

    const middleware = validate(testSchema);
    middleware(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();

    const errorResponse = (res.json as any).mock.calls[0][0];
    expect(errorResponse.issues).toBeDefined();
    expect(errorResponse.issues.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle empty body', () => {
    const req = mockRequest({ body: {} });
    const res = mockResponse();
    const next = mockNext();

    const middleware = validate(testSchema);
    middleware(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should work with different schemas', () => {
    const loginSchema = z.object({
      userId: z.string(),
    });

    const validLoginData = { userId: '507f1f77bcf86cd799439011' };

    const req = mockRequest({ body: validLoginData });
    const res = mockResponse();
    const next = mockNext();

    const middleware = validate(loginSchema);
    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should strip extra fields not in schema', () => {
    const schemaWithStrict = z.object({
      name: z.string(),
    });

    const dataWithExtra = {
      name: 'John Doe',
      extraField: 'should be removed',
    };

    const req = mockRequest({ body: dataWithExtra });
    const res = mockResponse();
    const next = mockNext();

    const middleware = validate(schemaWithStrict);
    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.body).toEqual({ name: 'John Doe' });
    expect(req.body.extraField).toBeUndefined();
  });
});
