---
id: architektura
sidebar_position: 4
title: Rendszer Architektúra
---

# Rendszer Architektúra és Technológiai Áttekintés

A SportHub platform egy klasszikus, háromrétegű (three-tier) webalkalmazás, amelynek egyes rétegei szigorúan elválasztott felelősségi körökkel rendelkeznek. Ez a szeparáció lehetővé teszi, hogy az adatbázis-logikát, a szervermentes üzleti szabályokat és a felhasználói felületet egymástól függetlenül fejlesszük, teszteljük és skálázzuk.

A bal oldali menüben található aloldalak részletesen bemutatják az egyes technológiai rétegeket: az adatbázis logikai modelljét, a backend API struktúráját és a frontend kliens felépítését.

## Az Alkalmazás Rétegei és Adatfolyama

A rendszer működése egy jól definiált, aszinkron kérés-válasz ciklus mentén zajlik. Amikor a felhasználó interakcióba lép a böngészőjében futó React alkalmazással (például rákattint egy sport részleteire, vagy kitölt egy regisztrációs űrlapot), a következő adatfolyam indul el:

1. **Kliensoldali Eseménykezelés (React):** A felhasználói művelet hatására a megfelelő React komponens egy `fetch()` hívást kezdeményez az Express backend felé. A kérés tartalmazza a szükséges adatokat (pl. a `body`-ban a regisztrációs adatokat, vagy a `headers`-ben a felhasználó email-jét a kedvencek azonosításához).

2. **Szerzőoldali Útválasztás és Validáció (Express):** A backend az `app.js` fájlban definiált központi catch-all handler segítségével irányítja a kérést a megfelelő Route Handler-hez (pl. `handleAuthRoutes`, `handleSportsRoutes`). A handler először a `validators.js` modulban definiált szabályok szerint ellenőrzi a bemeneti adatokat (payload validation). Ha a validáció sikertelen, a szerver azonnali hibaválaszt küld (400 Bad Request), anélkül, hogy az adatbázis réteg érintve lenne.

3. **Üzleti Logika és Adatelérés (Service Layer):** Ha a validáció sikeres, a route handler a megfelelő Service modulhoz delegálja a kérést (pl. `authService.js`, `sportsService.js`). A Service réteg tartalmazza az SQL lekérdezéseket, a tranzakciókezelést és az üzleti szabályokat (pl. duplikált email ellenőrzés regisztrációnál, jelszó-hash ellenőrzés bejelentkezésnél).

4. **Adatbázis Művelet (MySQL):** A `config/db.js` modul `mysql2/promise` connection pool-ján keresztül a kérés eléri a MySQL adatbázist. Az adatbázis végrehajtja a lekérdezést, és visszaadja az eredménysorokat.

5. **Adattranszformáció és Válasz (Mapper Layer):** A nyers adatbázis sorok (amelyek magyar oszlopneveket tartalmaznak, mint `felhasznalonev`, `sportag_id`, `varos`) a `mappers.js` modulban definiált mapper függvények segítségével kerülnek átalakításra a frontend által várt angol kulcsú JSON objektumokká (mint `username`, `sportType`, `location`). Ez a transzformáció biztosítja a frontend és a backend közötti tiszta API szerződést (contract).

6. **Felhasználói Felület Frissítése (React State):** A frontend megkapja a JSON választ, és a React állapotkezelés (`useState` hook-ok) segítségével azonnal frissíti a felhasználói felületet – legyen szó a sportkatalógus újratöltéséről, a kedvencek listájának frissítéséről, vagy egy sikeres belépés utáni navigációról.

## A Moduláris Kód Szervezése

### Backend Mappastruktúra

```
backend/
├── server.js              # Belépési pont (nem használatos, app.js indít)
├── src/
│   ├── app.js             # Express alkalmazás, middleware-ek, Health Check
│   ├── config/
│   │   └── db.js          # MySQL connection pool, retry, tranzakciók
│   ├── routes/
│   │   ├── auth.js        # /api/auth/* végpontok (regisztráció, belépés)
│   │   ├── sports.js      # /api/sports/* végpontok (CRUD, szűrés)
│   │   ├── favorites.js   # /api/favorites/* végpontok (kedvencek)
│   │   ├── registrations.js  # /api/registrations/* végpontok
│   │   └── admin.js       # /api/admin/* végpontok (felhasználók, statisztikák)
│   ├── services/
│   │   ├── authService.js       # Regisztráció, belépés, admin ellenőrzés
│   │   ├── sportsService.js     # Sport CRUD, join query-k, tranzakciók
│   │   ├── favoritesService.js  # Kedvencek szinkronizálás, toggle
│   │   ├── registrationsService.js  # Jelentkezés, lemondás, listázás
│   │   └── adminService.js      # Felhasználók listázás, statisztikák
│   └── utils/
│       ├── helpers.js     # Jelszó hash/verify, email normalizálás, JSON válasz
│       ├── mappers.js     # DB sor → API objektum transzformáció, RBAC logika
│       └── validators.js  # Payload validációs szabályok
└── test/
    ├── routes/
    │   └── auth.test.js
    └── services/
        ├── adminService.test.js
        ├── authService.test.js
        ├── favoritesService.test.js
        ├── registrationsService.test.js
        └── sportsService.test.js
```

### Frontend Mappastruktúra

```
Frontend/
├── index.html
├── src/
│   ├── main.jsx          # React belépési pont, BrowserRouter beágyazás
│   ├── App.jsx            # Központi state menedzser és route dispatcher
│   ├── Styles.css         # Globális stílusok
│   ├── components/
│   │   ├── Header.jsx     # Navigáció, kereső, felhasználói menü
│   │   ├── Hero.jsx       # Kezdőoldali banner, élő óra, másodlagos navigáció
│   │   ├── Footer.jsx     # Lábléc, információk, linkek
│   │   ├── SportsGrid.jsx # Sportkártya rács, szűrők, rendezés
│   │   └── Ticker.jsx     # Futó szövegsáv funkciókkal
│   ├── pages/
│   │   ├── HomePage.jsx      # Kezdőoldal
│   │   ├── CatalogPage.jsx   # Katalógus, szűrés, részletek, összehasonlítás
│   │   ├── FavoritesPage.jsx # Kedvencek oldal
│   │   ├── PlannerPage.jsx   # Sportkvíz ajánlórendszer
│   │   ├── MapPage.jsx       # Leaflet interaktív térkép
│   │   ├── TipsPage.jsx      # Sporttippek és kvíz
│   │   ├── ProfilePage.jsx   # Felhasználói profil és bejelentkezési előzmények
│   │   ├── AuthPage.jsx      # Regisztráció / Belépés
│   │   └── AdminPage.jsx     # Adminisztrációs vezérlőpult
│   ├── lib/
│   │   ├── api.js        # API URL építő segédfüggvény
│   │   └── utils.js      # Kliensoldali segédfüggvények (normalizálás, email validáció)
│   ├── constants/
│   │   └── index.js      # Globális konstansok (localStorage kulcsok, default értékek)
│   └── data/
│       └── Sports.json   # Statikus sport adatok (opcionális fallback)
└── tests/
    └── selenium/
        ├── runSeleniumTests.mjs  # Selenium teszt-runner szkript
        ├── auth.test.js
        ├── admin.test.js
        ├── features.test.js
        ├── movies.test.js
        └── nav.test.js
```

## Biztonsági Horizontális Réteg

A biztonság nem egy önálló komponens, hanem egy horizontális szempont, amely az összes réteget átszövi:

* **Express Middleware-ek:** A `helmet` csomag beállítja a HTTP biztonsági fejléceket (Content-Security-Policy, X-Content-Type-Options stb.), míg a `cors` middleware szabályozza a Cross-Origin kérések engedélyezését.
* **Jelszókezelés:** A `scryptSync` kriptográfiai hash-elés és a `timingSafeEqual` összehasonlítás a `helpers.js` modulban implementált. A nyers jelszó soha nem kerül logolásra vagy adatbázisba.
* **Szerepkör Alapú Hozzáférés (RBAC):** Az `admin` végpontok megkövetelik az `X-Admin-Email` fejlécet, amelyet a `mappers.js` modulban definiált `resolveUserRole` függvény ellenőriz. Az admin jogosultság meghatározható az adatbázis `szerepkor` oszlopa vagy a `ADMIN_EMAILS` környezeti változó alapján.
* **Bemeneti Validáció:** Minden felhasználói bemenet validáción esik át, mielőtt az adatbázisba kerülne. Az SQL injection elleni védelmet a `mysql2` csomag parametrikus lekérdezései (prepared statements) biztosítják.

A következő oldalakon az egyes rétegek részletes technikai dokumentációját találja.
