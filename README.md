# SportHub – Vizsgaremek

**Szoftverfejlesztő és -tesztelő záróvizsga remek** 

**Résztvevők:** Decs Dániel és Farkas Máté

A SportHub egy modern, Full-Stack webalkalmazás, amely lehetővé teszi a felhasználók számára a helyi sportlehetőségek felfedezését és kezelését. Az alkalmazás egyetlen letisztult felületen integrálja a sportlehetőségek adatbázisát, az intelligens keresést és szűrést, valamint az adminisztratív eszközöket.

---

## Tartalomjegyzék
1. [A projekt célkitűzése](#1-a-projekt-célkitűzése)
2. [Fő funkciók és modulok](#2-fő-funkciók-és-modulok)
3. [Technológiai Stack](#3-technológiai-stack)
4. [Csapatmunka és Feladatkörök](#4-csapatmunka-és-feladatkörök)
5. [Adatbázis architektúra](#5-adatbázis-architektúra)
6. [Szoftvertesztelés (QA)](#6-szoftvertesztelés-qa)
7. [Fejlesztési eszközök](#7-fejlesztési-eszközök)
8. [Környezet és Futtatás](#8-környezet-és-futtatás)
9. [Dokumentáció (Docusaurus)](#9-dokumentáció-docusaurus)

---

## 1. A projekt célkitűzése

A projekt célja egy olyan modern, könnyen használható webalkalmazás fejlesztése, amely összegyűjti és rendszerezi a különböző helyi sportlehetőségeket. A felhasználók egyszerűen megtalálhatják a számukra megfelelő sporttevékenységet, legyen szó hobbi sportolásról, edzőtermekről, szabadtéri pályákról vagy szervezett sporteseményekről.

Az alkalmazás célközönsége minden korosztály, aki szeretné aktívan tölteni a szabadidejét, vagy új sportágakat kipróbálni.

## 2. Fő funkciók és modulok

* **Sportlehetőségek listázása:** Különböző sportok, edzéshelyszínek és sportesemények megjelenítése kategóriák szerint.
* **Keresés és szűrés:** A felhasználók sporttípus, helyszín, időpont vagy ár alapján szűrhetik a találatokat.
* **Részletes adatlap:** A sporthelyekhez tartozó információk megjelenítése (cím, árak, nyitvatartás, képek, leírás, elérhetőségek).
* **Kedvencek kezelése:** A regisztrált felhasználók elmenthetik kedvenceiket és gyorsan hozzáférhetnek a számukra legfontosabb sportlehetőségekhez.
* **Regisztráció és Bejelentkezés:** Biztonságos autentifikáció JWT tokenek és hashelésített jelszavak segítségével.
* **Adminisztrációs felület:** Az adminok új sporthelyeket, eseményeket és kategóriákat adhatnak hozzá, illetve módosíthatják vagy törölhetik azokat.
* **Teljes körű felhasználókezelés:** Admin jogosultságokkal bíró felhasználók kezelhetik a platform összes aspektusát.

## 3. Technológiai Stack

A rendszert szigorúan rétegezett, mikro-szolgáltatás (microservices) szemléletű architektúrában építettük fel.

**Frontend (Kliensoldal):**
* React.js (Vite környezetben)
* CSS3 & Bootstrap (reszponzív dizájn)
* Context API (Állapotkezelés)
* Axios (HTTP kérések)

**Backend (Szerveroldal):**
* Node.js & Express.js (RESTful API, MVC minta alapján)
* JWT (JSON Web Token) & Bcrypt (Autentikáció és Kriptográfia)
* MySQL2 (Aszinkron adatbázis driver)

**Adatbázis & Infrastruktúra:**
* MySQL (Mélyen normalizált relációs adatbázis)
* Docker & Docker Compose (Konténerizáció)

## 4. Csapatmunka és Feladatkörök

A fejlesztés során az Agilis módszertant követtük, heti sprintekkel és folyamatos integrációval. A komplexebb moduloknál páros programozást alkalmaztunk. Mindketten Full-Stack fejlesztőként dolgoztunk, azonban a feladatok megosztásánál figyelembe vettük az egyéni erősségeket: Máté inkább a frontend, míg Dániel inkább a backend terület felé orientálódott. Ennek ellenére mindketten aktívan részt vettünk mindkét oldal fejlesztésében.

### Decs Dániel

* **Backend fókusz:** Node.js & Express.js alapú RESTful API architektúra tervezése és implementálása.
* **Autentifikáció & Biztonság:** JWT tokenek és Bcrypt alapú jelszókezelés megvalósítása.
* **Adatbázis integráció:** MySQL2 driverrel történő adatbázis kommunikáció, service réteg kialakítása, query optimalizálás.
* **API végpontok:** Sportlehetőségek, kedvencek, regisztráció és bejelentkezés funkciók fejlesztése.
* **Frontend hozzájárulás:** Kliensoldali logika és komponensek fejlesztésében való részvétel.
* **QA:** Backend egységtesztek írása Vitest/Jest segítségével, valamint frontend funkciók tesztelése.

### Farkas Máté

* **Frontend fókusz:** React.js alapú SPA (Single Page Application) fejlesztése Vite build eszközzel.
* **UI/UX dizájn:** Reszponzív felhasználói felület kialakítása CSS Grid és Flexbox segítségével.
* **Komponens architektúra:** React komponensstruktúra kialakítása, állapotkezelés Context API-val.
* **API integráció:** Axios használata a backend kommunikációhoz, request/response kezelés.
* **Admin felület:** Adminisztrációs felület fejlesztése az adatok kezeléséhez.
* **Backend hozzájárulás:** API végpontok és adatkezelési logika fejlesztésében való részvétel.
* **QA:** End-to-End és integrációs tesztek készítése, valamint backend funkciók ellenőrzése.

## 5. Adatbázis architektúra

A rendszer alapját egy normalizált MySQL adatbázis adja. A tervezés több logikai blokkra oszlik:

* **Felhasználók és Interakciók:** Felhasználói adatok, hash-elt jelszavak, jogosultságok, kedvencek, regisztrációs információk.
* **Sportlehetőségek:** Sportágak, kategóriák, helyszínek, sportlehetőségek rögzítése N:M kapcsolatokkal.
* **Admin funkciók:** Szerepkör-alapú (RBAC) hozzáférés kontroll a funkciók kezeléséhez.

## 6. Szoftvertesztelés (QA)

A magas fokú rendelkezésre állás és hibamentes élmény érdekében többlépcsős tesztelést alkalmaztunk:

* **Backend Egységtesztelés (Unit Tests):** A kritikus üzleti logikák (autentifikáció, adatok manipulálása) automatizált ellenőrzése Vitest segítségével, mockolt adatbázis kapcsolatokkal.
* **Frontend Komponens tesztelés:** React komponensek izolált tesztelése mock-olt propokkal és állapotokkal.
* **Integráció tesztelés:** A frontend és backend közötti kommunikáció ellenőrzése.

## 7. Fejlesztési eszközök

* **Tervezés & Dizájn:** Figma, Canva, VS Code Design tools
* **Kódolás & Verziókövetés:** Visual Studio Code, Git & GitHub
* **Adatbázis & DevOps:** Docker Desktop, MySQL, phpMyAdmin, Workbench
* **Projektmenedzsment:** Moodle, Discord, Google Drive

## 8. Környezet és Futtatás

A platform telepítésének és futtatásának leegyszerűsítésére a teljes architektúrát Docker konténerekbe csomagoltuk. Az érzékeny adatokat a biztonsági standardoknak megfelelően lokális `.env` fájl kezeli.

**Teszt fiókok:**

| Szerepkör | Felhasználónév | E-mail | Jelszó |
|-----------|----------------|--------|--------|
| Admin | admin | admin@sporthub.hu | adminpass |
| Felhasználó | user | user@sporthub.hu | userpass |

**A rendszer indítása:**

```bash
# Fejlesztési mód (root könyvtárból)
npm run dev:full

# Docker segítségével (adatbázis)
npm run docker:db:up

# Backend tesztek (backend mappából)
npm test
```

**Frontend Selenium smoke tesztek:**

```bash
# Root könyvtárból
npm run test:frontend:selenium

# Vagy közvetlenül a Frontend mappából
npm run test:selenium
```

Alapértelmezésben a Selenium runner elindít egy helyi Vite szervert `http://127.0.0.1:5173` címen, majd lefuttatja a főoldal, a kínálat és a védett útvonal átirányításának ellenőrzését. A port felülírható `SELENIUM_PORT`, a teljes URL pedig `SELENIUM_BASE_URL` változóval. A böngésző és a futtatás módja a `SELENIUM_BROWSER`, `SELENIUM_HEADLESS` és `SELENIUM_START_SERVER` környezeti változókkal állítható.

A tesztek külön fájlokra vannak bontva a `Frontend/tests/selenium` mappában, például `auth.test.js`, `nav.test.js`, `catalog.test.js`, `features.test.js` és `map.test.js`, így egyes suite-ok külön is futtathatók `node ./tests/selenium/<fajlnev>` formában.

## 9. Dokumentáció (Docusaurus)

A projekt részletes technikai dokumentációja egy [Docusaurus](https://docusaurus.io/) alapú statikus oldalon érhető el, a `docusaurus/` mappában.

**Tartalma:**
* Projekt áttekintés és csapatmunka
* Telepítési és konfigurációs útmutató
* Adatbázis séma leírás
* Backend API dokumentáció
* Frontend architektúra
* Admin felület dokumentáció
* Tesztelési stratégia és eredmények
* Fejlesztési napló

**Indítás:**

Az oldal alapértelmezés szerint a `http://localhost:3000/vizsgaremek/` címen érhető el. Az `npm run dev:full` parancs automatikusan elindítja a dokumentációs oldalt is a backend és frontend mellett.
