import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as adminService from '../../src/services/adminService.js';
import * as db from '../../src/config/db.js';
import * as mappers from '../../src/utils/mappers.js';

vi.mock('../../src/config/db.js');
vi.mock('../../src/utils/mappers.js');

describe('Admin Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listUsersForAdmin', () => {
    it('Visszaadja az összes felhasználót bejelentkezési adatokkal', async () => {
      const mockRows = [
        {
          id: 1,
          felhasznalonev: 'admin1',
          email: 'admin@example.com',
          regisztracio_datum: '2025-01-01',
          szerepkor: 'admin',
          login_count: 15,
          last_successful_login: '2026-04-13'
        },
        {
          id: 2,
          felhasznalonev: 'user1',
          email: 'user@example.com',
          regisztracio_datum: '2026-01-10',
          szerepkor: 'user',
          login_count: 3,
          last_successful_login: '2026-04-12'
        }
      ];

      db.query.mockResolvedValue(mockRows);
      mappers.mapAdminUserRow
        .mockReturnValueOnce({ id: 1, username: 'admin1', role: 'admin', login_count: 15 })
        .mockReturnValueOnce({ id: 2, username: 'user1', role: 'user', login_count: 3 });

      const result = await adminService.listUsersForAdmin();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM felhasznalo u'));
    });

    it('Visszaad üres tömböt, ha nincsenek felhasználók', async () => {
      db.query.mockResolvedValue([]);

      const result = await adminService.listUsersForAdmin();

      expect(result).toEqual([]);
    });

    it('Bejelentkezési számlálót alapértelmezésben 0-nak állít be', async () => {
      const mockRows = [
        {
          id: 3,
          felhasznalonev: 'newuser',
          email: 'new@example.com',
          regisztracio_datum: '2026-04-13',
          szerepkor: 'user',
          login_count: null,
          last_successful_login: null
        }
      ];

      db.query.mockResolvedValue(mockRows);
      mappers.mapAdminUserRow.mockReturnValue({
        id: 3,
        username: 'newuser',
        login_count: 0
      });

      const result = await adminService.listUsersForAdmin();

      expect(result[0].login_count).toBe(0);
    });
  });

  describe('listCategories', () => {
    it('Visszaadja az összes kategóriát név szerint rendezve', async () => {
      const mockRows = [
        { id: 1, nev: 'Csapatsport' },
        { id: 2, nev: 'Racketisport' },
        { id: 3, nev: 'Vízisport' }
      ];

      db.query.mockResolvedValue(mockRows);
      mappers.mapCategoryRow
        .mockReturnValueOnce({ id: 1, name: 'Csapatsport' })
        .mockReturnValueOnce({ id: 2, name: 'Racketisport' })
        .mockReturnValueOnce({ id: 3, name: 'Vízisport' });

      const result = await adminService.listCategories();

      expect(result).toHaveLength(3);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, nev FROM kategoria ORDER BY nev ASC')
      );
    });

    it('Visszaad üres tömböt, ha nincsenek kategóriák', async () => {
      db.query.mockResolvedValue([]);

      const result = await adminService.listCategories();

      expect(result).toEqual([]);
    });
  });

  describe('listSportTypes', () => {
    it('Visszaadja az összes sportágat név szerint rendezve', async () => {
      const mockRows = [
        { id: 1, nev: 'Foci' },
        { id: 2, nev: 'Tenisz' },
        { id: 3, nev: 'Úszás' }
      ];

      db.query.mockResolvedValue(mockRows);
      mappers.mapSportTypeRow
        .mockReturnValueOnce({ id: 1, name: 'Foci' })
        .mockReturnValueOnce({ id: 2, name: 'Tenisz' })
        .mockReturnValueOnce({ id: 3, name: 'Úszás' });

      const result = await adminService.listSportTypes();

      expect(result).toHaveLength(3);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, nev FROM sportag ORDER BY nev ASC')
      );
    });
  });

  describe('listLocations', () => {
    it('Visszaadja az összes helyszínt város és cím szerint rendezve', async () => {
      const mockRows = [
        { id: 1, varos: 'Budapest', cim: 'Margitsziget 1.' },
        { id: 2, varos: 'Budapest', cim: 'Népliget 5.' },
        { id: 3, varos: 'Debrecen', cim: 'Nagyerdő 10.' }
      ];

      db.query.mockResolvedValue(mockRows);
      mappers.mapLocationRow
        .mockReturnValueOnce({ id: 1, city: 'Budapest', address: 'Margitsziget 1.' })
        .mockReturnValueOnce({ id: 2, city: 'Budapest', address: 'Népliget 5.' })
        .mockReturnValueOnce({ id: 3, city: 'Debrecen', address: 'Nagyerdő 10.' });

      const result = await adminService.listLocations();

      expect(result).toHaveLength(3);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, varos, cim FROM helyszin ORDER BY varos ASC, cim ASC')
      );
    });
  });

  describe('listOrganizers', () => {
    it('Visszaadja az összes szervezőt név szerint rendezve', async () => {
      const mockRows = [
        { id: 1, nev: 'UTE Tenisz Klub', telefon: '123-456-7890', email: 'ute@example.com', weboldal: 'www.ute.hu' },
        { id: 2, nev: 'Vörösmarty Öttusa Egyesület', telefon: '987-654-3210', email: 'vorosmarty@example.com', weboldal: 'www.vorosmarty.hu' }
      ];

      db.query.mockResolvedValue(mockRows);
      mappers.mapOrganizerRow
        .mockReturnValueOnce({ id: 1, name: 'UTE Tenisz Klub', phone: '123-456-7890' })
        .mockReturnValueOnce({ id: 2, name: 'Vörösmarty Öttusa Egyesület', phone: '987-654-3210' });

      const result = await adminService.listOrganizers();

      expect(result).toHaveLength(2);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, nev, telefon, email, weboldal FROM szervezo ORDER BY nev ASC')
      );
    });

    it('Visszaad üres tömböt, ha nincsenek szervezők', async () => {
      db.query.mockResolvedValue([]);

      const result = await adminService.listOrganizers();

      expect(result).toEqual([]);
    });
  });
});
