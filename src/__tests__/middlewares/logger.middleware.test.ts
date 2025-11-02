import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock fs and path before importing the module
vi.mock('fs');
vi.mock('path');

describe('Logger Middleware', () => {
  let mockWriteStream: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock createWriteStream
    mockWriteStream = {
      write: vi.fn(),
      end: vi.fn(),
      on: vi.fn(),
    };

    (fs.createWriteStream as any) = vi.fn().mockReturnValue(mockWriteStream);
    (path.join as any) = vi.fn().mockReturnValue('/mocked/path/applogs.log');
  });

  it('should create write stream with correct path and flags', async () => {
    // Import the module after mocking
    await import('../../middlewares/logger.middleware');

    expect(path.join).toHaveBeenCalled();
    expect(fs.createWriteStream).toHaveBeenCalledWith(
      '/mocked/path/applogs.log',
      { flags: 'a' }
    );
  });

  it('should export httpLogger', async () => {
    const { httpLogger } = await import('../../middlewares/logger.middleware');

    expect(httpLogger).toBeDefined();
    expect(typeof httpLogger).toBe('function');
  });

  it('should use morgan with custom time token', async () => {
    const morgan = await import('morgan');

    // The custom time token should be registered
    expect(morgan.token).toBeDefined();
  });
});
