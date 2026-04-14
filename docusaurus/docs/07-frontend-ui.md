---
id: frontend-ui
sidebar_position: 7
title: Frontend és Felhasználói Felület
---

# Frontend Kliens (React), Felhasználói Felület és Interakciók

A SportHub kliensoldala egy korszerű, komponensalapú **React 19** Single Page Application (SPA), amelyet a **Vite** (Rolldown alapú) fejlesztői környezet szolgál ki. Az alkalmazás a teljes vizuális megjelenést egyedi CSS stíluslapokkal valósítja meg, kerülve a nehézsúlyú UI framework-öket (mint a Bootstrap vagy a Tailwind). A Flexbox és CSS Grid rácsrendszerek biztosítják a tökéletes reszponzivitást mobilkijelzőtől asztali monitorig.

## A Webalkalmazás Elérése

A rendszer indítása után a felhasználói felület az alábbi címen érhető el:

**URL:** `http://localhost:5173`

## Alkalmazás Architektúra és Állapotkezelés

Az alkalmazás belépési pontja a `main.jsx`, amely a React alkalmazást egy `BrowserRouter`-be csomagolja, lehetővé téve a kliensoldali navigációt oldal-újratöltés nélkül. A fő logikai hub az `App.jsx`, amely egyszerre tölti be a központi állapotkezelő (state manager) és az útvonal-elosztó (route dispatcher) szerepét.

### Központi Állapotkezelés az `App.jsx`-ben

Az `App.jsx` tartalmazza a teljes alkalmazás állapotát React Hook-ok segítségével. Ez a centralizált megközelítés lehetővé teszi, hogy a különböző oldalak és komponensek közötti adatmegosztás prop drilling segítségével történjen, felesleges komplexitás (pl. Redux) nélkül. A főbb állapotcsoportok:

| Állapotcsoport | Hook-ok | Felelősség |
| -------------- | ------- | ---------- |
| **Sportok** | `sports`, `setSports` | A szerveren tárolt sportkatalógus helyi másolata |
| **Kedvencek** | `favorites`, `setFavorites`, `favoritesBusy` | Kedvencek lista, szinkronizálási állapot |
| **Jelentkezések** | `registrations`, `registrationsBusy` | Aktív jelentkezések és a folyamatban lévő műveletek |
| **Autentikáció** | `authUser`, `authState`, `signUpForm`, `signInForm` | Bejelentkezett felhasználó, regisztrációs/belépési űrlap állapotok |
| **Admin** | `adminUsers`, `adminRegistrations`, `form`, `editingId` | Admin oldal adatai, szerkesztés alatt lévő sport |
| **Kvíz** | `planner`, `plannerSubmitted` | Sportkvíz válaszok és az eredmény állapota |
| **Általános** | `query`, `toast`, `now`, `mapFocusId` | Keresési szöveg, értesítési buborékok, élő idő, térkép fókusz |

### Kiszámított Értékek (`useMemo`)

A teljesítmény optimalizálása érdekében több származtatott érték `useMemo` hook-kal van cache-elve:

* **`uniqueTypes`, `uniqueLocations`, `uniqueCategories`:** A szűrőkhöz szükséges egyedi sportág, város és kategória listák, amelyek csak a `sports` tömb változásakor számítódnak újra.
* **`registrationBySportId`:** Egy lookup objektum, amely sportazonosító alapján O(1) időben teszi elérhetővé a felhasználó jelentkezéseit.
* **`liveDayLabel`, `liveTimeLabel`:** A jelenlegi nap neve és napszak megnevezése, a Hero komponens számára.

### Útvonal Validáció és Védett Oldalak

Az `App.jsx` useEffect hook-okkal biztosítja a navigációs szabályok betartását:

* **Érvénytelen útvonalak:** Ha a felhasználó egy nem létező URL-re navigál, automatikusan átirányítódik a főoldalra (`/`).
* **Védett útvonalak:** A `/fiok` (Profil) és `/kedvencek` oldalak csak bejelentkezett felhasználók számára érhetők el; bejelentkezés nélkül az autentikációs oldalra irányítódnak.
* **Autentikált állapot:** Ha egy már bejelentkezett felhasználó megpróbálja elérni az `/auth` oldalat, automatikusan a Profil oldalra kerül.

## Az Egyes Oldalak és Funkcionalitásuk

### Kezdőoldal (`HomePage.jsx`)

A felhasználót egy vizuálisan megkapó belépési pont fogadja. A kezdőoldal a `Hero` komponenst jeleníti meg, amely tartalmazza a platform nevét és szlogenjét, az aktuális dátumot és időt (valós időben frissülő), valamint egy másodlagos navigációs sávot a legfontosabb funkciókhoz (Katalógus, Tippek, Sportkvíz, Kedvencek).

A Hero alatti tartalom a `SportsGrid` komponens, amely a legfrissebb sporttevékenységeket jeleníti meg interaktív kártyákon, azonnali kedvencekbe vétel és részletek megtekintése lehetőségével.

### Katalógus Oldal (`CatalogPage.jsx`)

A platform leggazdagabb funkciókészlettel rendelkező oldala. A sportkatalógus egy fejlett szűrőrendszerrel rendelkezik:

* **Szöveg alapú keresés:** Valós idejű, gépelés közbeni szűrés a sport nevében és leírásában.
* **Sportág szűrő:** Dropdown a rendelkezésre álló sportágak közül (Úszás, Futás, Tenisz stb.).
* **Kategória szűrő:** A helyszín típusa szerint (Edzőterem, Pálya, Uszoda stb.).
* **Város szűrő:** A földrajzi elhelyezkedés alapján.
* **Árkategória szűrő:** Ingyenes, alacsony, közepes, magas kategóriák.
* **Napszak szűrő:** Reggel, délután, este, hétvége.
* **Rendezés:** Név, ár (növekvő/csökkenő), város szerint.

A kártyákon egyetlen kattintással megtekinthetők a sport részletei egy modális ablakban, hozzáadható a kedvencekhez, vagy akár összehasonlítható más sportokkal.

**Összehasonlító funkció:** Legfeljebb 3 sport kiválasztható az oldalsó összehasonlító sávba. Az összehasonlító egy egymás melletti táblázatos nézetben mutatja be a kiválasztott sportok közötti különbségeket (ár, helyszín, napszak, kategória, nyitvatartás).

### Sportkvíz – Személyre Szabott Ajánló (`PlannerPage.jsx`)

A `PlannerPage` egy többlépéses interaktív kérdőív (wizard), amely a felhasználó válaszai alapján ajánl sportokat. A kérdőív az alábbi paramétereket méri fel:

1. **Preferált környezet:** Beltéri / Kültéri / Mindegy
2. **Sport típusa:** Egyéni / Csapat / Mindegy
3. **Költségvetés:** Ingyenes / Alacsony / Közepes / Magas
4. **Intenzitás:** Alacsony / Közepes / Magas
5. **Napszak:** Reggel / Délután / Este / Hétvége

A válaszok beérkezése után a frontend egy súlyozott pontszámító algoritmust alkalmaz: minden sporttevékenységre kiszámolja, mennyire illeszkedik a felhasználó preferenciáihoz. Az algoritmus figyelembe veszi a kategóriát (beltéri vs. kültéri), az árat (a megadott költségvetési kerethez képest), a napszak egyezést és az intenzitást. Az eredmények egy rangsorolt listában jelennek meg, százalékos egyezési mutatóval kiegészítve.

### Kedvencek Oldal (`FavoritesPage.jsx`)

A bejelentkezett felhasználónak lehetősége van a kedvencnek jelölt sportok dedikált megtekintésére. Az oldal a `favorites` állapotból építi fel a kártyalistát. A kedvencek szinkronizálódnak a backend és a localStorage között: ha a felhasználó kijelentkezik, majd újra belép, a kedvencei megőrződnek.

### Interaktív Térkép (`MapPage.jsx`)

A `MapPage` a nyílt forráskódú **Leaflet.js** könyvtárat integrálja React környezetbe. A térkép Magyarország térképén megjeleníti az összes sporthelyszínt, amelyhez GPS koordináta tartozik az adatbázisban. A **leaflet.markercluster** bővítmény gondoskodik arról, hogy kis zoom szinteken a közeli markerek csoportokba (klaszterekbe) rendeződjenek, megakadályozva a vizuális zsúfoltságot.

A markerekre kattintva egy popup ablak jelenik meg a sport nevével, címével és további részleteivel. A `mapFocusId` állapot lehetővé teszi, hogy más oldalakról (pl. a katalógusból) közvetlenül a térképre navigáljunk egy adott sport helyszínéhez, amelyre a térkép automatikusan rázoomol.

### Sporttippek és Kvíz (`TipsPage.jsx`)

Egy edukációs tartalmakat megjelenítő oldal, amely hasznos sportolási tippeket, egészségügyi információkat és életmódbeli ajánlásokat tartalmaz. Az oldalba egy mini kvíz is beépült, amely a felhasználó sportolási tudását teszteli játékos formában.

### Felhasználói Profil (`ProfilePage.jsx`)

A bejelentkezett felhasználó profiladatait jeleníti meg:

* **Felhasználónév és email:** A regisztráció során megadott adatok.
* **Szerepkör:** A hozzáférési szint (user/admin) megjelenítése.
* **Regisztráció dátuma:** A fiók létrehozásának időpontja.
* **Bejelentkezési előzmények:** Az utolsó sikeres belépés időpontja és az összes belépési kísérlet száma (az admin API-ból nyerve, ha adminisztrátori hozzáférés áll rendelkezésre).

### Autentikáció (`AuthPage.jsx`)

A regisztráció és a bejelentkezés egyetlen oldalon, de két különálló módban (`?mode=signup` és `?mode=signin`) valósul meg. A URL query paraméter vezérli a megjelenített űrlapot, és a két mód között gördülékenyen lehet váltani.

**Regisztrációs űrlap tulajdonságai:**
* Valós idejű email-foglaltság ellenőrzés (debounced API hívás a háttérben).
* Jelszó megerősítés (kétszeres begépelés).
* Jelszavak láthatóságának be/kikapcsolása (szem ikon).
* Kliens- és szerveroldali validációs hibaüzenetek.

**Bejelentkezési űrlap tulajdonságai:**
* Felhasználónévvel VAGY email-lel is beléphet.
* Hibás adatok esetén általános hibaüzenet (nem árulja el, hogy a felhasználónév vagy a jelszó volt hibás – biztonsági szempontból fontos).

### Adminisztrációs Oldal (`AdminPage.jsx`)

Részletes leírás az [Admin Felület](admin-felulet) oldalon.

## Komponensek és Újrahasználhatóság

### Header (`Header.jsx`)

A navigációs fejléc tartalmazza a platform logóját/nevét, a főbb menüpontokat (Katalógus, Tippek, Sportkvíz, Térkép), valamint a felhasználói menüt (Bejelentkezés/Profil). A keresőmező a Headerbe integrált, és gépelés közben valós időben frissíti a szűrt tartalmat.

### Hero (`Hero.jsx`)

Egy vizuálisan hangsúlyos belépési banner, amely az aktuális napot és napszakot jeleníti meg (`"Szép keddi reggelt!"`), valós időben frissülő órával. Másodlagos navigációs gombok biztosítják a gyors elérést a legfontosabb funkciókhoz.

### Footer (`Footer.jsx`)

Az oldal láblécében a platform információi, a GitHub repo hivatkozása és egyéb hasznos linkek találhatók.

### SportsGrid (`SportsGrid.jsx`)

Egy újrahasználható sportkártya-rács komponens, amely a kapott szűrési paraméterek és a sport adatok alapján dinamikusan építi fel a megjelenítendő kártyákat. A kártyák hover-effektekkel, kedvenc-gombbal és azonnali részletnézettel rendelkeznek.

### Ticker (`Ticker.jsx`)

Egy animált, végtelenül futó szövegsáv (marquee), amely aktuális információkat, funkció-kiemeléseket vagy promóciós üzeneteket jelenít meg a felhasználóknak.
