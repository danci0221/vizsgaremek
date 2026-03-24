import { query, execute } from "../config/db.js";
import { mapUserRowToProfile, isAdminAllowlistEnabled, isEmailInAdminAllowlist } from "../utils/mappers.js";
import { hashPassword, verifyPassword, normalizeEmail } from "../utils/helpers.js";

export async function isEmailTaken(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;

  const rows = await query(
    `SELECT id
     FROM felhasznalo
     WHERE lower(email) = lower(?)
     LIMIT 1`,
    [normalized]
  );

  return rows.length > 0;
}

export async function insertLoginEvent(userId, ipAddress, success) {
  await execute(
    `INSERT INTO bejelentkezes (felhasznalo_id, bejelentkezes_idopont, ip_cim, sikeres)
     VALUES (?, NOW(), ?, ?)`,
    [userId, ipAddress || null, success ? 1 : 0]
  );
}

export async function registerUser(body) {
  const username = String(body.username || "").trim();
  const email = normalizeEmail(body.email);
  const passwordHash = hashPassword(String(body.password || ""));

  const existing = await query(
    `SELECT id
     FROM felhasznalo
     WHERE lower(email) = lower(?) OR lower(felhasznalonev) = lower(?)
     LIMIT 1`,
    [email, username]
  );

  if (existing.length > 0) return { error: "Ez az email vagy felhasználónév már foglalt." };

  const insertResult = await execute(
    `INSERT INTO felhasznalo (felhasznalonev, email, jelszo_hash, regisztracio_datum, szerepkor)
     VALUES (?, ?, ?, NOW(), ?)`,
    [username, email, passwordHash, "user"]
  );

  const userRows = await query(
    `SELECT id, felhasznalonev, email, regisztracio_datum, szerepkor
     FROM felhasznalo
     WHERE id = ?
     LIMIT 1`,
    [insertResult.insertId]
  );

  const user = userRows[0];
  await insertLoginEvent(user.id, null, true);

  return { user: mapUserRowToProfile(user) };
}

export async function signInUser(body, ipAddress) {
  const identifier = String(body.identifier || "").trim();
  const password = String(body.password || "");

  const rows = await query(
    `SELECT id, felhasznalonev, email, jelszo_hash, regisztracio_datum, szerepkor
     FROM felhasznalo
     WHERE lower(email) = lower(?) OR lower(felhasznalonev) = lower(?)
     LIMIT 1`,
    [identifier, identifier]
  );

  const user = rows[0];
  if (!user) return { error: "Hibás bejelentkezési adatok." };

  const passwordOk = verifyPassword(password, user.jelszo_hash);
  await insertLoginEvent(user.id, ipAddress, passwordOk);

  if (!passwordOk) return { error: "Hibás bejelentkezési adatok." };
  return { user: mapUserRowToProfile(user) };
}

export async function isAdminEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;

  if (isAdminAllowlistEnabled()) {
    return isEmailInAdminAllowlist(normalized);
  }

  const rows = await query(
    `SELECT id
     FROM felhasznalo
     WHERE lower(email) = lower(?) AND lower(COALESCE(szerepkor, '')) = 'admin'
     LIMIT 1`,
    [normalized]
  );

  return rows.length > 0;
}

export async function findUserIdByEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return null;

  const rows = await query(
    `SELECT id
     FROM felhasznalo
     WHERE lower(email) = lower(?)
     LIMIT 1`,
    [normalized]
  );

  if (rows.length === 0) return null;
  return Number(rows[0].id);
}
