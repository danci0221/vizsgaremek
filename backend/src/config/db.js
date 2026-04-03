import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3307);
const DB_USER = process.env.DB_USER || "appuser";
const DB_PASSWORD = process.env.DB_PASSWORD || "apppw";
const DB_NAME = process.env.DB_NAME || "sporthub";
const DB_CONNECT_TIMEOUT_MS = Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000);
const DB_WAIT_RETRIES = Number(process.env.DB_WAIT_RETRIES || 15);
const DB_WAIT_DELAY_MS = Number(process.env.DB_WAIT_DELAY_MS || 2000);
const UNKNOWN_SPORT_TYPE = "Ismeretlen";

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: DB_CONNECT_TIMEOUT_MS,
  timezone: "Z",
  dateStrings: true,
  charset: "utf8_hungarian_ci",
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function quoteIdentifier(identifier) {
  return `\`${String(identifier).replace(/`/g, "``")}\``;
}

export async function waitForDatabase() {
  let lastError;

  for (let attempt = 1; attempt <= DB_WAIT_RETRIES; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      lastError = error;
      if (attempt < DB_WAIT_RETRIES) {
        await sleep(DB_WAIT_DELAY_MS);
      }
    }
  }

  throw lastError;
}

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

export async function withTransaction(handler) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await handler(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function tableExists(tableName) {
  const rows = await query(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = ? AND table_name = ?`,
    [DB_NAME, tableName]
  );

  return Number(rows[0]?.count || 0) > 0;
}

async function columnExists(tableName, columnName) {
  const rows = await query(
    `SELECT COUNT(*) AS count
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
    [DB_NAME, tableName, columnName]
  );

  return Number(rows[0]?.count || 0) > 0;
}

async function indexExists(tableName, indexName) {
  const rows = await query(
    `SELECT COUNT(*) AS count
     FROM information_schema.statistics
     WHERE table_schema = ? AND table_name = ? AND index_name = ?`,
    [DB_NAME, tableName, indexName]
  );

  return Number(rows[0]?.count || 0) > 0;
}

async function foreignKeysForColumn(tableName, columnName) {
  return query(
    `SELECT constraint_name AS constraintName
     FROM information_schema.key_column_usage
     WHERE table_schema = ?
       AND table_name = ?
       AND column_name = ?
       AND referenced_table_name IS NOT NULL`,
    [DB_NAME, tableName, columnName]
  );
}

async function ensureColumn(tableName, columnName, definition) {
  if (await columnExists(tableName, columnName)) return false;

  await execute(
    `ALTER TABLE ${quoteIdentifier(tableName)}
     ADD COLUMN ${quoteIdentifier(columnName)} ${definition}`
  );

  return true;
}

async function ensureBaseTables() {
  await execute(`
    CREATE TABLE IF NOT EXISTS felhasznalo (
      id INT PRIMARY KEY AUTO_INCREMENT,
      felhasznalonev VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(150) NOT NULL UNIQUE,
      jelszo_hash VARCHAR(255) NOT NULL,
      szerepkor ENUM('user', 'admin') NOT NULL DEFAULT 'user',
      regisztracio_datum DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      utolso_modositas DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS bejelentkezes (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      felhasznalo_id INT NOT NULL,
      bejelentkezes_idopont DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ip_cim VARCHAR(45),
      sikeres TINYINT(1) NOT NULL DEFAULT 0,
      INDEX idx_bejelentkezes_felhasznalo (felhasznalo_id),
      INDEX idx_bejelentkezes_idopont (bejelentkezes_idopont),
      CONSTRAINT fk_bejelentkezes_felhasznalo
        FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalo (id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS kategoria (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nev VARCHAR(50) NOT NULL UNIQUE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS sportag (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nev VARCHAR(100) NOT NULL UNIQUE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS helyszin (
      id INT PRIMARY KEY AUTO_INCREMENT,
      varos VARCHAR(100) NOT NULL,
      cim VARCHAR(255) NOT NULL,
      lat DECIMAL(10, 7) NULL,
      lng DECIMAL(10, 7) NULL,
      UNIQUE KEY uq_helyszin_varos_cim (varos, cim)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS szervezo (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nev VARCHAR(150) NOT NULL UNIQUE,
      telefon VARCHAR(30),
      email VARCHAR(150),
      weboldal VARCHAR(255)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS sportlehetosegek (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nev VARCHAR(100) NOT NULL,
      sportag_id INT NOT NULL,
      ar INT NOT NULL DEFAULT 0,
      korosztaly_min TINYINT UNSIGNED NULL,
      korosztaly_max TINYINT UNSIGNED NULL,
      megjegyzes TEXT,
      idoszak ENUM('morning', 'afternoon', 'evening', 'weekend') NOT NULL DEFAULT 'morning',
      nyitvatartas VARCHAR(255) NOT NULL,
      kapcsolat VARCHAR(255) NOT NULL,
      kep_url VARCHAR(500) NOT NULL,
      szervezo_id INT NOT NULL,
      helyszin_id INT NOT NULL,
      kategoria_id INT NOT NULL,
      letrehozo_felhasznalo_id INT NULL,
      letrehozas_idopont DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modositva_idopont DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_sportlehetosegek_sportag (sportag_id),
      INDEX idx_sportlehetosegek_szervezo (szervezo_id),
      INDEX idx_sportlehetosegek_helyszin (helyszin_id),
      INDEX idx_sportlehetosegek_kategoria (kategoria_id),
      INDEX idx_sportlehetosegek_letrehozo (letrehozo_felhasznalo_id),
      CONSTRAINT fk_sportlehetosegek_sportag
        FOREIGN KEY (sportag_id) REFERENCES sportag (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fk_sportlehetosegek_szervezo
        FOREIGN KEY (szervezo_id) REFERENCES szervezo (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fk_sportlehetosegek_helyszin
        FOREIGN KEY (helyszin_id) REFERENCES helyszin (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fk_sportlehetosegek_kategoria
        FOREIGN KEY (kategoria_id) REFERENCES kategoria (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fk_sportlehetosegek_letrehozo
        FOREIGN KEY (letrehozo_felhasznalo_id) REFERENCES felhasznalo (id)
        ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS jelentkezes (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      felhasznalo_id INT NOT NULL,
      sportlehetoseg_id INT NOT NULL,
      allapot ENUM('aktiv', 'lemondva') NOT NULL DEFAULT 'aktiv',
      jelentkezes_idopont DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_jelentkezes_felhasznalo_sport (felhasznalo_id, sportlehetoseg_id),
      INDEX idx_jelentkezes_sportlehetoseg (sportlehetoseg_id),
      CONSTRAINT fk_jelentkezes_felhasznalo
        FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalo (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_jelentkezes_sportlehetoseg
        FOREIGN KEY (sportlehetoseg_id) REFERENCES sportlehetosegek (id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS kedvenc (
      felhasznalo_id INT NOT NULL,
      sportlehetoseg_id INT NOT NULL,
      kedvencekbe_tette DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (felhasznalo_id, sportlehetoseg_id),
      INDEX idx_kedvenc_sportlehetoseg (sportlehetoseg_id),
      CONSTRAINT fk_kedvenc_felhasznalo
        FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalo (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_kedvenc_sportlehetoseg
        FOREIGN KEY (sportlehetoseg_id) REFERENCES sportlehetosegek (id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci
  `);
}

async function migrateLegacySportsTable() {
  if (!(await tableExists("sportlehetosegek"))) return false;

  let migrated = false;

  if (!(await columnExists("sportlehetosegek", "sportag_id"))) {
    await execute(`
      ALTER TABLE sportlehetosegek
      ADD COLUMN sportag_id INT NULL AFTER nev
    `);
    migrated = true;
  }

  if (await columnExists("sportlehetosegek", "sport")) {
    await execute(`
      INSERT INTO sportag (nev)
      SELECT DISTINCT TRIM(sport)
      FROM sportlehetosegek
      WHERE sport IS NOT NULL AND TRIM(sport) <> ''
      ON DUPLICATE KEY UPDATE nev = VALUES(nev)
    `);

    await execute(`
      UPDATE sportlehetosegek s
      JOIN sportag sp ON sp.nev = s.sport
      SET s.sportag_id = sp.id
      WHERE s.sportag_id IS NULL
        AND s.sport IS NOT NULL
        AND TRIM(s.sport) <> ''
    `);

    migrated = true;
  }

  await execute(
    `INSERT INTO sportag (nev) VALUES (?) ON DUPLICATE KEY UPDATE nev = VALUES(nev)`,
    [UNKNOWN_SPORT_TYPE]
  );

  await execute(
    `UPDATE sportlehetosegek
     SET sportag_id = (SELECT id FROM sportag WHERE nev = ? LIMIT 1)
     WHERE sportag_id IS NULL`,
    [UNKNOWN_SPORT_TYPE]
  );

  if (await columnExists("sportlehetosegek", "sportag_id")) {
    await execute(`
      ALTER TABLE sportlehetosegek
      MODIFY COLUMN sportag_id INT NOT NULL
    `);
  }

  if (await ensureColumn("sportlehetosegek", "korosztaly_min", "TINYINT UNSIGNED NULL")) {
    migrated = true;
  }

  if (await ensureColumn("sportlehetosegek", "korosztaly_max", "TINYINT UNSIGNED NULL")) {
    migrated = true;
  }

  if (await columnExists("sportlehetosegek", "korosztaly")) {
    await execute(`
      UPDATE sportlehetosegek
      SET korosztaly_min = COALESCE(korosztaly_min, korosztaly),
          korosztaly_max = COALESCE(korosztaly_max, korosztaly)
      WHERE korosztaly IS NOT NULL
    `);

    await execute(`
      ALTER TABLE sportlehetosegek
      DROP COLUMN korosztaly
    `);

    migrated = true;
  }

  if (await ensureColumn("sportlehetosegek", "letrehozo_felhasznalo_id", "INT NULL")) {
    migrated = true;
  }

  if (
    await ensureColumn(
      "sportlehetosegek",
      "letrehozas_idopont",
      "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
    )
  ) {
    migrated = true;
  }

  if (
    await ensureColumn(
      "sportlehetosegek",
      "modositva_idopont",
      "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    )
  ) {
    migrated = true;
  }

  await execute(`
    UPDATE sportlehetosegek
    SET idoszak = 'morning'
    WHERE idoszak IS NULL OR idoszak NOT IN ('morning', 'afternoon', 'evening', 'weekend')
  `);

  await execute(`
    ALTER TABLE sportlehetosegek
    MODIFY COLUMN idoszak ENUM('morning', 'afternoon', 'evening', 'weekend') NOT NULL DEFAULT 'morning'
  `);

  await execute(`
    UPDATE sportlehetosegek
    SET ar = 0
    WHERE ar IS NULL OR ar < 0
  `);

  await execute(`
    ALTER TABLE sportlehetosegek
    MODIFY COLUMN ar INT NOT NULL DEFAULT 0
  `);

  if (await columnExists("sportlehetosegek", "idopont_id")) {
    const legacyForeignKeys = await foreignKeysForColumn("sportlehetosegek", "idopont_id");

    for (const foreignKey of legacyForeignKeys) {
      await execute(`
        ALTER TABLE sportlehetosegek
        DROP FOREIGN KEY ${quoteIdentifier(foreignKey.constraintName)}
      `);
    }

    if (await indexExists("sportlehetosegek", "fk_sport_idopont")) {
      await execute(`
        ALTER TABLE sportlehetosegek
        DROP INDEX fk_sport_idopont
      `);
    }

    await execute(`
      ALTER TABLE sportlehetosegek
      DROP COLUMN idopont_id
    `);

    migrated = true;
  }

  if (await columnExists("sportlehetosegek", "sport")) {
    await execute(`
      ALTER TABLE sportlehetosegek
      DROP COLUMN sport
    `);

    migrated = true;
  }

  if (!(await indexExists("sportlehetosegek", "idx_sportlehetosegek_sportag"))) {
    await execute(`
      ALTER TABLE sportlehetosegek
      ADD INDEX idx_sportlehetosegek_sportag (sportag_id)
    `);
  }

  if (!(await indexExists("sportlehetosegek", "idx_sportlehetosegek_letrehozo"))) {
    await execute(`
      ALTER TABLE sportlehetosegek
      ADD INDEX idx_sportlehetosegek_letrehozo (letrehozo_felhasznalo_id)
    `);
  }

  if ((await foreignKeysForColumn("sportlehetosegek", "sportag_id")).length === 0) {
    await execute(`
      ALTER TABLE sportlehetosegek
      ADD CONSTRAINT fk_sportlehetosegek_sportag
      FOREIGN KEY (sportag_id) REFERENCES sportag (id)
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);
  }

  if ((await foreignKeysForColumn("sportlehetosegek", "letrehozo_felhasznalo_id")).length === 0) {
    await execute(`
      ALTER TABLE sportlehetosegek
      ADD CONSTRAINT fk_sportlehetosegek_letrehozo
      FOREIGN KEY (letrehozo_felhasznalo_id) REFERENCES felhasznalo (id)
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  return migrated;
}

let schemaInitializationPromise = null;

async function ensureSeedData() {
  // Csak akkor hagyjuk ki a seedet, ha már vannak sportlehetőségek.
  const sports = await query("SELECT COUNT(*) as count FROM sportlehetosegek");
  if (Number(sports[0]?.count || 0) > 0) {
    return;
  }

  console.log("Adatbázis üres, seed adatok feltöltése...");

  try {
    const seedPath = path.resolve(__dirname, "../../../db_init/seed.sql");
    const seedSql = fs.readFileSync(seedPath, "utf8");
    const statements = seedSql.split(';').map(stmt => stmt.trim()).filter(stmt => stmt.length > 0);

    await withTransaction(async (connection) => {
      for (const statement of statements) {
        if (statement) {
          await connection.query(statement);
        }
      }
    });

    console.log("Seed adatok sikeresen feltöltve.");
  } catch (error) {
    console.error("Hiba a seed adatok feltöltésekor:", error);
    // Nem dobjuk tovább a hibát, hogy ne álljon le a szerver
  }
}

async function ensureLocationCoordinatesColumns() {
  await ensureColumn("helyszin", "lat", "DECIMAL(10, 7) NULL");
  await ensureColumn("helyszin", "lng", "DECIMAL(10, 7) NULL");
}

async function ensureSingleSportPerLocation() {
  if (!(await tableExists("sportlehetosegek"))) return;

  // Ugyanarra a helyszínre csak a legfrissebb sportlehetőség maradjon.
  await execute(`
    DELETE older
    FROM sportlehetosegek older
    JOIN sportlehetosegek newer
      ON older.helyszin_id = newer.helyszin_id
     AND older.id < newer.id
  `);

  if (!(await indexExists("sportlehetosegek", "uq_sportlehetosegek_helyszin"))) {
    await execute(`
      ALTER TABLE sportlehetosegek
      ADD UNIQUE KEY uq_sportlehetosegek_helyszin (helyszin_id)
    `);
  }
}

export async function ensureDatabaseSchema() {
  if (schemaInitializationPromise) return schemaInitializationPromise;

  schemaInitializationPromise = (async () => {
    await ensureBaseTables();
    await ensureLocationCoordinatesColumns();
    const migrated = await migrateLegacySportsTable();
    await ensureSingleSportPerLocation();
    await ensureSeedData();
    return migrated;
  })();

  try {
    const migrated = await schemaInitializationPromise;
    return migrated;
  } catch (error) {
    schemaInitializationPromise = null;
    throw error;
  }
}

export default pool;
