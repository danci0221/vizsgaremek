SET NAMES utf8 COLLATE utf8_hungarian_ci;
SET CHARACTER SET utf8;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS kedvenc;
DROP TABLE IF EXISTS jelentkezes;
DROP TABLE IF EXISTS jelentkezesek;
DROP TABLE IF EXISTS bejelentkezes;
DROP TABLE IF EXISTS sportlehetosegek;
DROP TABLE IF EXISTS idopont;
DROP TABLE IF EXISTS sportag;
DROP TABLE IF EXISTS kategoria;
DROP TABLE IF EXISTS szervezo;
DROP TABLE IF EXISTS helyszin;
DROP TABLE IF EXISTS felhasznalo;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS felhasznalo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  felhasznalonev VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  jelszo_hash VARCHAR(255) NOT NULL,
  szerepkor ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  regisztracio_datum DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  utolso_modositas DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci;

CREATE TABLE IF NOT EXISTS bejelentkezes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  felhasznalo_id INT NOT NULL,
  bejelentkezes_idopont DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_cim VARCHAR(45),
  sikeres TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_bejelentkezes_felhasznalo (felhasznalo_id),
  INDEX idx_bejelentkezes_idopont (bejelentkezes_idopont),
  CONSTRAINT fk_bejelentkezes_felhasznalo FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalo (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci;

CREATE TABLE IF NOT EXISTS kategoria (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nev VARCHAR(50) NOT NULL UNIQUE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci;

CREATE TABLE IF NOT EXISTS sportag (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nev VARCHAR(100) NOT NULL UNIQUE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci;

CREATE TABLE IF NOT EXISTS helyszin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  varos VARCHAR(100) NOT NULL,
  cim VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_helyszin_varos_cim (varos, cim)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci;

CREATE TABLE IF NOT EXISTS szervezo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nev VARCHAR(150) NOT NULL UNIQUE,
  telefon VARCHAR(30),
  email VARCHAR(150),
  weboldal VARCHAR(255)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci;

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
  CONSTRAINT ck_sportlehetosegek_ar CHECK (ar >= 0),
  CONSTRAINT ck_sportlehetosegek_korosztaly CHECK (
    korosztaly_min IS NULL
    OR korosztaly_max IS NULL
    OR korosztaly_min <= korosztaly_max
  ),
  CONSTRAINT fk_sportlehetosegek_sportag FOREIGN KEY (sportag_id) REFERENCES sportag (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_sportlehetosegek_szervezo FOREIGN KEY (szervezo_id) REFERENCES szervezo (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_sportlehetosegek_helyszin FOREIGN KEY (helyszin_id) REFERENCES helyszin (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_sportlehetosegek_kategoria FOREIGN KEY (kategoria_id) REFERENCES kategoria (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_sportlehetosegek_letrehozo FOREIGN KEY (letrehozo_felhasznalo_id) REFERENCES felhasznalo (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci;

CREATE TABLE IF NOT EXISTS jelentkezes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  felhasznalo_id INT NOT NULL,
  sportlehetoseg_id INT NOT NULL,
  allapot ENUM('aktiv', 'lemondva') NOT NULL DEFAULT 'aktiv',
  jelentkezes_idopont DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_jelentkezes_felhasznalo_sport (felhasznalo_id, sportlehetoseg_id),
  INDEX idx_jelentkezes_sportlehetoseg (sportlehetoseg_id),
  CONSTRAINT fk_jelentkezes_felhasznalo FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalo (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_jelentkezes_sportlehetoseg FOREIGN KEY (sportlehetoseg_id) REFERENCES sportlehetosegek (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci;

CREATE TABLE IF NOT EXISTS kedvenc (
  felhasznalo_id INT NOT NULL,
  sportlehetoseg_id INT NOT NULL,
  kedvencekbe_tette DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (felhasznalo_id, sportlehetoseg_id),
  INDEX idx_kedvenc_sportlehetoseg (sportlehetoseg_id),
  CONSTRAINT fk_kedvenc_felhasznalo FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalo (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_kedvenc_sportlehetoseg FOREIGN KEY (sportlehetoseg_id) REFERENCES sportlehetosegek (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8 COLLATE = utf8_hungarian_ci;
