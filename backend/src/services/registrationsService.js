import { query, execute } from "../config/db.js";
import { mapRegistrationRow, mapFullRegistrationRow } from "../utils/mappers.js";
import { toPriceLabel } from "../utils/helpers.js";

export async function listRegistrations(userId) {
  const rows = await query(
    `SELECT
        j.id,
        j.allapot,
        j.jelentkezes_idopont,
        s.id AS sport_id,
        s.nev AS sport_name,
        sp.nev AS sport_type,
        h.varos AS location,
        h.cim AS address,
        s.ar AS price,
        s.idoszak AS time_slot,
        s.nyitvatartas AS opening_hours,
        s.kapcsolat AS contact,
        s.kep_url AS image
     FROM jelentkezes j
     JOIN sportlehetosegek s ON s.id = j.sportlehetoseg_id
     JOIN sportag sp ON sp.id = s.sportag_id
     JOIN helyszin h ON h.id = s.helyszin_id
     WHERE j.felhasznalo_id = ?
     ORDER BY j.jelentkezes_idopont DESC`,
    [userId]
  );

  return rows.map(mapRegistrationRow);
}

export async function createRegistration(userId, sportId) {
  try {
    const existingRows = await query(
      `SELECT id, allapot FROM jelentkezes
       WHERE felhasznalo_id = ? AND sportlehetoseg_id = ?`,
      [userId, sportId]
    );

    if (existingRows.length > 0) {
      const existing = existingRows[0];
      if (existing.allapot === "aktiv") {
        return { error: "Már regisztrált vagy erre a sportra." };
      }

      const result = await execute(
        `UPDATE jelentkezes
         SET allapot = 'aktiv', jelentkezes_idopont = NOW()
         WHERE id = ?`,
        [existing.id]
      );

      if (result.affectedRows === 0) {
        return { error: "Nem sikerült újra jelentkezni." };
      }

      const rows = await query(
        `SELECT
            j.id,
            j.allapot,
            j.jelentkezes_idopont,
            s.id AS sport_id,
            s.nev AS sport_name,
            sp.nev AS sport_type,
            h.varos AS location,
            h.cim AS address,
            s.ar AS price,
            s.idoszak AS time_slot,
            s.nyitvatartas AS opening_hours,
            s.kapcsolat AS contact,
            s.kep_url AS image
         FROM jelentkezes j
         JOIN sportlehetosegek s ON s.id = j.sportlehetoseg_id
         JOIN sportag sp ON sp.id = s.sportag_id
         JOIN helyszin h ON h.id = s.helyszin_id
         WHERE j.id = ?`,
        [existing.id]
      );

      return rows.length === 0 ? null : mapRegistrationRow(rows[0]);
    }

    const result = await execute(
      `INSERT INTO jelentkezes (felhasznalo_id, sportlehetoseg_id, allapot, jelentkezes_idopont)
       VALUES (?, ?, 'aktiv', NOW())`,
      [userId, sportId]
    );

    const rows = await query(
      `SELECT
          j.id,
          j.allapot,
          j.jelentkezes_idopont,
          s.id AS sport_id,
          s.nev AS sport_name,
          sp.nev AS sport_type,
          h.varos AS location,
          h.cim AS address,
          s.ar AS price,
          s.idoszak AS time_slot,
          s.nyitvatartas AS opening_hours,
          s.kapcsolat AS contact,
          s.kep_url AS image
       FROM jelentkezes j
       JOIN sportlehetosegek s ON s.id = j.sportlehetoseg_id
       JOIN sportag sp ON sp.id = s.sportag_id
       JOIN helyszin h ON h.id = s.helyszin_id
       WHERE j.id = ?`,
      [result.insertId]
    );

    if (rows.length === 0) return null;

    return mapRegistrationRow(rows[0]);
  } catch (error) {
    if (error.message.includes("Duplicate entry")) {
      return { error: "Már regisztrált vagy erre a sportra." };
    }
    throw error;
  }
}

export async function cancelRegistration(userId, registrationId) {
  const rows = await query(
    `SELECT id FROM jelentkezes
     WHERE id = ? AND felhasznalo_id = ?`,
    [registrationId, userId]
  );

  if (rows.length === 0) return false;

  const result = await execute(
    `DELETE FROM jelentkezes
     WHERE id = ?`,
    [registrationId]
  );

  return result.affectedRows > 0;
}

export async function getRegistrationById(userId, registrationId) {
  const rows = await query(
    `SELECT
        j.id,
        j.allapot,
        j.jelentkezes_idopont,
        s.id AS sport_id,
        s.nev AS sport_name,
        sp.nev AS sport_type,
        h.varos AS location,
        h.cim AS address,
        s.ar AS price,
        s.idoszak AS time_slot,
        s.nyitvatartas AS opening_hours,
        s.kapcsolat AS contact,
        s.kep_url AS image
     FROM jelentkezes j
     JOIN sportlehetosegek s ON s.id = j.sportlehetoseg_id
     JOIN sportag sp ON sp.id = s.sportag_id
     JOIN helyszin h ON h.id = s.helyszin_id
     WHERE j.id = ? AND j.felhasznalo_id = ?`,
    [registrationId, userId]
  );

  if (rows.length === 0) return null;
  return mapRegistrationRow(rows[0]);
}

export async function listAllRegistrations() {
  const rows = await query(
    `SELECT
        j.id,
        j.allapot,
        j.jelentkezes_idopont,
        u.id AS user_id,
        u.felhasznalonev AS username,
        u.email,
        s.id AS sport_id,
        s.nev AS sport_name,
        sp.nev AS sport_type,
        h.varos AS location,
        h.cim AS address,
        s.ar AS price,
        s.idoszak AS time_slot,
        s.nyitvatartas AS opening_hours,
        s.kapcsolat AS contact,
        s.kep_url AS image
     FROM jelentkezes j
     JOIN felhasznalo u ON u.id = j.felhasznalo_id
     JOIN sportlehetosegek s ON s.id = j.sportlehetoseg_id
     JOIN sportag sp ON sp.id = s.sportag_id
     JOIN helyszin h ON h.id = s.helyszin_id
     ORDER BY j.jelentkezes_idopont DESC`
  );

  return rows.map(mapFullRegistrationRow);
}

export async function getRegistrationStats() {
  const rows = await query(
    `SELECT
        COUNT(*) as total_registrations,
        SUM(CASE WHEN allapot = 'aktiv' THEN 1 ELSE 0 END) as active_registrations
     FROM jelentkezes`
  );

  return rows[0] || { total_registrations: 0, active_registrations: 0 };
}
