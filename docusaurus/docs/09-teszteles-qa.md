---
id: teszteles-qa
sidebar_position: 9
title: Tesztelés és QA
---

# Szoftvertesztelés, Automatizálás és Minőségbiztosítás (QA)

Egy komplex, többrétegű webalkalmazás fejlesztése során elengedhetetlen a szisztematikus tesztelés. A SportHub platform esetében a legkisebb módosítás – legyen az egy adatbázis-sémaváltoztatás, egy backend validációs szabály módosítása vagy egy React komponens átszervezése – láncreakciót indíthat el a rendszerben. Ennek megelőzésére a szoftverfejlesztési életciklusunkba (SDLC) többszintű, automatizált tesztelési stratégiát integráltunk.

A tesztelés célja a **regresszió megelőzése** (korábban működő funkciók ne romoljanak el), a **kód helyes működésének bizonyítása** az üzleti logika szintjén, és a **felhasználói élmény végponttól végpontig** (End-to-End) történő ellenőrzése. A tesztelést két fő doménre – backend és frontend – bontottuk, mindkettőnél más eszközöket és megközelítéseket alkalmazva.

## 1. Backend Tesztelés

A szerveroldali logika (Node.js / Express) tesztelését manuális és automatizált megközelítések kombinációjával végeztük.

### Manuális API Tesztelés (Postman)

A fejlesztés korai fázisában, amikor a React frontend még nem állt rendelkezésre kliensként, a backend végpontokat a **Postman** platformmal vizsgáltuk kézzel. A Postman segítségével az összes HTTP metódust (GET, POST, PUT, DELETE) leteszteltük, ellenőrizve:

* **A kérés-válasz formátum helyességét:** A JSON body felépítése és a válasz struktúrája megfelel-e az API specifikációnak.
* **A státuszkódok pontosságát:** Sikeres műveleteknél `200 OK` vagy `201 Created`, hibás bemenetnél `400 Bad Request`, illetéktelen hozzáférésnél `401 Unauthorized` vagy `403 Forbidden`, nem létező erőforrásnál `404 Not Found`.
* **A jogosultság-kezelés működését:** Szimulált kérések az admin végpontokra normál felhasználói `X-Admin-Email` fejléccel, vagy a fejléc teljes kihagyásával.
* **Az adatbázis-műveletek helyességét:** phpMyAdmin párhuzamos használatával ellenőriztük, hogy a POST kérések valóban létrehozzák, a PUT kérések módosítják, a DELETE kérések pedig eltávolítják a megfelelő rekordokat.

### Automatizált Egységtesztek (Vitest)

A hosszú távú kódstabilitás és a regressziók korai felismerése érdekében a backend `test/` mappájában automatizált egységteszteket (Unit Tests) írtunk a **Vitest** keretrendszerrel. A Vitest a Jest-kompatibilis, de jelentősen gyorsabb, Vite-alapú teszt-runner, amely natívan támogatja az ESM modulokat.

**A tesztkonfiguráció (`vitest.config.js`):**
```javascript
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
    },
  },
});
```

**A tesztek futtatása:**
```bash
cd backend
npm test
```

A tesztek a `test/` könyvtárban az alábbi struktúrában helyezkednek el:

```
test/
├── routes/
│   └── auth.test.js          # Autentikációs végpontok tesztelése
└── services/
    ├── adminService.test.js        # Admin logika egységtesztjei
    ├── authService.test.js         # Regisztrációs/belépési logika tesztjei
    ├── favoritesService.test.js    # Kedvencek szolgáltatás tesztjei
    ├── registrationsService.test.js # Jelentkezések szolgáltatás tesztjei
    └── sportsService.test.js       # Sportkatalógus szolgáltatás tesztjei
```

#### Tesztelt Üzleti Logikák

A Vitest tesztek az alábbi kritikus üzleti logikákat validálják:

**Autentikációs tesztek (`authService.test.js`):**
* Regisztráció sikeres végrehajtása helyes adatokkal.
* Regisztráció elutasítása duplikált email vagy felhasználónévvel (409 Conflict).
* Bejelentkezés helyes hitelesítő adatokkal.
* Bejelentkezés elutasítása hibás jelszóval vagy nem létező felhasználóval.
* Bejelentkezési naplóbejegyzés létrejötte sikeres és sikertelen kísérleteknél.

**Sportkatalógus tesztek (`sportsService.test.js`):**
* Sport létrehozás tranzakción belüli konzisztenciája (sportág, kategória, helyszín, szervező automatikus létrehozása).
* Sport létezésének ellenőrzése (`sportExists`).
* Sport lista lekérdezés a JOIN-ok helyes működésével.

**Kedvencek tesztek (`favoritesService.test.js`):**
* Kedvenc hozzáadása és eltávolítása (toggle logika).
* Kedvencek szinkronizálása (több kedvenc egyidejű szerver-frissítése).
* Duplikált kedvenc hozzáadás kezelése (idempotens művelet).

**Jelentkezések tesztek (`registrationsService.test.js`):**
* Jelentkezés létrehozása aktív állapottal.
* Dupla jelentkezés megakadályozása (UNIQUE constraint ellenőrzés).
* Jelentkezés lemondása (állapotváltás 'lemondva'-ra).
* Lemondott jelentkezés újraaktiválása.

**Admin tesztek (`adminService.test.js`):**
* Felhasználók listázása belépési statisztikákkal.
* Összesítő statisztikák helyes aggregálása.
* Referencia-adatok (kategóriák, sportágak, helyszínek, szervezők) listázása.

#### Mocking és Izoláció

A tesztek írása során mockolást (mocking) alkalmazunk az adatbázis-kapcsolatokon, így a tesztek futtatása nem igényli a valódi MySQL szerver jelenlétét, nem módosítja a produkciós adatokat, és milliszekundumok alatt lefutnak. Ez lehetővé teszi, hogy a fejlesztő minden commit előtt lefuttassa a teljes tesztcsomagot.

---

## 2. Frontend End-to-End (E2E) Tesztelés

Bár az egységtesztek kiválóak a belső logika izolált ellenőrzésére, a felhasználó a böngészőben lévő felülettel (UI) találkozik. A komplex End-to-End tesztelésre a Frontend `tests/selenium/` mappájában egy automatizált **Selenium WebDriver** alapú tesztkörnyezetet építettünk fel.

**A tesztek futtatása:**

Első futtatáskor:
```bash
cd Frontend
npm install selenium-webdriver
npm run test:selenium
```

Későbbi futtatásokkor:
```bash
cd Frontend
npm run test:selenium
```

### A Selenium Teszt-Runner (`runSeleniumTests.mjs`)

A Selenium teszteket egy egyedi, Node.js alapú teszt-runner szkript orchestrálja. A runner az alábbi lépéseket hajtja végre:

1. **Vite fejlesztői szerver indítása:** A teszt-runner automatikusan elindítja a frontend fejlesztői szervert (ha a `SELENIUM_START_SERVER` nincs 'false'-ra állítva), és megvárja, amíg a `http://127.0.0.1:5173` URL-en válaszol.
2. **Tesztfájlok felderítése:** A `tests/selenium/` könyvtárban megkeresi az összes `*.test.js` fájlt.
3. **Szekvenciális végrehajtás:** A teszteket sorban, egyenként futtatja le a Chrome böngészőben (alapértelmezés szerint headless módban).
4. **Eredmény összesítés:** A teszt-runner kiírja a sikeres és sikertelen tesztek számát, majd a megfelelő kilépési kóddal (0 = mind sikeres, 1 = volt hiba) fejezi be a futást.

### A Tesztcsomagok (Test Suites)

A Selenium tesztek öt logikai csoportba szerveződnek:

#### `auth.test.js` – Autentikációs Folyamatok
Ez a teszikcsomag a teljes belépési és regisztrációs munkafolyamatot ellenőrzi:
* Navigálás az Auth oldalra és a regisztrációs/belépési űrlap megjelenésének ellenőrzése.
* Sikeres regisztráció helyes adatokkal (űrlap kitöltése, submit, sikeres állapot vizsgálata).
* Sikertelen regisztráció érvénytelen adatokkal (rövid jelszó, hibás email) – a megfelelő hibaüzenet megjelenésének ellenőrzése.
* Belépés helyes és helytelen hitelesítő adatokkal.
* A felhasználói állapot változásainak ellenőrzése (megjelenik-e a profil menüpont belépés után).

#### `admin.test.js` – Adminisztrációs Panel
Az admin felület biztonsági és funkcionális tesztjei:
* Admin oldal elérésének vizsgálata admin és nem-admin felhasználóként.
* Az admin navigáció és a fülváltás (felhasználók, sportok, jelentkezések) működése.
* A sport-feltöltő űrlap megjelenése és a kötelező mezők validációja.

#### `movies.test.js` – Katalógus és Tartalom
(A fájlnév a tesztelési konvencióból ered, tartalmilag a sportok megjelenítését teszteli.)
* A kezdőoldali DOM elemek (sport kártyák, szűrők) betöltésének ellenőrzése.
* A szűrő elemek (dropdown-ok, keresőmező) megjelenésének vizsgálata.
* A sport részleteit megjelenítő modális ablak nyitásának és tartalmának ellenőrzése.

#### `nav.test.js` – Navigáció és Routing
A React Router alapú kliensoldali navigáció tesztjei:
* A fő navigációs menüpontok (Katalógus, Tippek, Sportkvíz, Térkép) működése.
* Az érvénytelen útvonalak kezelése (átirányítás a főoldalra).
* A reszponzív menüsáv viselkedése különböző képernyőméreteken.

#### `features.test.js` – Funkcionális Tesztek
A platform specifikus funkcióinak komplex tesztjei:
* A profil oldal adatainak megjelenítése bejelentkezés után.
* A Leaflet térkép betöltésének és a marker-ek megjelenésének ellenőrzése.
* A sport-összehasonlító eszköz működése.

### Headless és Vizuális Futtatás

A Selenium tesztek alapértelmezés szerint **headless** módban futnak (a böngésző ablaka nem jelenik meg a képernyőn), ami gyorsabb végrehajtást és CI/CD pipeline-okba való integrálhatóságot biztosít. Ha a fejlesztő vizuálisan is követni szeretné a teszt végrehajtását (szimulált kattintások, gépelés, navigáció), a `SELENIUM_HEADLESS=false` környezeti változó beállításával valós böngészőablakban is futtathatók a tesztek.

---

## 3. Tesztelési Összefoglaló

| Típus | Keretrendszer | Fájlok száma | Lefedett terület |
| ----- | ------------- | ------------ | ---------------- |
| **Egységteszt** | Vitest | 6 tesztfájl | Auth, Sports, Favorites, Registrations, Admin (Routes + Services) |
| **E2E teszt** | Selenium WebDriver | 5 tesztcsomag | Auth workflows, Admin panel, Katalógus, Navigáció, Features |
| **Manuális teszt** | Postman | – | Összes API végpont, jogosultságkezelés, hibakódok |

A többszintű tesztelési megközelítés biztosítja, hogy a SportHub platform mind az üzleti logika (backend), mind a felhasználói élmény (frontend) szintjén ellenőrzött és megbízható legyen. Az automatizált tesztek lehetővé teszik a folyamatos kódbiztonságot, mivel minden módosítás után gyorsan lefuttathatók, és azonnal jelzik, ha valami elromlott.
