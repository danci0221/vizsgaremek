---
id: adatbazis
sidebar_position: 5
title: Adatbázis Felépítése
---

# Adatbázis Felépítése, Relációs Modell és Adatintegritás

A SportHub adatbázisa a platform teljes üzleti logikájának alapja: itt tárolódnak a felhasználói fiókok, a sportolási lehetőségek részletes adatai, a kedvencek, a jelentkezések és a bejelentkezési előzmények. A rendszert egy **MySQL 8.4** relációs adatbázis-kezelő (RDBMS) szolgálja ki, amely az **InnoDB** tárolómotort használja a tranzakcióbiztonság (ACID garanciák) és az idegen kulcsos hivatkozási integritás érdekében.

A tervezés során a **Harmadik Normálformát (3NF)** alkalmaztuk, hogy minimalizáljuk az adatredundanciát és biztosítsuk az adatok konzisztenciáját frissítési, törlési és beszúrási műveletek során. Az `utf8` karakterkészlet és az `utf8_hungarian_ci` összerendezés (collation) gondoskodik a magyar speciális karakterek helyes kezeléséről és az ábécésorrend szerinti rendezésről.

## Az Adatbázis Elérése

A rendszer indítása után az adatbázis az alábbi módon érhető el:

**phpMyAdmin (Web Interface):**
- URL: `http://localhost:8082`
- Felhasználónév: `root`
- Jelszó: `rootpw`

**Közvetlen MySQL kapcsolat:**
- Host: `127.0.0.1`
- Port: `3307`
- Felhasználó: `appuser` / Jelszó: `apppw`
- Adatbázis: `sporthub`

## Táblák és Relációs Modell

Az adatbázis összesen **8 táblából** áll, amelyek jól definiált idegen kulcsokkal (Foreign Keys) és egyedi korlátozásokkal (UNIQUE constraints) kapcsolódnak egymáshoz. A táblákat négy logikai csoportba sorolhatjuk:

### 1. Felhasználókezelés és Autentikáció

#### `felhasznalo` – A Platform Felhasználói

A `felhasznalo` tábla a rendszer legfontosabb entitása, az összes többi tábla közvetve vagy közvetlenül erre hivatkozik.

| Oszlop | Típus | Szabály | Leírás |
| ------ | ----- | ------- | ------ |
| `id` | INT, PK, AUTO_INCREMENT | Kötelező | Egyedi azonosító |
| `felhasznalonev` | VARCHAR(50) | NOT NULL, UNIQUE | Egyedi felhasználónév |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | Egyedi email cím |
| `jelszo_hash` | VARCHAR(255) | NOT NULL | scrypt hash (`salt:hash` formátumban) |
| `szerepkor` | ENUM('user','admin') | DEFAULT 'user' | Hozzáférési szint |
| `regisztracio_datum` | DATETIME | DEFAULT CURRENT_TIMESTAMP | A fiók létrehozásának időpontja |
| `utolso_modositas` | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Utolsó módosítás időbélyege |

A `felhasznalonev` és az `email` mezők UNIQUE constraint-tel biztosítják, hogy ne lehessen duplikált fiókot létrehozni. A `szerepkor` ENUM típusa csak a 'user' és 'admin' értékeket engedi, megakadályozva az érvénytelen szerepkörök bekerülését az adatbázisba.

#### `bejelentkezes` – Belépési Előzmények

Ez a tábla auditálási célokat szolgál: minden bejelentkezési kísérletet (sikeres és sikertelen egyaránt) naplóz.

| Oszlop | Típus | Leírás |
| ------ | ----- | ------ |
| `id` | BIGINT, PK, AUTO_INCREMENT | Egyedi azonosító |
| `felhasznalo_id` | INT, FK → `felhasznalo.id` | A kísérletet végrehajtó felhasználó |
| `bejelentkezes_idopont` | DATETIME | A kísérlet időbélyege |
| `ip_cim` | VARCHAR(45) | A kliens IP-címe (IPv4/IPv6 támogatás) |
| `sikeres` | TINYINT(1) | 1 = sikeres, 0 = sikertelen |

Az `ON DELETE CASCADE` szabály garantálja, hogy ha egy felhasználói fiók törlődik, a hozzá tartozó bejelentkezési naplóbejegyzések is automatikusan eltávolításra kerülnek, megőrizve a hivatkozási integritást. A `felhasznalo_id` és `bejelentkezes_idopont` oszlopokra indexek (`INDEX`) épülnek a gyors lekérdezhetőség érdekében.

### 2. Sport Referencia-adatok (Lookup Tables)

A normalizáció egyik kulcsa a többször ismétlődő szöveges adatok kiszervezése külön referencia-táblákba. Ez nem csak helyet takarít meg, hanem biztosítja a konzisztenciát is: ha egy sportág nevét át kell nevezni, azt egyetlen helyen kell módosítani.

#### `kategoria` – Sporthelyszín Típusok
| Oszlop | Típus | Leírás |
| ------ | ----- | ------ |
| `id` | INT, PK | Egyedi azonosító |
| `nev` | VARCHAR(50), UNIQUE | Kategória neve (pl. Edzőterem, Pálya, Uszoda, Stúdió, Sportesemény) |

#### `sportag` – Sportág Megnevezések
| Oszlop | Típus | Leírás |
| ------ | ----- | ------ |
| `id` | INT, PK | Egyedi azonosító |
| `nev` | VARCHAR(100), UNIQUE | Sportág neve (pl. Úszás, Konditerem, Futás, Tenisz, Jóga) |

#### `helyszin` – Fizikai Lokációk
| Oszlop | Típus | Leírás |
| ------ | ----- | ------ |
| `id` | INT, PK | Egyedi azonosító |
| `varos` | VARCHAR(100) | A település neve |
| `cim` | VARCHAR(255) | Pontos utca/házszám cím |
| `lat` | DECIMAL(10,7), NULL | GPS szélességi koordináta (a térkép modulhoz) |
| `lng` | DECIMAL(10,7), NULL | GPS hosszúsági koordináta |

A `varos` és `cim` mezők együttes UNIQUE KEY-e biztosítja, hogy ugyanaz a cím ne kerüljön be kétszer az adatbázisba. A `lat` és `lng` koordináták nullable-ök, mivel nem minden helyszínhez áll rendelkezésre pontos GPS adat.

#### `szervezo` – Sportszervezők, Klubok, Egyesületek
| Oszlop | Típus | Leírás |
| ------ | ----- | ------ |
| `id` | INT, PK | Egyedi azonosító |
| `nev` | VARCHAR(150), UNIQUE | Szervező neve |
| `telefon` | VARCHAR(30), NULL | Kapcsolattartási telefonszám |
| `email` | VARCHAR(150), NULL | Kapcsolattartási email |
| `weboldal` | VARCHAR(255), NULL | Weboldal URL |

### 3. A Központi Entitás: Sportolási Lehetőségek

#### `sportlehetosegek` – A Katalógus Fő Táblája

Ez a tábla a rendszer szíve: itt él az összes sportprogram, amelyet a felhasználók böngészhetnek, szűrhetnek és amelyekre jelentkezhetnek. Minden sportlehetőség egy sportághoz, egy kategóriához, egy helyszínhez és egy szervezőhöz kötődik idegen kulcsokon keresztül.

| Oszlop | Típus | Leírás |
| ------ | ----- | ------ |
| `id` | INT, PK, AUTO_INCREMENT | Egyedi azonosító |
| `nev` | VARCHAR(100) | A sportlehetőség megnevezése |
| `sportag_id` | INT, FK → `sportag.id` | A kapcsolódó sportág |
| `ar` | INT, DEFAULT 0 | Ár Ft-ban (0 = ingyenes) |
| `korosztaly_min` | TINYINT UNSIGNED, NULL | Minimális korosztályi ajánlás |
| `korosztaly_max` | TINYINT UNSIGNED, NULL | Maximális korosztályi ajánlás |
| `megjegyzes` | TEXT | Szöveges leírás, részletek |
| `idoszak` | ENUM('morning','afternoon','evening','weekend') | Napszak kategória |
| `nyitvatartas` | VARCHAR(255) | Emberi olvasásra szánt nyitvatartási ütemterv |
| `kapcsolat` | VARCHAR(255) | Elérhetőségi információ |
| `kep_url` | VARCHAR(500) | Borítókép URL (Unsplash vagy egyéb forrás) |
| `szervezo_id` | INT, FK → `szervezo.id` | A szervező entitás |
| `helyszin_id` | INT, FK → `helyszin.id` | A fizikai helyszín |
| `kategoria_id` | INT, FK → `kategoria.id` | A helyszín típus kategória |
| `letrehozo_felhasznalo_id` | INT, FK → `felhasznalo.id`, NULL | Az adminisztrátor, aki feltöltötte |
| `letrehozas_idopont` | DATETIME | Rekord létrehozásának ideje |
| `modositva_idopont` | DATETIME | Utolsó módosítás ideje |

**CHECK constraint-ek:**
- `ck_sportlehetosegek_ar`: Az ár nem lehet negatív (`ar >= 0`).
- `ck_sportlehetosegek_korosztaly`: A minimális korosztály nem lehet nagyobb a maximálisnál.

**Idegen kulcs viselkedések:**
- `sportag_id`, `szervezo_id`, `helyszin_id`, `kategoria_id`: `ON DELETE RESTRICT` – nem törölhető egy sportág, szervező, helyszín vagy kategória, ha van hozzá kapcsolódó sportlehetőség. Ez megakadályozza az árva rekordok keletkezését.
- `letrehozo_felhasznalo_id`: `ON DELETE SET NULL` – ha a feltöltő admin fiók törlődik, a sportlehetőség megmarad, de a feltöltő referencia NULL-ra áll át.

### 4. Felhasználói Interakciók

#### `kedvenc` – Kedvencek Lista (N:M Kapcsolat)

Klasszikus kapcsolótábla, amely a felhasználókat és a sportlehetőségeket köti össze egy „kedvenc" relációval. A kompozit elsődleges kulcs (`felhasznalo_id`, `sportlehetoseg_id`) biztosítja, hogy egy felhasználó egy sportot csak egyszer jelölhessen kedvencként.

| Oszlop | Típus | Leírás |
| ------ | ----- | ------ |
| `felhasznalo_id` | INT, PK, FK → `felhasznalo.id` | A felhasználó |
| `sportlehetoseg_id` | INT, PK, FK → `sportlehetosegek.id` | A kedvenc sport |
| `kedvencekbe_tette` | DATETIME | A kedvencekbe vétel időpontja |

#### `jelentkezes` – Jelentkezések Sportokra

A jelentkezések rendszerének adatbázis-rétege. Egy felhasználó egy sportra egyszer jelentkezhet (UNIQUE KEY), de a jelentkezés állapota változhat.

| Oszlop | Típus | Leírás |
| ------ | ----- | ------ |
| `id` | BIGINT, PK, AUTO_INCREMENT | Egyedi azonosító |
| `felhasznalo_id` | INT, FK → `felhasznalo.id` | A jelentkező |
| `sportlehetoseg_id` | INT, FK → `sportlehetosegek.id` | A sport |
| `allapot` | ENUM('aktiv','lemondva') | Jelentkezés állapota |
| `jelentkezes_idopont` | DATETIME | A jelentkezés időbélyege |

Az `allapot` mező nem törlődik fizikailag, hanem „soft delete" logikát követ: lemondás esetén az állapot 'lemondva'-ra változik, megőrizve a történeti nyomkövethetőséget.

## Seed Adatok

A `db_init/seed.sql` fájl tartalmazza a fejlesztői és tesztelői környezethez szükséges kiindulási adatokat:

* **5 kategória:** Edzőterem, Pálya, Uszoda, Sportesemény, Stúdió
* **5 sportág:** Úszás, Konditerem, Futás, Tenisz, Jóga
* **29 helyszín:** Budapesttől Salgótarjánig, GPS koordinátákkal a térkép modulhoz
* **5 szervező:** AquaFit SE, CityRun Klub, Prime Tenisz Kft, Urban Gym, Flow Studio
* **2 felhasználói fiók:** Egy admin (`admin@sporthub.hu`) és egy sima felhasználó (`user@sporthub.hu`)
* **35+ sportlehetőség:** Különböző sportágak, napszakok, városok és árkategóriák változatos kombinációját fedik le

:::info Tesztelési Belépési Adatok
- **Admin fiók:** `admin@sporthub.hu` / `admin`
- **Felhasználói fiók:** `user@sporthub.hu` / `user`
:::
