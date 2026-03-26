import { query, execute, withTransaction } from "../config/db.js";
import { mapRowToSport } from "../utils/mappers.js";

const sportSelectSql = `SELECT
    s.id,
    s.nev,
    sp.nev AS sport,
    s.ar,
    s.megjegyzes,
    s.idoszak,
    s.nyitvatartas,
    s.kapcsolat,
    s.kep_url,
    k.nev AS kategoria,
    h.varos,
    h.cim,
    h.lat,
    h.lng
  FROM sportlehetosegek s
  JOIN sportag sp ON sp.id = s.sportag_id
  JOIN kategoria k ON k.id = s.kategoria_id
  JOIN helyszin h ON h.id = s.helyszin_id`;

export async function listSports() {
  const rows = await query(`${sportSelectSql} ORDER BY s.id DESC`);
  return rows.map(mapRowToSport);
}

export async function getSportById(id) {
  const rows = await query(`${sportSelectSql} WHERE s.id = ? LIMIT 1`, [id]);
  if (rows.length === 0) return null;
  return mapRowToSport(rows[0]);
}

export async function sportExists(sportId) {
  const rows = await query(
    `SELECT id
     FROM sportlehetosegek
     WHERE id = ?
     LIMIT 1`,
    [sportId]
  );
  return rows.length > 0;
}

export async function getOrCreateCategoryId(connection, categoryName) {
  const [foundRows] = await connection.query(
    "SELECT id FROM kategoria WHERE nev = ? LIMIT 1",
    [categoryName]
  );

  if (foundRows.length > 0) return Number(foundRows[0].id);

  const [insertResult] = await connection.execute(
    "INSERT INTO kategoria (nev) VALUES (?)",
    [categoryName]
  );

  return Number(insertResult.insertId);
}

export async function getOrCreateSportTypeId(connection, sportTypeName) {
  const [foundRows] = await connection.query(
    "SELECT id FROM sportag WHERE nev = ? LIMIT 1",
    [sportTypeName]
  );

  if (foundRows.length > 0) return Number(foundRows[0].id);

  const [insertResult] = await connection.execute(
    "INSERT INTO sportag (nev) VALUES (?)",
    [sportTypeName]
  );

  return Number(insertResult.insertId);
}

export async function getOrCreateLocationId(connection, address, city, latitude = null, longitude = null) {
  const [foundRows] = await connection.query(
    "SELECT id FROM helyszin WHERE varos = ? AND cim = ? LIMIT 1",
    [city, address]
  );

  if (foundRows.length > 0) {
    if (latitude !== null || longitude !== null) {
      await connection.execute("UPDATE helyszin SET lat = COALESCE(?, lat), lng = COALESCE(?, lng) WHERE id = ?", [
        latitude,
        longitude,
        foundRows[0].id,
      ]);
    }
    return Number(foundRows[0].id);
  }

  const [insertResult] = await connection.execute(
    "INSERT INTO helyszin (varos, cim, lat, lng) VALUES (?, ?, ?, ?)",
    [city, address, latitude, longitude]
  );

  return Number(insertResult.insertId);
}

export async function getOrCreateOrganizerId(connection, organizerName, phone) {
  const [foundRows] = await connection.query(
    "SELECT id FROM szervezo WHERE nev = ? LIMIT 1",
    [organizerName]
  );

  if (foundRows.length > 0) {
    if (phone) {
      await connection.execute("UPDATE szervezo SET telefon = ? WHERE id = ?", [phone, foundRows[0].id]);
    }
    return Number(foundRows[0].id);
  }

  const [insertResult] = await connection.execute(
    "INSERT INTO szervezo (nev, telefon) VALUES (?, ?)",
    [organizerName, phone || null]
  );

  return Number(insertResult.insertId);
}

export async function createSport(body, creatorUserId = null) {
  return withTransaction(async (connection) => {
    const sportTypeId = await getOrCreateSportTypeId(connection, body.sportType);
    const categoryId = await getOrCreateCategoryId(connection, body.category);
    const locationId = await getOrCreateLocationId(
      connection,
      body.address,
      body.location,
      body.latitude ?? null,
      body.longitude ?? null
    );
    const organizerId = await getOrCreateOrganizerId(connection, `${body.name} szervezo`, body.contact);

    const [sportResult] = await connection.execute(
      `INSERT INTO sportlehetosegek
        (nev, sportag_id, ar, korosztaly_min, korosztaly_max, megjegyzes, szervezo_id, helyszin_id, kategoria_id, idoszak, nyitvatartas, kapcsolat, kep_url, letrehozo_felhasznalo_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        sportTypeId,
        Number(body.price) || 0,
        null,
        null,
        body.description,
        organizerId,
        locationId,
        categoryId,
        body.timeSlot,
        body.openingHours,
        body.contact,
        body.image,
        creatorUserId,
      ]
    );

    const [rows] = await connection.query(`${sportSelectSql} WHERE s.id = ? LIMIT 1`, [
      sportResult.insertId,
    ]);

    return mapRowToSport(rows[0]);
  });
}

export async function updateSport(id, body) {
  return withTransaction(async (connection) => {
    const [existingRows] = await connection.query("SELECT id FROM sportlehetosegek WHERE id = ? LIMIT 1", [id]);

    if (existingRows.length === 0) return null;

    const sportTypeId = await getOrCreateSportTypeId(connection, body.sportType);
    const categoryId = await getOrCreateCategoryId(connection, body.category);
    const locationId = await getOrCreateLocationId(
      connection,
      body.address,
      body.location,
      body.latitude ?? null,
      body.longitude ?? null
    );
    const organizerId = await getOrCreateOrganizerId(connection, `${body.name} szervezo`, body.contact);

    await connection.execute(
      `UPDATE sportlehetosegek
       SET nev = ?, sportag_id = ?, ar = ?, megjegyzes = ?, szervezo_id = ?, helyszin_id = ?,
           kategoria_id = ?, idoszak = ?, nyitvatartas = ?, kapcsolat = ?, kep_url = ?
       WHERE id = ?`,
      [
        body.name,
        sportTypeId,
        Number(body.price) || 0,
        body.description,
        organizerId,
        locationId,
        categoryId,
        body.timeSlot,
        body.openingHours,
        body.contact,
        body.image,
        id,
      ]
    );

    const [rows] = await connection.query(`${sportSelectSql} WHERE s.id = ? LIMIT 1`, [id]);
    if (rows.length === 0) return null;

    return mapRowToSport(rows[0]);
  });
}

export async function deleteSport(id) {
  return withTransaction(async (connection) => {
    const [existingRows] = await connection.query(
      "SELECT id, sportag_id, szervezo_id, helyszin_id, kategoria_id FROM sportlehetosegek WHERE id = ?",
      [id]
    );

    if (existingRows.length === 0) return false;
    const existing = existingRows[0];

    await connection.execute("DELETE FROM sportlehetosegek WHERE id = ?", [id]);

    await connection.execute(
      "DELETE FROM szervezo WHERE id = ? AND NOT EXISTS (SELECT 1 FROM sportlehetosegek WHERE szervezo_id = ?)",
      [existing.szervezo_id, existing.szervezo_id]
    );

    await connection.execute(
      "DELETE FROM helyszin WHERE id = ? AND NOT EXISTS (SELECT 1 FROM sportlehetosegek WHERE helyszin_id = ?)",
      [existing.helyszin_id, existing.helyszin_id]
    );

    await connection.execute(
      "DELETE FROM kategoria WHERE id = ? AND NOT EXISTS (SELECT 1 FROM sportlehetosegek WHERE kategoria_id = ?)",
      [existing.kategoria_id, existing.kategoria_id]
    );

    await connection.execute(
      "DELETE FROM sportag WHERE id = ? AND NOT EXISTS (SELECT 1 FROM sportlehetosegek WHERE sportag_id = ?)",
      [existing.sportag_id, existing.sportag_id]
    );

    return true;
  });
}

export async function searchSports(filters) {
  let sql = sportSelectSql;
  const params = [];

  if (filters.sportType) {
    sql += " WHERE sp.nev LIKE ?";
    params.push(`%${filters.sportType}%`);
  }

  if (filters.category) {
    sql += params.length > 0 ? " AND k.nev LIKE ?" : " WHERE k.nev LIKE ?";
    params.push(`%${filters.category}%`);
  }

  if (filters.city) {
    sql += params.length > 0 ? " AND h.varos LIKE ?" : " WHERE h.varos LIKE ?";
    params.push(`%${filters.city}%`);
  }

  if (filters.timeSlot) {
    sql += params.length > 0 ? " AND s.idoszak = ?" : " WHERE s.idoszak = ?";
    params.push(filters.timeSlot);
  }

  if (filters.maxPrice !== undefined) {
    sql += params.length > 0 ? " AND s.ar <= ?" : " WHERE s.ar <= ?";
    params.push(Number(filters.maxPrice));
  }

  sql += " ORDER BY s.id DESC";

  const rows = await query(sql, params);
  return rows.map(mapRowToSport);
}
