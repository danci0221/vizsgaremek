import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleAuthRoutes } from '../../src/routes/auth.js';
import * as helpers from '../../src/utils/helpers.js';
import * as validators from '../../src/utils/validators.js';
import * as authService from '../../src/services/authService.js';

vi.mock('../../src/utils/helpers.js');
vi.mock('../../src/utils/validators.js');
vi.mock('../../src/services/authService.js');

describe('Auth Routes', () => {
  let req, res, mockJson;

  beforeEach(() => {
    vi.clearAllMocks();
    mockJson = vi.fn();
    
    res = {
      statusCode: 200,
      headers: {},
      write: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis()
    };

    helpers.json = mockJson;
    helpers.readBody = vi.fn();
    helpers.normalizeHeaderValue = vi.fn();
  });

  describe('GET /api/auth/check-email', () => {
    it('Ellenőrzi, hogy az email foglalt-e', async () => {
      req = {
        method: 'GET',
        socket: { remoteAddress: '192.168.1.1' }
      };

      helpers.readBody.mockResolvedValue({});
      authService.isEmailTaken.mockResolvedValue(true);

      await handleAuthRoutes(
        req,
        res,
        '/api/auth/check-email',
        '/api/auth/check-email?email=test@example.com'
      );

      expect(mockJson).toHaveBeenCalledWith(
        res,
        200,
        expect.objectContaining({ exists: true })
      );
    });

    it('Hibát ad vissza, ha az email paraméter hiányzik', async () => {
      req = {
        method: 'GET',
        socket: { remoteAddress: '192.168.1.1' }
      };

      await handleAuthRoutes(
        req,
        res,
        '/api/auth/check-email',
        '/api/auth/check-email'
      );

      expect(mockJson).toHaveBeenCalledWith(
        res,
        400,
        expect.objectContaining({ message: expect.stringContaining('email paraméter') })
      );
    });

    it('Hibát ad vissza, ha az email formátuma érvénytelen', async () => {
      req = {
        method: 'GET',
        socket: { remoteAddress: '192.168.1.1' }
      };

      await handleAuthRoutes(
        req,
        res,
        '/api/auth/check-email',
        '/api/auth/check-email?email=invalidemail'
      );

      expect(mockJson).toHaveBeenCalledWith(
        res,
        400,
        expect.objectContaining({ message: expect.stringContaining('Érvénytelen email') })
      );
    });
  });

  describe('POST /api/auth/signup', () => {
    it('Sikeresen regisztrálja az új felhasználót', async () => {
      const body = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      };

      req = {
        method: 'POST',
        socket: { remoteAddress: '192.168.1.1' }
      };

      helpers.readBody.mockResolvedValue(body);
      validators.validateSignupPayload.mockReturnValue(null);
      authService.registerUser.mockResolvedValue({
        user: { id: 1, username: 'newuser', email: 'new@example.com' }
      });

      await handleAuthRoutes(
        req,
        res,
        '/api/auth/signup',
        '/api/auth/signup'
      );

      expect(mockJson).toHaveBeenCalledWith(
        res,
        201,
        expect.objectContaining({ user: expect.any(Object) })
      );
    });

    it('Hibát ad vissza, ha az email már foglalt', async () => {
      const body = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      };

      req = {
        method: 'POST',
        socket: { remoteAddress: '192.168.1.1' }
      };

      helpers.readBody.mockResolvedValue(body);
      validators.validateSignupPayload.mockReturnValue(null);
      authService.registerUser.mockResolvedValue({
        error: 'Ez az email vagy felhasználónév már foglalt.'
      });

      await handleAuthRoutes(
        req,
        res,
        '/api/auth/signup',
        '/api/auth/signup'
      );

      expect(mockJson).toHaveBeenCalledWith(
        res,
        409,
        expect.any(Object)
      );
    });

    it('Hibát ad vissza, ha a payload érvénytelen', async () => {
      const body = {
        username: '',
        email: 'invalid',
        password: ''
      };

      req = {
        method: 'POST',
        socket: { remoteAddress: '192.168.1.1' }
      };

      helpers.readBody.mockResolvedValue(body);
      validators.validateSignupPayload.mockReturnValue('Érvénytelen adatok');

      await handleAuthRoutes(
        req,
        res,
        '/api/auth/signup',
        '/api/auth/signup'
      );

      expect(mockJson).toHaveBeenCalledWith(
        res,
        400,
        expect.any(Object)
      );
    });
  });

  describe('POST /api/auth/signin', () => {
    it('Sikeresen bejelentkeztet egy felhasználót', async () => {
      const body = {
        identifier: 'testuser',
        password: 'password123'
      };

      req = {
        method: 'POST',
        socket: { remoteAddress: '192.168.1.1' }
      };

      helpers.readBody.mockResolvedValue(body);
      validators.validateSigninPayload.mockReturnValue(null);
      authService.signInUser.mockResolvedValue({
        user: { id: 1, username: 'testuser', email: 'test@example.com' }
      });

      await handleAuthRoutes(
        req,
        res,
        '/api/auth/signin',
        '/api/auth/signin'
      );

      expect(mockJson).toHaveBeenCalledWith(
        res,
        200,
        expect.objectContaining({ user: expect.any(Object) })
      );
    });

    it('Hibát ad vissza, ha a bejelentkezési adatok helytelenek', async () => {
      const body = {
        identifier: 'testuser',
        password: 'wrongpassword'
      };

      req = {
        method: 'POST',
        socket: { remoteAddress: '192.168.1.1' }
      };

      helpers.readBody.mockResolvedValue(body);
      validators.validateSigninPayload.mockReturnValue(null);
      authService.signInUser.mockResolvedValue({
        error: 'Hibás bejelentkezési adatok.'
      });

      await handleAuthRoutes(
        req,
        res,
        '/api/auth/signin',
        '/api/auth/signin'
      );

      expect(mockJson).toHaveBeenCalledWith(
        res,
        401,
        expect.any(Object)
      );
    });
  });
});
