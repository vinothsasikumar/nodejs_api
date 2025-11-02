import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as jwt from 'jsonwebtoken';
import { generateToken, validate, verifyToken } from '../../utilities/jwt';

describe('JWT Utilities', () => {
  const JWT_SECRET = '761805baa5260c5b828e9bd706d15434299b8fb58eb1e8f4112d4cdf145cc0b0ac650a9eb52a057b31af8cf1c8ed9a28e029c66358958f227bd06c5b4b457807';

  describe('generateToken', () => {
    it('should generate a valid JWT token from string payload', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts

      // Verify the token contains the userId
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      expect(decoded.userId).toBe(userId);
    });

    it('should generate a valid JWT token from object payload', () => {
      const payload = { userId: '507f1f77bcf86cd799439011', role: 'admin' };
      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });

    it('should include expiration time in token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateToken(userId);

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(600000);
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateToken('user1');
      const token2 = generateToken('user2');

      expect(token1).not.toBe(token2);
    });
  });

  describe('validate', () => {
    it('should validate a valid token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateToken(userId);

      const decoded = validate(token);

      expect(decoded).toBeDefined();
      expect((decoded as any).userId).toBe(userId);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => validate(invalidToken)).toThrow();
    });

    it('should throw error for tampered token', () => {
      const token = generateToken('507f1f77bcf86cd799439011');
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      expect(() => validate(tamperedToken)).toThrow();
    });

    it('should throw error for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: '507f1f77bcf86cd799439011' },
        JWT_SECRET,
        { expiresIn: -1 } // Already expired
      );

      expect(() => validate(expiredToken)).toThrow();
    });

    it('should throw error for token with wrong secret', () => {
      const wrongToken = jwt.sign(
        { userId: '507f1f77bcf86cd799439011' },
        'wrong-secret',
        { expiresIn: 600000 }
      );

      expect(() => validate(wrongToken)).toThrow();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateToken(userId);

      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect((decoded as any).userId).toBe(userId);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should be equivalent to validate function', () => {
      const token = generateToken('507f1f77bcf86cd799439011');

      const validatedResult = validate(token);
      const verifiedResult = verifyToken(token);

      expect(validatedResult).toEqual(verifiedResult);
    });
  });
});
