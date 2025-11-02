import { Request, Response } from 'express';
import { vi } from 'vitest';

export const mockRequest = (overrides = {}): Partial<Request> => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  };
};

export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return res;
};

export const mockNext = () => vi.fn();
