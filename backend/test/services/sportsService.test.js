import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as sportsService from '../../src/services/sportsService.js';
import * as db from '../../src/config/db.js';
import * as mappers from '../../src/utils/mappers.js';

vi.mock('../../src/config/db.js');
vi.mock('../../src/utils/mappers.js');

describe('Sports Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listSports', () => {
    it('Visszaadja az összes sportlehetőséget', async () => {
      const mockSportRows = [
        {
          id: 1,
          nev: 'Tenisz',
          sport: 'Tenisz',
          ar: 5000,
          megjegyzes: 'Pálya foglalható',
          idoszak: '08:00-22:00',
          nyitvatartas: true,
          kapcsolat: '123-456-7890',
          kep_url: 'http://example.com/tennis.jpg',
          kategoria: 'Racketisport',
          varos: 'Budapest',
          cim: 'Margitsziget 1.',
          lat: 47.5,
          lng: 19.0
        },
        {
          id: 2,
          nev: 'Foci',
          sport: 'Foci',
          ar: 10000,
          megjegyzes: 'Pálya foglalható',
          idoszak: '09:00-21:00',
          nyitvatartas: true,
          kapcsolat: '987-654-3210',
          kep_url: 'http://example.com/football.jpg',
          kategoria: 'Csapatsport',
          varos: 'Budapest',
          cim: 'Népliget 5.',
          lat: 47.48,
          lng: 19.1
        }
      ];

      db.query.mockResolvedValue(mockSportRows);
      mappers.mapRowToSport.mockImplementation(row => ({ id: row.id, nev: row.nev }));

      const result = await sportsService.listSports();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 1, nev: 'Tenisz' });
      expect(result[1]).toEqual({ id: 2, nev: 'Foci' });
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY s.id DESC'));
    });

    it('Visszaad üres tömböt, ha nincsenek sportlehetőségek', async () => {
      db.query.mockResolvedValue([]);

      const result = await sportsService.listSports();

      expect(result).toEqual([]);
    });
  });

  describe('getSportById', () => {
    it('Visszaadja a sportlehetőséget ID alapján', async () => {
      const mockSport = {
        id: 1,
        nev: 'Tenisz',
        sport: 'Tenisz',
        ar: 5000,
        kategoria: 'Racketisport'
      };

      db.query.mockResolvedValue([mockSport]);
      mappers.mapRowToSport.mockReturnValue({ id: 1, nev: 'Tenisz', ár: 5000 });

      const result = await sportsService.getSportById(1);

      expect(result).toEqual({ id: 1, nev: 'Tenisz', ár: 5000 });
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE s.id = ?'),
        [1]
      );
    });

    it('Visszaad null értéket, ha a sport nem található', async () => {
      db.query.mockResolvedValue([]);

      const result = await sportsService.getSportById(999);

      expect(result).toBeNull();
    });
  });

  describe('sportExists', () => {
    it('Visszaad igaz értéket, ha a sport létezik', async () => {
      db.query.mockResolvedValue([{ id: 1 }]);

      const result = await sportsService.sportExists(1);

      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1]
      );
    });

    it('Visszaad hamis értéket, ha a sport nem létezik', async () => {
      db.query.mockResolvedValue([]);

      const result = await sportsService.sportExists(999);

      expect(result).toBe(false);
    });
  });

  describe('getOrCreateCategoryId', () => {
    it('Megtalálja a létező kategóriát', async () => {
      const mockConnection = {
        query: vi.fn().mockResolvedValue([[{ id: 5 }]])
      };

      const result = await sportsService.getOrCreateCategoryId(mockConnection, 'Racketisport');

      expect(result).toBe(5);
      expect(mockConnection.query).toHaveBeenCalledWith(
        'SELECT id FROM kategoria WHERE nev = ? LIMIT 1',
        ['Racketisport']
      );
    });

    it('Létrehoz új kategóriát, ha nem létezik', async () => {
      const mockConnection = {
        query: vi.fn()
          .mockResolvedValueOnce([[]]),
        execute: vi.fn()
          .mockResolvedValueOnce([{ insertId: 10 }])
      };

      const result = await sportsService.getOrCreateCategoryId(mockConnection, 'NewCategory');

      expect(result).toBe(10);
      expect(mockConnection.query).toHaveBeenCalledTimes(1);
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.any(String),
        ['NewCategory']
      );
    });
  });
});
