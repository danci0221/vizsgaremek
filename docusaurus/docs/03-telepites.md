---
id: telepites
sidebar_position: 3
title: Telepítés és Futtatás
---

# Rendszerkörnyezet, Telepítés és Konténerizáció

A SportHub platform fejlesztésekor az egyik legfontosabb szempont a **reprodukálható fejlesztői és futtatási környezet** kialakítása volt. A „nálam működik" típusú problémák kiküszöbölésére az adatbázis-réteget teljes egészében **Docker konténerbe** csomagoltuk, míg a backend és a frontend szerverek lokálisan, Node.js segítségével futnak a fejlesztés során. Ez az ún. hibrid megközelítés ötvözi a konténerizáció előnyeit (izolált, determinisztikus adatbázis) a gyors fejlesztői iteráció kényelmével (natív HMR a frontenden és azonnali szerver-újraindítás).

## Előfeltételek

A rendszer futtatásához a következő szoftvereknek kell telepítve lenniük a gazdagépen:

| Szoftver        | Minimális Verzió | Szerepe                                       |
| --------------- | ---------------- | --------------------------------------------- |
| **Node.js**     | 20.x             | A backend és a frontend fejlesztői szerver futtatásához |
| **npm**         | 9.x              | Csomagkezelő a függőségek telepítéséhez         |
| **Docker**      | 24.x             | A MySQL adatbázis konténerizált futtatásához    |
| **Docker Compose** | v2            | A többkonténeres konfiguráció orchestrálásához  |

## A Docker Infrastruktúra

A projekt gyökerében található `docker-compose.yml` fájl definiálja az infrastruktúra konténereit. A platform két Docker szolgáltatást alkalmaz:

### 1. MySQL Adatbázis Konténer (`sporthub_db`)

A `mysql:8.4` hivatalos Docker image-re épül. A konténer indításakor automatikusan létrejön a `sporthub` nevű adatbázis az alábbi konfigurációval:

* **Karakter- és Rendezéskészlet:** `utf8` / `utf8_hungarian_ci` – a magyar ékezetes karakterek és a helyes ábécésorrendű rendezés teljes támogatásához.
* **Perzisztens Adattárolás:** A konténerhez egy named Docker Volume (`sporthub_db_data`) tartozik, ami a `/var/lib/mysql` könyvtárra van csatolva. Ennek köszönhetően a konténer újraindítása vagy újraépítése esetén az adatok megmaradnak.
* **Automatikus Séma Inicializáció:** A `db_init/` mappa tartalma (a `schema.mysql.sql` és a `seed.sql` fájlok) read-only módban van becsatolva (mount) a konténer `/docker-entrypoint-initdb.d/` könyvtárába. A MySQL Docker image alapértelmezés szerint a konténer első indításakor egyszer végrehajtja az ebben a könyvtárban található SQL szkripteket, így az adatbázis sémaszerkezete és a teszt-adatok automatikusan felépülnek.
* **Egészségügyi Ellenőrzés (Healthcheck):** A konténerhez egy beépített `mysqladmin ping` alapú healthcheck tartozik, amely 10 másodpercenként ellenőrzi az adatbázis-szerver válaszkészségét. A többi szolgáltatás csak akkor indul el, ha ez a check sikeresnek jelzi a MySQL-t.

### 2. phpMyAdmin Konténer (`sporthub_phpmyadmin`)

Egy webböngészőből elérhető grafikus felület az adatbázis közvetlen felügyeletéhez. A `http://localhost:8082` címen érhető el, és a belépési adatok:

* **Felhasználónév:** `root`
* **Jelszó:** `rootpw`

A phpMyAdmin függősége (`depends_on`) a `db` konténer `service_healthy` állapota, tehát csak egy teljesen felkészült adatbázis-szerver mellé indul el.

## Az Alkalmazás Elindítása Lépésről Lépésre

### Gyorsindítás (ajánlott módszer)

A teljes rendszer – beleértve az adatbázist, a backend API-t és a frontend fejlesztői szervert – egyetlen paranccsal indítható a projekt gyökérmappájából:

```bash
npm run dev:full
```

Ez a parancs a következő lépéseket hajtja végre a háttérben:

1. **Docker konténerek indítása** (`docker compose up -d db phpmyadmin`): Felhúzza a MySQL és a phpMyAdmin konténereket, ha azok még nem futnak.
2. **Függőségek telepítése** (`npm install` a root, backend és frontend mappákban): A `dev-full.mjs` szkript sorban telepíti a hiányzó npm csomagokat mindhárom projektszinten.
3. **Backend szerver indítása** (`npm --prefix backend run dev`): Elindítja az Express.js API szervert, amely a `http://localhost:3001` porton figyel. A szerver tartalmaz egy beépített retry mechanizmust (`waitForDatabase`), amely legfeljebb 15 alkalommal, 2 másodperces időközönként próbálja meg felvenni a kapcsolatot az adatbázissal.
4. **Frontend fejlesztői szerver indítása** (`npm --prefix Frontend run dev`): Elindítja a Vite fejlesztői szervert, amely a `http://localhost:5173` porton kiszolgálja a React alkalmazást, Hot Module Replacement (HMR) támogatással.

A kiadott konzol üzenetek jelzik a sikeres indulást:

```
📦 Függőségek telepítése a root-ban...
📦 Függőségek telepítése a backend-ben...
📦 Függőségek telepítése a Frontend-ben...
✅ Összes függőség telepítve! Szerverek indítása...
SportHub API fut: http://localhost:3001
```

### Manuális indítási módszer

Ha a fejlesztő a komponenseket egyenként szeretné indítani (például hibakeresés céljából), az alábbi lépéseket kell követnie:

```bash
# 1. Docker konténerek indítása
npm run docker:db:up

# 2. Backend API indítása (külön terminálban)
cd backend
npm install
npm run dev

# 3. Frontend indítása (külön terminálban)
cd Frontend
npm install
npm run dev
```

## Környezeti Változók és Konfiguráció

Az adatbázis-kapcsolat konfigurációját környezeti változók vezérlik, amelyek alapértelmezett értékei a `backend/src/config/db.js` fájlban vannak definiálva:

| Változó               | Alapértelmezett Érték | Jelentés                                          |
| --------------------- | --------------------- | ------------------------------------------------- |
| `DB_HOST`             | `127.0.0.1`           | Az adatbázis-szerver címe                         |
| `DB_PORT`             | `3307`                | A MySQL port a gazdagépen (a Dockerben 3306-ként fut) |
| `DB_USER`             | `appuser`             | Az alkalmazás MySQL felhasználóneve               |
| `DB_PASSWORD`         | `apppw`               | Az alkalmazás MySQL jelszava                      |
| `DB_NAME`             | `sporthub`            | Az adatbázis neve                                 |
| `DB_CONNECT_TIMEOUT_MS` | `10000`            | Kapcsolódási időtúllépés milliszekundumban         |
| `DB_WAIT_RETRIES`     | `15`                  | Hányszor próbálja újra a kapcsolódást induláskor  |
| `DB_WAIT_DELAY_MS`    | `2000`                | Újrapróbálkozások közötti várakozási idő (ms)     |

A biztonsági szemlélet jegyében az érzékeny adatok (jelszavak, titkos kulcsok) nem a forráskódban vagy a `docker-compose.yml` fájlban vannak keményen beégetve éles üzemeltetés során, hanem `.env` fájlokból vagy a futtatási környezet változóiból töltődnek be.

## Hasznos Docker Parancsok

A projekt `package.json` fájljában előre definiált npm szkriptek segítik a Docker konténerek kezelését:

```bash
# Konténerek indítása háttérben
npm run docker:db:up

# Konténerek leállítása (adatok megmaradnak)
npm run docker:db:down

# Konténerek leállítása ÉS az adatbázis volume törlése (teljes reset)
npm run docker:db:reset

# Adatbázis konténer naplóinak élő követése
npm run docker:db:logs
```

A `docker:db:reset` parancs különösen hasznos fejlesztés közben: ha az adatbázis sémáját módosítottuk a `db_init/` mappában, a volume törlése után az újraindítás során a MySQL konténer friss adatokkal inicializálja az adatbázist.

## Portok Összesítése

Az alábbi táblázat összefoglalja, hogy a rendszer egyes komponensei milyen portokon érhetők el:

| Szolgáltatás        | URL                         | Megjegyzés                     |
| ------------------- | --------------------------- | ------------------------------ |
| **Frontend**        | `http://localhost:5173`     | Vite fejlesztői szerver (HMR) |
| **Backend API**     | `http://localhost:3001`     | Express.js REST API            |
| **phpMyAdmin**      | `http://localhost:8082`     | Adatbázis böngésző felület     |
| **MySQL**           | `localhost:3307`            | Közvetlen adatbázis elérés     |
