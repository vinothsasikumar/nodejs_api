# Testing Guide

This project uses **Vitest** for unit and integration testing. All tests are located in the `src/__tests__` directory.

## Test Structure

```
src/__tests__/
├── setup.ts                      # Test setup and configuration
├── helpers/
│   ├── mockData.ts               # Mock data for tests
│   └── mockRequest.ts            # Mock Express request/response helpers
├── utilities/
│   └── jwt.test.ts               # JWT utility tests (12 tests)
├── errors/
│   └── appError.test.ts          # AppError class tests (7 tests)
├── middlewares/
│   ├── auth.middleware.test.ts   # Authentication middleware tests (11 tests)
│   ├── validation.middleware.test.ts  # Validation middleware tests (8 tests)
│   ├── errorhandler.middleware.test.ts  # Error handler tests (11 tests)
│   └── logger.middleware.test.ts # Logger middleware tests (3 tests)
├── services/
│   └── user.mongo.service.test.ts  # MongoDB service tests (16 tests)
├── controllers/
│   ├── auth.controller.test.ts   # Auth controller tests (9 tests)
│   └── user.controller.test.ts   # User controller tests (17 tests)
└── integration/
    ├── auth.routes.test.ts       # Auth routes integration tests (13 tests)
    └── user.routes.test.ts       # User routes integration tests (24 tests)
```

**Total: 131 tests**

## Available Commands

### Run All Tests
```bash
npm test
```
or
```bash
npm run test
```

### Run Tests Once (CI Mode)
```bash
npm run test:run
```

### Run Tests with UI
```bash
npm run test:ui
```
Opens an interactive web UI for viewing and running tests.

### Run Tests with Coverage
```bash
npm run test:coverage
```
Generates a coverage report in HTML, JSON, and text formats.

## Test Coverage

The test suite covers:

### Unit Tests
- **JWT Utilities** (12 tests)
  - Token generation
  - Token validation
  - Token verification
  - Expiration handling

- **AppError Class** (7 tests)
  - Error creation
  - Error properties
  - Error inheritance
  - Stack trace capture

- **Middlewares** (33 tests)
  - Authentication middleware (Bearer token validation)
  - Validation middleware (Zod schema validation)
  - Error handler middleware (error formatting)
  - Logger middleware (Morgan HTTP logger)

- **Services** (16 tests)
  - MongoDB user service (CRUD operations)
  - Database interaction mocking

- **Controllers** (26 tests)
  - Auth controller (login functionality)
  - User controller (CRUD operations)

### Integration Tests (37 tests)
- **Auth Routes**
  - Login endpoint
  - Request validation
  - Error handling

- **User Routes**
  - GET /users (list all users)
  - GET /users/:userid (get user by ID)
  - POST /users/create (create user)
  - PUT /users/update/:userid (update user)
  - DELETE /users/delete/:userid (delete user)
  - Authentication requirements
  - Request validation

## Writing New Tests

### Unit Test Example
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { myFunction } from '../../src/myModule';

describe('My Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', () => {
    const result = myFunction();
    expect(result).toBe('expected value');
  });
});
```

### Integration Test Example
```typescript
import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import myRouter from '../../routes/myRouter';

describe('My Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', myRouter);
  });

  it('should handle GET requests', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body).toBeDefined();
  });
});
```

## Mocking

### Mocking Modules
```typescript
vi.mock('../../database/user.database', () => ({
  userDatabase: {
    findById: vi.fn(),
    create: vi.fn(),
  },
}));
```

### Mocking Express Request/Response
```typescript
import { mockRequest, mockResponse, mockNext } from '../helpers/mockRequest';

const req = mockRequest({ body: { userId: '123' } });
const res = mockResponse();
const next = mockNext();
```

## Best Practices

1. **Clear Mocks**: Always clear mocks in `beforeEach` hooks
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

2. **Test Isolation**: Each test should be independent
3. **Descriptive Names**: Use clear, descriptive test names
4. **Arrange-Act-Assert**: Follow the AAA pattern
5. **Mock External Dependencies**: Mock databases, external APIs, etc.

## CI/CD Integration

For continuous integration, use:
```bash
npm run test:run
```

This command runs all tests once and exits, perfect for CI pipelines.

## Troubleshooting

### Tests Not Found
If Vitest can't find your tests, ensure:
- Test files end with `.test.ts` or `.spec.ts`
- Test files are in the `src/__tests__` directory
- `vitest.config.ts` includes the correct patterns

### Mock Issues
If mocks aren't working:
- Ensure `vi.clearAllMocks()` is called in `beforeEach`
- Check that the mock path matches the actual import path
- Verify the mock is defined before the test runs

### TypeScript Errors
If you see TypeScript errors:
- Run `npm install` to ensure all dependencies are installed
- Check that `tsconfig.json` and `vitest.config.ts` are configured correctly

## Configuration Files

- `vitest.config.ts` - Vitest configuration
- `src/__tests__/setup.ts` - Test setup file
- `tsconfig.test.json` - TypeScript config for tests

## Dependencies

### Testing Dependencies
- `vitest` - Test runner
- `@vitest/ui` - Test UI
- `supertest` - HTTP integration testing
- `@types/supertest` - TypeScript types for supertest

### Mocking
Tests use Vitest's built-in mocking capabilities (`vi.fn()`, `vi.mock()`).

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
