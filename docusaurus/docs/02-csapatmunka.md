---
id: csapatmunka
sidebar_position: 2
title: Csapatmunka és Módszertan
---

# Csapatmunka, Szerepkörök és Fejlesztési Módszertan

A SportHub platform fejlesztése során a hatékony munkaszervezés és a tiszta felelősségi körök jelentették a projekt sikerességének alapját. A fejlesztési folyamatot az **iteratív, Agilis elvek** mentén szerveztük: a feladatokat kisebb, jól definiált egységekre bontottuk, amelyeket heti sprintekben valósítottunk meg. Ez a megközelítés lehetővé tette a folyamatos önreflexiót és a rugalmas prioritásváltásokat – ha egy korábbi sprint tapasztalatai alapján módosítani kellett a terven, azt gyorsan és hatékonyan megtehettük.

A fejlesztés során kiemelt figyelmet fordítottunk a **kódminőségre és a konzisztens kódstílusra**. Az ESLint konfigurációval automatikusan ellenőriztük a frontend kód minőségét, míg a backend oldalon a moduláris felépítés és az egységes hibakezelési minta biztosította az olvasható, karbantartható kódot.

## Feladatmegosztás és Felelősségi Körök

A csapattagok Full-Stack szemléletben dolgoztak, ami azt jelenti, hogy mindenki érintett volt az adatbázistervezéstől a frontend fejlesztésen át a tesztelésig. Ugyanakkor a hatékonyság érdekében a fő feladatköröket az egyéni kompetenciák mentén osztottuk el.

### Rendszerarchitektúra és Backend Fejlesztés

Az alábbi feladatokért a backend-fókuszú csapattag felelt:

* **Express.js Szerver Felépítése:** A teljes RESTful API váz megtervezése és implementálása. A kéréskezelés a `routes/` mappába szervezett útvonal-kezelőkön (Route Handlers) keresztül történik, amelyek a feldolgozó logikát delegálják a `services/` rétegnek. Az API végpontok a következő fő erőforrásokat fedik le: autentikáció (`/api/auth`), sportkatalógus (`/api/sports`), kedvencek (`/api/favorites`), jelentkezések (`/api/registrations`) és adminisztráció (`/api/admin`).
* **Kriptográfiai Biztonság:** A felhasználói jelszavak kezelésére a Node.js beépített `crypto` moduljának `scryptSync` függvényét használjuk 16 bájtos véletlenszerű salt-tal. A `timingSafeEqual` függvény alkalmazása megakadályozza az időzítésen alapuló támadásokat (timing attacks) a jelszó-ellenőrzés során.
* **Adatbázis-kapcsolat és Tranzakciókezelés:** A MySQL kapcsolat-pool (connection pool) konfigurálása a `mysql2/promise` driverrel, beleértve az automatikus újracsatlakozási logikát (retry mechanizmus), amelynek köszönhetően a szerver a Docker Compose indítási sorrendtől függetlenül is képes megvárni az adatbázis felkészülését.
* **Bemeneti Validáció:** A `validators.js` modulban centralizált validációs logika, amely ellenőrzi a regisztrációs, bejelentkezési és sport-feltöltési payload-ok integritását, mielőtt azok elérnék az adatbázis réteget.

### Frontend Fejlesztés és Felhasználói Élmény

A kliensoldali fejlesztésért felelős csapattag feladatai:

* **React SPA Architektúra:** A teljes frontend alkalmazás felépítése funkcionális React komponensekkel és React Router v7 alapú kliensoldali navigációval. Az állapotkezelés React Hook-ok (`useState`, `useEffect`, `useMemo`) segítségével történik, az `App.jsx` pedig központi állapot-elosztóként (state distributor) funkcionál.
* **Vizuális Megjelenés és Reszponzív Dizájn:** Az alkalmazás egyedi CSS stíluslapokkal készült, Bootstrap vagy Material UI nélkül. A flexbox és CSS Grid rácsrendszerek alkalmazása garantálja a mobilbarát megjelenést.
* **Interaktív Térkép Modul:** A Leaflet.js és a `leaflet.markercluster` csomag integrálása React környezetbe, lehetővé téve a sporthelyszínek földrajzi vizualizálását klaszterezett markerekkel.
* **Sportkvíz és Ajánlórendszer:** A `PlannerPage.jsx` komponens egy többlépéses kérdőív (wizard), amely a felhasználó válaszai alapján súlyozott pontszámokkal rangsorolja a sporttevékenységeket és személyre szabott ajánlásokat ad.
* **Selenium E2E Tesztelés:** Automatizált böngészőtesztek írása és karbantartása a Selenium WebDriver segítségével, amelyek az autentikációs, navigációs, adminisztrációs és funkcionalitási folyamatokat fedik le.

### Közös Felelősségek

Az alábbi területek közösen kezelt felelősségek voltak:

* **Adatbázis Séma Tervezés:** A MySQL séma (`schema.mysql.sql`) és a seed adatok (`seed.sql`) csapatban került megtervezésre, az idegen kulcsok, indexek és CHECK constraint-ek közös döntések eredményei.
* **Docker Konfigurálás:** A `docker-compose.yml` és a `dev-full.mjs` indítószkript fejlesztése, amely egyetlen paranccsal felállítja a teljes fejlesztési környezetet (adatbázis, phpMyAdmin, backend, frontend).
* **Code Review és Integráció:** A GitHub-on végzett folyamatos commitolás és egymás kódjának áttekintése biztosította a minőséget és a tudásátadást.

---

## Időbeosztás és Fejlesztési Fázisok

A fejlesztést logikai fázisokra bontottuk, hogy strukturáltan haladhassunk és ne legyen szükség utólagos újratervezésre:

| Fázis | Időszak | Fő Tevékenységek |
| ----- | ------- | ----------------- |
| **1. Tervezés** | 1-2. hét | Követelményanalízis, ER diagram készítés, wireframe tervezés, technológia-kiválasztás |
| **2. Adatbázis** | 2-3. hét | MySQL séma véglegesítés, seed adatok összeállítása, Docker Compose konfiguráció |
| **3. Backend Core** | 3-5. hét | Express szerver, autentikáció, sportkatalógus API, kedvencek és jelentkezések |
| **4. Frontend Core** | 4-7. hét | React alkalmazás váz, útvonalkezelés, katalógus oldal, keresés és szűrés |
| **5. Funkciók** | 6-8. hét | Térkép modul, sportkvíz, admin oldal, összehasonlító eszköz, tippek oldal |
| **6. Integráció** | 8-9. hét | Frontend-backend összekapcsolás, kedvencek szinkronizálás, jogosultságkezelés |
| **7. Tesztelés** | 9-10. hét | Vitest egységtesztek, Selenium E2E tesztek, manuális tesztelés, hibajavítás |
| **8. Dokumentáció** | 10-11. hét | Docusaurus dokumentáció elkészítése, kódkommentek, README finomhangolás |

---

## Felhasznált Szoftverek és Eszközök

A fejlesztés során a következő eszközöket alkalmaztuk:

* **Visual Studio Code:** A projekt teljes forráskódjának fejlesztéséhez használt integrált fejlesztői környezet (IDE). Az ESLint és a Prettier bővítmények segítették a kódminőség fenntartását.
* **Docker Desktop:** A MySQL adatbázis és a phpMyAdmin konténerizált futtatásához. A Docker Compose fájl biztosítja, hogy a fejlesztői környezet minden gépen azonos legyen.
* **GitHub:** A forráskód verziókezelése és a csapattagok közötti együttműködés központi platformja. A commit-történet a fejlesztési napló alapját is képezi.
* **Postman:** A backend API végpontok kézi tesztelésére és hibakeresésre a fejlesztés korai fázisaiban, amikor a frontend kliens még nem volt elérhető.
* **phpMyAdmin:** Az adatbázis tartalmának böngészésére, SQL lekérdezések futtatására és az adatintegritás ellenőrzésére a fejlesztés során.
* **Google Chrome DevTools:** A frontend teljesítményprofilozáshoz, a hálózati kérések nyomon követéséhez és a reszponzív dizájn teszteléséhez.
* **Figma:** A felhasználói felület előzetes wireframe-jeinek és a vizuális tervdokumentumok elkészítéséhez.
* **Discord & Messenger:** Az informális kommunikáció, a gyors egyeztetések és a képernyőmegosztásos közös hibakeresés eszközei.
