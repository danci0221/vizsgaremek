import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as favoritesService from '../../src/services/favoritesService.js';
import * as db from '../../src/config/db.js';

vi.mock('../../src/config/db.js');

describe('Favorites Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listFavorites', () => {
    it('Visszaadja a felhasználó kedvenceit', async () => {
      const mockRows = [
        { sportlehetoseg_id: 1 },
        { sportlehetoseg_id: 2 },
        { sportlehetoseg_id: 5 }
      ];

      db.query.mockResolvedValue(mockRows);

      const result = await favoritesService.listFavorites(10);

      expect(result).toEqual([1, 2, 5]);
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [10]
      );
    });

    it('Visszaad üres tömböt, ha nincs kedvenc', async () => {
      db.query.mockResolvedValue([]);

      const result = await favoritesService.listFavorites(10);

      expect(result).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('Hozzáadja az új kedvencet', async () => {
      db.execute.mockResolvedValue({ affectedRows: 1 });

      await favoritesService.addFavorite(10, 5);

      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO kedvenc'),
        [10, 5]
      );
    });

    it('Frissíti a kedvencet, ha már létezik', async () => {
      db.execute.mockResolvedValue({ affectedRows: 2 });

      await favoritesService.addFavorite(10, 5);

      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining('ON DUPLICATE KEY UPDATE'),
        [10, 5]
      );
    });
  });

  describe('removeFavorite', () => {
    it('Eltávolítja a kedvencet', async () => {
      db.execute.mockResolvedValue({ affectedRows: 1 });

      const result = await favoritesService.removeFavorite(10, 5);

      expect(result).toBe(true);
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM kedvenc'),
        [10, 5]
      );
    });

    it('Visszaad hamis értéket, ha a kedvenc nem lett eltávolítva', async () => {
      db.execute.mockResolvedValue({ affectedRows: 0 });

      const result = await favoritesService.removeFavorite(10, 5);

      expect(result).toBe(false);
    });
  });

  describe('isFavorite', () => {
    it('Visszaad igaz értéket, ha a sport kedvenc', async () => {
      db.query.mockResolvedValue([{ id: 1 }]);

      const result = await favoritesService.isFavorite(10, 5);

      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [10, 5]
      );
    });

    it('Visszaad hamis értéket, ha a sport nem kedvenc', async () => {
      db.query.mockResolvedValue([]);

      const result = await favoritesService.isFavorite(10, 5);

      expect(result).toBe(false);
    });
  });
});
