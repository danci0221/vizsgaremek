import { query } from "../config/db.js";
import { mapAdminUserRow, mapCategoryRow, mapSportTypeRow, mapLocationRow, mapOrganizerRow } from "../utils/mappers.js";

export async function listUsersForAdmin() {
  const rows = await query(
    `SELECT
        u.id,
        u.felhasznalonev,
        u.email,
        u.regisztracio_datum,
        COALESCE(u.szerepkor, 'user') AS szerepkor,
        COALESCE(s.login_count, 0) AS login_count,
        s.last_successful_login
     FROM felhasznalo u
     LEFT JOIN (
        SELECT
          felhasznalo_id,
          COUNT(*) AS login_count,
          MAX(CASE WHEN sikeres = 1 THEN bejelentkezes_idopont END) AS last_successful_login
        FROM bejelentkezes
        GROUP BY felhasznalo_id
     ) s ON s.felhasznalo_id = u.id
     ORDER BY u.id DESC`
  );

  return rows.map(mapAdminUserRow);
}

export async function listCategories() {
  const rows = await query(`SELECT id, nev FROM kategoria ORDER BY nev ASC`);
  return rows.map(mapCategoryRow);
}

export async function listSportTypes() {
  const rows = await query(`SELECT id, nev FROM sportag ORDER BY nev ASC`);
  return rows.map(mapSportTypeRow);
}

export async function listLocations() {
  const rows = await query(`SELECT id, varos, cim FROM helyszin ORDER BY varos ASC, cim ASC`);
  return rows.map(mapLocationRow);
}

export async function listOrganizers() {
  const rows = await query(
    `SELECT id, nev, telefon, email, weboldal FROM szervezo ORDER BY nev ASC`
  );
  return rows.map(mapOrganizerRow);
}

export async function getAdminStats() {
  const userStats = await query(
    `SELECT COUNT(*) as total_users FROM felhasznalo`
  );

  const sportsStats = await query(
    `SELECT COUNT(*) as total_sports FROM sportlehetosegek`
  );

  const registrationStats = await query(
    `SELECT
        COUNT(*) as total_registrations,
        SUM(CASE WHEN allapot = 'aktiv' THEN 1 ELSE 0 END) as active_registrations
     FROM jelentkezes`
  );

  return {
    totalUsers: Number(userStats[0]?.total_users || 0),
    totalSports: Number(sportsStats[0]?.total_sports || 0),
    totalRegistrations: Number(registrationStats[0]?.total_registrations || 0),
    activeRegistrations: Number(registrationStats[0]?.active_registrations || 0),
  };
}
