---
id: backend-api
sidebar_position: 6
title: Backend és API
---

# Backend Szerver, REST API és Üzleti Logika

A SportHub szerveroldala egy **Node.js** futtatókörnyezetben, az **Express.js 4.x** keretrendszerre épülő RESTful API. A backend felelős a kéréskezelésért, a bemeneti validációért, az adattranszformációért, a kriptográfiai műveletekért és a MySQL adatbázissal történő kommunikációért. A szerver strict moduláris felépítésű: a Routes → Services → Utils rétegezés garantálja, hogy minden kódrészlet egyetlen, jól definiált feladatot lát el.

## Szerverindítás és Middleware Lánc

A belépési pont az `src/app.js` fájl, amely inicializálja az Express alkalmazást, regisztrálja a middleware-eket, majd az adatbázis-kapcsolat sikeres felépülése után elindítja a HTTP szervert a `3001`-es porton.

### Alkalmazott Middleware-ek

```javascript
app.use(helmet());                      // HTTP biztonsági fejlécek
app.use(cors({ origin: '*', ... }));    // Cross-Origin engedélyezés
app.use(morgan('dev'));                 // HTTP kérés-naplózás (fejlesztői mód)
app.use(express.json({ limit: '50mb' }));       // JSON body parser
app.use(express.urlencoded({ limit: '50mb' })); // URL-encoded body parser
```

* **Helmet:** Automatikusan beállítja a `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options` és egyéb biztonsági HTTP fejléceket, védelmet nyújtva a XSS, clickjacking és MIME-sniffing támadások ellen.
* **CORS:** Engedélyezi a Cross-Origin kéréseket a frontend Vite szerver (`localhost:5173`) felől. A fejlesztési fázisban az `origin: '*'` beállítás van érvényben, éles üzemben ez a konkrét domain-re szűkítendő.
* **Morgan:** Minden beérkező HTTP kérést naplóz a konzolra (`GET /api/sports 200 12ms`), megkönnyítve a hibakeresést fejlesztés közben.
* **Body Parser:** A JSON és URL-encoded kérések deszerializálása. Az 50 MB-os limit a nagyméretű sport adatlapok (képekkel és hosszú leírásokkal) kezelését teszi lehetővé.

### Health Check Végpont

```
GET /api/health → { "ok": true }
```

A Docker healthcheck, a monitoring és a frontend „szerver elérhető-e?" ellenőrzéshez használt egyszerű végpont, amely az alkalmazás alapvető működőképességét jelzi.

## Útválasztás (Routing) – A Catch-All Handler

A SportHub backend egy szokatlan, de hatékony útválasztási megoldást alkalmaz: a hagyományos Express Router helyett egyetlen `app.all('*')` catch-all handler fogja el az összes beérkező kérést, és a `req.path` alapján a megfelelő domén-specifikus handler függvénybe delegálja. Minden handler egy boolean-t ad vissza: ha `false`-szal tér vissza, az azt jelenti, hogy nem tudta kezelni a kérést, és a rendszer továbblép a következő domén-handlere.

```javascript
app.all('*', async (req, res) => {
  if (req.path.startsWith('/api/auth')) {
    handled = await handleAuthRoutes(req, res, req.path, fullUrl);
    if (handled !== false) return;
  }
  if (req.path.startsWith('/api/sports')) { ... }
  if (req.path.startsWith('/api/favorites')) { ... }
  if (req.path.startsWith('/api/registrations')) { ... }
  if (req.path.startsWith('/api/admin')) { ... }

  res.status(404).json({ message: 'Végpont nem található.' });
});
```

## API Végpontok Részletes Dokumentációja

### Autentikációs Végpontok (`/api/auth`)

| Metódus | Útvonal | Leírás |
| ------- | ------- | ------ |
| `GET` | `/api/auth/check-email?email=...` | Ellenőrzi, hogy egy email cím már foglalt-e (regisztrációs űrlap valós idejű validáció) |
| `POST` | `/api/auth/signup` | Új felhasználó regisztrálása |
| `POST` | `/api/auth/signin` | Bejelentkezés felhasználónévvel vagy email-lel |

**Regisztrációs Folyamat részletei (POST `/api/auth/signup`):**

1. A `validators.js` ellenőrzi a payload-ot: a felhasználónév minimum 3 karakter, az email formátuma érvényes, a jelszó minimum 6 karakter.
2. Az `authService.registerUser()` ellenőrzi, hogy az email vagy felhasználónév nem foglalt-e (`SELECT ... WHERE lower(email) = lower(?) OR lower(felhasznalonev) = lower(?)`).
3. A `helpers.hashPassword()` elvégzi a jelszó kriptográfiai titkosítását: 16 bájt randomBytes salt + `scryptSync` 64 bájtos derived key. Az eredmény `salt:hash` formátumban tárolódik.
4. Az `INSERT` művelet létrehozza a felhasználói rekordot, és egy bejelentkezési naplóbejegyzés is keletkezik (`insertLoginEvent`).
5. A válasz a `mapUserRowToProfile()` mapper-en átesett felhasználói profilt tartalmazza (id, username, email, role, registeredAt).

**Bejelentkezés részletei (POST `/api/auth/signin`):**

1. A rendszer felhasználónév VAGY email alapján keres a `felhasznalo` táblában (case-insensitive).
2. A `helpers.verifyPassword()` a `scryptSync` + `timingSafeEqual` kombinációjával ellenőrzi a jelszót. A `timingSafeEqual` használata kritikus: megakadályozza, hogy egy támadó az összehasonlítás időtartamából következtessen a jelszó helyességére (timing attack prevenció).
3. Sikertelen kísérlet esetén is naplóbejegyzés keletkezik (auditálás), majd `401 Unauthorized` válasz megy vissza.

### Sportkatalógus Végpontok (`/api/sports`)

| Metódus | Útvonal | Leírás |
| ------- | ------- | ------ |
| `GET` | `/api/sports` | Az összes sportlehetőség listázása (JOIN sportag, kategoria, helyszin) |
| `GET` | `/api/sports/:id` | Egyetlen sport részletes adatai |
| `POST` | `/api/sports` | Új sportlehetőség létrehozása (admin-protected) |
| `PUT` | `/api/sports/:id` | Meglévő sport frissítése (admin-protected) |
| `DELETE` | `/api/sports/:id` | Sport törlése (admin-protected) |

A `listSports()` Service függvény egy komplex, négy táblát érintő JOIN lekérdezést hajt végre, amely a sportlehetőség mellé csatolja a sportág nevét, a kategória nevét, a helyszín adatait (város, cím, GPS koordináták) és a szervező információit. Az eredmény sorok a `mapRowToSport()` mapper-en keresztül alakulnak a frontend által várt formátumra.

A `createSport()` és `updateSport()` függvények **adatbázis-tranzakciókat** használnak (`withTransaction`), biztosítva, hogy a több táblát érintő műveletek (pl. új sportág/kategória/helyszín/szervező létrehozása, majd a sportlehetőség beszúrása) atomi egységként hajtódjanak végre. Ha bármelyik lépésben hiba történik, a teljes művelet visszagörgetődik (rollback).

### Kedvencek Végpontok (`/api/favorites`)

| Metódus | Útvonal | Leírás |
| ------- | ------- | ------ |
| `GET` | `/api/favorites` | A bejelentkezett felhasználó kedvenceinek listázása |
| `POST` | `/api/favorites/sync` | Kedvencek szinkronizálása (localStorage → szerver) |
| `POST` | `/api/favorites/toggle` | Egy sport hozzáadása/eltávolítása a kedvencekből |
| `DELETE` | `/api/favorites` | Összes kedvenc törlése |

A kedvencek rendszere egy kifinomult szinkronizálási logikát implementál: a frontend a `localStorage`-ban is tárolja a kedvenceket (offline elérhetőség), majd bejelentkezéskor a `sync` végponton keresztül összehangolja a lokális és a szerveren tárolt adatokat.

### Jelentkezések Végpontok (`/api/registrations`)

| Metódus | Útvonal | Leírás |
| ------- | ------- | ------ |
| `GET` | `/api/registrations` | A felhasználó aktív jelentkezéseinek listázása |
| `POST` | `/api/registrations` | Jelentkezés egy sportra |
| `DELETE` | `/api/registrations/:sportId` | Jelentkezés lemondása |

A jelentkezési rendszer duplikáció-védelemmel rendelkezik: a `UNIQUE KEY uq_jelentkezes_felhasznalo_sport` megakadályozza, hogy egy felhasználó kétszer jelentkezzen ugyanarra a sportra. Lemondás esetén a rekord nem törlődik fizikailag, hanem az állapota `lemondva`-ra változik (soft delete), lehetővé téve az újbóli jelentkezést.

### Adminisztrációs Végpontok (`/api/admin`)

| Metódus | Útvonal | Leírás |
| ------- | ------- | ------ |
| `GET` | `/api/admin/users` | Összes felhasználó listázása (belépési statisztikákkal) |
| `GET` | `/api/admin/stats` | Összesítő statisztikák (összes user, sport, jelentkezés) |
| `GET` | `/api/admin/registrations` | Összes jelentkezés listázása (admin nézet) |
| `GET` | `/api/admin/categories` | Kategóriák listája |
| `GET` | `/api/admin/sport-types` | Sportágak listája |
| `GET` | `/api/admin/locations` | Helyszínek listája |
| `GET` | `/api/admin/organizers` | Szervezők listája |
| `DELETE` | `/api/admin/users/:id` | Felhasználói fiók törlése |

Az admin végpontok megkövetelik az `X-Admin-Email` HTTP fejlécet. A `isAdminEmail()` függvény először megvizsgálja, hogy van-e `ADMIN_EMAILS` környezeti változó beállítva (allowlist mód); ha nincs, az adatbázis `szerepkor` oszlopa alapján dönt. Ez a kétszintű ellenőrzés rugalmasságot biztosít: fejlesztés közben az adatbázis szerep elegendő, éles üzemben viszont a környezeti változó további biztonsági réteget ad.

## Adatbázis Kapcsolat és Tranzakciókezelés

A `config/db.js` modul a `mysql2/promise` csomag `createPool()` függvényével hoz létre egy connection pool-t, amely hatékonyan kezeli a párhuzamos adatbázis-kéréseket. A pool konfigurációja:

* **connectionLimit: 10** – Egyidejűleg legfeljebb 10 aktív kapcsolatot enged.
* **waitForConnections: true** – Ha a pool kimerül, a kérések várakoznak, nem kapnak azonnali hibaüzenetet.
* **connectTimeout: 10000ms** – Egyedi kapcsolódási időtúllépés.
* **timezone: 'Z'** – UTC időzóna az időbélyegekhez.
* **charset: 'utf8_hungarian_ci'** – Magyar karakter- és rendezéstámogatás.

A `withTransaction()` segédfüggvény egy connection-t kiigényel a pool-ból, elindít rajta egy tranzakciót, a kapott handler függvényt végrehajtja, majd sikeres futás esetén commit-ol, hiba esetén rollback-et végez, és minden esetben visszaadja a connection-t a pool-ba. Ez az absztrakció biztosítja, hogy egyetlen Service sem feledkezhet meg a tranzakció lezárásáról.
