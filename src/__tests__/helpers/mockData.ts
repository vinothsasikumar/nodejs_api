// Mock user data for testing
export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedPassword123',
  phone: '1234567890',
  website: 'https://example.com',
};

export const mockUserArray = [
  mockUser,
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'hashedPassword456',
    phone: '0987654321',
    website: 'https://jane.com',
  },
];

export const mockUserRequest = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  website: 'https://example.com',
};

export const mockInvalidUserRequest = {
  name: 'Jo', // Too short (min 5 chars required)
  email: 'invalid-email',
  phone: '1234567890',
  website: 'https://example.com',
};

export const mockLoginRequest = {
  userId: '507f1f77bcf86cd799439011',
};

export const mockJWTPayload = {
  userId: '507f1f77bcf86cd799439011',
};
