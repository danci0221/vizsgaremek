import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authService from '../../src/services/authService.js';
import * as db from '../../src/config/db.js';
import * as helpers from '../../src/utils/helpers.js';
import * as mappers from '../../src/utils/mappers.js';

vi.mock('../../src/config/db.js');
vi.mock('../../src/utils/helpers.js');
vi.mock('../../src/utils/mappers.js');

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isEmailTaken', () => {
    it('Visszaad igaz értéket, ha az email már foglalt', async () => {
      helpers.normalizeEmail.mockReturnValue('test@example.com');
      db.query.mockResolvedValue([{ id: 1 }]);

      const result = await authService.isEmailTaken('test@example.com');

      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        ['test@example.com']
      );
    });

    it('Visszaad hamis értéket, ha az email még nem foglalt', async () => {
      helpers.normalizeEmail.mockReturnValue('newemail@example.com');
      db.query.mockResolvedValue([]);

      const result = await authService.isEmailTaken('newemail@example.com');

      expect(result).toBe(false);
    });

    it('Visszaad hamis értéket, ha az email normalizálása fajl', async () => {
      helpers.normalizeEmail.mockReturnValue(null);

      const result = await authService.isEmailTaken('');

      expect(result).toBe(false);
      expect(db.query).not.toHaveBeenCalled();
    });
  });

  describe('registerUser', () => {
    it('Sikeresen regisztrálja az új felhasználót', async () => {
      const body = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      };

      helpers.normalizeEmail.mockReturnValue('new@example.com');
      helpers.hashPassword.mockReturnValue('hashedpassword');
      helpers.verifyPassword.mockReturnValue(true);
      
      db.query.mockResolvedValueOnce([]); // nem létezik
      db.execute.mockResolvedValueOnce({ insertId: 1 }); // insert
      db.query.mockResolvedValueOnce([
        {
          id: 1,
          felhasznalonev: 'newuser',
          email: 'new@example.com',
          regisztracio_datum: '2026-01-01',
          szerepkor: 'user'
        }
      ]); // select user
      
      mappers.mapUserRowToProfile.mockReturnValue({
        id: 1,
        username: 'newuser',
        email: 'new@example.com'
      });

      const result = await authService.registerUser(body);

      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO felhasznalo'),
        ['newuser', 'new@example.com', 'hashedpassword', 'user']
      );
    });

    it('Hibát ad vissza, ha az email vagy felhasználónév már foglalt', async () => {
      const body = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      };

      helpers.normalizeEmail.mockReturnValue('existing@example.com');
      helpers.hashPassword.mockReturnValue('hashedpassword');
      
      db.query.mockResolvedValueOnce([{ id: 1 }]); // már létezik

      const result = await authService.registerUser(body);

      expect(result.error).toBe('Ez az email vagy felhasználónév már foglalt.');
      expect(result.user).toBeUndefined();
    });
  });

  describe('signInUser', () => {
    it('Sikeresen bejelentkeztet egy felhasználót', async () => {
      const body = {
        identifier: 'testuser',
        password: 'password123'
      };

      db.query.mockResolvedValueOnce([
        {
          id: 1,
          felhasznalonev: 'testuser',
          email: 'test@example.com',
          jelszo_hash: 'hashedpassword',
          regisztracio_datum: '2026-01-01',
          szerepkor: 'user'
        }
      ]);
      
      helpers.verifyPassword.mockReturnValue(true);
      mappers.mapUserRowToProfile.mockReturnValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      });

      const result = await authService.signInUser(body, '192.168.1.1');

      expect(result.user).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('Hibát ad vissza, ha a jelszó helytelen', async () => {
      const body = {
        identifier: 'testuser',
        password: 'wrongpassword'
      };

      db.query.mockResolvedValueOnce([
        {
          id: 1,
          felhasznalonev: 'testuser',
          email: 'test@example.com',
          jelszo_hash: 'hashedpassword',
          regisztracio_datum: '2026-01-01',
          szerepkor: 'user'
        }
      ]);
      
      helpers.verifyPassword.mockReturnValue(false);

      const result = await authService.signInUser(body, '192.168.1.1');

      expect(result.error).toBe('Hibás bejelentkezési adatok.');
      expect(result.user).toBeUndefined();
    });

    it('Hibát ad vissza, ha a felhasználó nem található', async () => {
      const body = {
        identifier: 'nonexistent',
        password: 'password123'
      };

      db.query.mockResolvedValueOnce([]);

      const result = await authService.signInUser(body, '192.168.1.1');

      expect(result.error).toBe('Hibás bejelentkezési adatok.');
    });
  });

  describe('isAdminEmail', () => {
    it('Visszaad igaz értéket, ha az email admin', async () => {
      helpers.normalizeEmail.mockReturnValue('admin@example.com');
      mappers.isAdminAllowlistEnabled.mockReturnValue(false);
      db.query.mockResolvedValue([{ id: 1 }]);

      const result = await authService.isAdminEmail('admin@example.com');

      expect(result).toBe(true);
    });

    it('Visszaad hamis értéket, ha az email nem admin', async () => {
      helpers.normalizeEmail.mockReturnValue('user@example.com');
      mappers.isAdminAllowlistEnabled.mockReturnValue(false);
      db.query.mockResolvedValue([]);

      const result = await authService.isAdminEmail('user@example.com');

      expect(result).toBe(false);
    });
  });

  describe('findUserIdByEmail', () => {
    it('Megtalálja a felhasználót az email alapján', async () => {
      db.query.mockResolvedValue([{ id: 42 }]);

      const result = await authService.findUserIdByEmail('test@example.com');

      expect(result).toBe(42);
    });

    it('Visszaad null értéket, ha a felhasználó nem található', async () => {
      db.query.mockResolvedValue([]);

      const result = await authService.findUserIdByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});
