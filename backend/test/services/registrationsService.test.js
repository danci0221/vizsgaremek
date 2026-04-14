import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as registrationsService from '../../src/services/registrationsService.js';
import * as db from '../../src/config/db.js';
import * as mappers from '../../src/utils/mappers.js';

vi.mock('../../src/config/db.js');
vi.mock('../../src/utils/mappers.js');
vi.mock('../../src/utils/helpers.js');

describe('Registrations Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listRegistrations', () => {
    it('Visszaadja a felhasználó regisztrációit', async () => {
      const mockRows = [
        {
          id: 1,
          allapot: 'aktiv',
          jelentkezes_idopont: '2026-01-15',
          sport_id: 5,
          sport_name: 'Tenisz',
          sport_type: 'Racketisport',
          location: 'Budapest',
          address: 'Margitsziget 1.',
          price: 5000,
          time_slot: '08:00-22:00',
          opening_hours: true,
          contact: '123-456-7890',
          image: 'http://example.com/tennis.jpg'
        }
      ];

      db.query.mockResolvedValue(mockRows);
      mappers.mapRegistrationRow.mockReturnValue({ id: 1, sport_name: 'Tenisz' });

      const result = await registrationsService.listRegistrations(10);

      expect(result).toHaveLength(1);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [10]
      );
    });

    it('Visszaad üres tömböt, ha nincs regisztráció', async () => {
      db.query.mockResolvedValue([]);

      const result = await registrationsService.listRegistrations(10);

      expect(result).toEqual([]);
    });
  });

  describe('createRegistration', () => {
    it('Sikeresen létrehoz új regisztrációt', async () => {
      const mockRegistration = {
        id: 1,
        allapot: 'aktiv',
        sport_name: 'Tenisz'
      };

      db.execute.mockResolvedValue({ insertId: 1, affectedRows: 1 });
      db.query.mockResolvedValueOnce([]).mockResolvedValueOnce([mockRegistration]);
      mappers.mapRegistrationRow.mockReturnValue(mockRegistration);

      const result = await registrationsService.createRegistration(10, 5);

      expect(result).toEqual(mockRegistration);
      expect(db.execute).toHaveBeenCalledWith(
        expect.any(String),
        [10, 5]
      );
    });

    it('Hibát ad vissza, ha már regisztrált a felhasználó erre a sportra', async () => {
      const error = new Error('Duplicate entry');
      db.execute.mockRejectedValue(error);

      const result = await registrationsService.createRegistration(10, 5);

      expect(result.error).toBe('Már regisztrált vagy erre a sportra.');
    });

    it('Null értéket ad vissza, ha nem találja az új regisztrációt', async () => {
      db.execute.mockResolvedValue({ insertId: 1, affectedRows: 1 });
      db.query.mockResolvedValue([]);

      const result = await registrationsService.createRegistration(10, 5);

      expect(result).toBeNull();
    });
  });

  describe('cancelRegistration', () => {
    it('Sikeresen felmondja a regisztrációt', async () => {
      db.query.mockResolvedValue([{ id: 1 }]);
      db.execute.mockResolvedValue({ affectedRows: 1 });

      const result = await registrationsService.cancelRegistration(10, 1);

      expect(result).toBe(true);
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM jelentkezes'),
        [1]
      );
    });

    it('Visszaad hamis értéket, ha a regisztráció nem található', async () => {
      db.query.mockResolvedValue([]);

      const result = await registrationsService.cancelRegistration(10, 999);

      expect(result).toBe(false);
    });

    it('Visszaad hamis értéket, ha az update sikertelen', async () => {
      db.query.mockResolvedValue([{ id: 1 }]);
      db.execute.mockResolvedValue({ affectedRows: 0 });

      const result = await registrationsService.cancelRegistration(10, 1);

      expect(result).toBe(false);
    });
  });

  describe('getRegistrationById', () => {
    it('Visszaadja a regisztrációt a felhasználóhoz', async () => {
      const mockRegistration = {
        id: 1,
        allapot: 'aktiv',
        sport_name: 'Tenisz'
      };

      db.query.mockResolvedValue([mockRegistration]);
      mappers.mapRegistrationRow.mockReturnValue(mockRegistration);

      const result = await registrationsService.getRegistrationById(10, 1);

      expect(result).toEqual(mockRegistration);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE j.id = ? AND j.felhasznalo_id = ?'),
        [1, 10]
      );
    });

    it('Null értéket ad vissza, ha a regisztráció nem található', async () => {
      db.query.mockResolvedValue([]);

      const result = await registrationsService.getRegistrationById(10, 999);

      expect(result).toBeNull();
    });

    it('Null értéket ad vissza, ha a regisztráció nem a felhasználóhoz tartozik', async () => {
      db.query.mockResolvedValue([]);

      const result = await registrationsService.getRegistrationById(10, 1);

      expect(result).toBeNull();
    });
  });
});
