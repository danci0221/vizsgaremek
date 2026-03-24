import { query, execute } from "../config/db.js";

export async function listFavorites(userId) {
  const rows = await query(
    `SELECT sportlehetoseg_id
     FROM kedvenc
     WHERE felhasznalo_id = ?
     ORDER BY kedvencekbe_tette DESC`,
    [userId]
  );
  return rows.map((row) => Number(row.sportlehetoseg_id));
}

export async function addFavorite(userId, sportId) {
  await execute(
    `INSERT INTO kedvenc (felhasznalo_id, sportlehetoseg_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE kedvencekbe_tette = NOW()`,
    [userId, sportId]
  );
}

export async function removeFavorite(userId, sportId) {
  const result = await execute(
    `DELETE FROM kedvenc
     WHERE felhasznalo_id = ? AND sportlehetoseg_id = ?`,
    [userId, sportId]
  );
  return result.affectedRows > 0;
}

export async function isFavorite(userId, sportId) {
  const rows = await query(
    `SELECT id
     FROM kedvenc
     WHERE felhasznalo_id = ? AND sportlehetoseg_id = ?
     LIMIT 1`,
    [userId, sportId]
  );
  return rows.length > 0;
}
