---
id: admin-felulet
sidebar_position: 8
title: Admin Vezérlőpult
---

# Adminisztrációs Vezérlőpult (Admin Dashboard)

A SportHub platform tartalmának és felhasználóinak hosszú távú menedzseléséhez elengedhetetlen egy professzionális adminisztrációs felület. Ahelyett, hogy a rendszergazdák közvetlenül SQL parancsokkal vagy phpMyAdminnal manipulálnák az adatbázist, a SportHub egy integrált, a React alkalmazásba épített **Admin Dashboard** (`AdminPage.jsx`) oldalt biztosít, amely a `/admin` útvonalon érhető el.

## Hozzáférés-szabályozás és Biztonság (RBAC)

Az Admin oldalra kizárólag azokkal a fiókokkal lehet belépni, amelyek `admin` szerepkörrel rendelkeznek. A hozzáférés-ellenőrzés több szinten működik:

### Kliensoldali Védelem (Frontend)

Az `App.jsx`-ben a `isAdmin` derived állapot (`authUser?.role === 'admin'`) vezérli, hogy az Admin menüpont megjelenik-e a navigációban, és hogy az admin oldal tartalma renderelődik-e. Ha egy normál felhasználó manuálisan a `/admin` URL-re navigál, az oldal nem jelenít meg semmilyen adminisztrációs funkciót, és az API kérések sem jutnak el a háttérrendszerig.

### Szerveroldali Védelem (Backend)

A valódi biztonsági réteget a backend biztosítja. Minden admin API végpont (`/api/admin/*`) megkövetelik az `X-Admin-Email` HTTP fejlécet. A `isAdminEmail()` függvény kétféle ellenőrzési módot támogat:

1. **Allowlist mód:** Ha az `ADMIN_EMAILS` környezeti változó be van állítva, kizárólag az abban felsorolt email-címek kapnak admin hozzáférést, az adatbázis `szerepkor` mezőjétől függetlenül. Ez a legbiztonságosabb üzemmód éles környezetben.
2. **Adatbázis mód (alapértelmezett):** Ha nincs `ADMIN_EMAILS` beállítva, a rendszer a `felhasznalo` tábla `szerepkor` oszlopát tekinti mérvadónak. A `resolveUserRole()` függvény dönti el véglegesen a felhasználó hatékony szerepkörét.

:::info Alapértelmezett Admin Fiók
A fejlesztői és tesztelői használatra egy előre beállított adminisztrátori fiók áll rendelkezésre:
- **Email:** `admin@sporthub.hu`
- **Jelszó:** `admin`
:::

## Az Admin Dashboard Fő Moduljai

Az adminisztrációs felület logikailag több fülre/szekció osztott, amelyek a következő funkcionalitásokat fedik le:

### 1. Felhasználók Áttekintése és Kezelése

Ez a modul a platform teljes regisztrált felhasználói bázisát jeleníti meg egy átlátható, táblázatos formában. Az `adminService.listUsersForAdmin()` függvény egy komplex SQL lekérdezést hajt végre, amely a `felhasznalo` tábla alapadatai mellé LEFT JOIN-nal csatolja a `bejelentkezes` tábla összesítő statisztikáit.

Minden felhasználóhoz az alábbi információk jelennek meg:

| Mező | Leírás |
| ---- | ------ |
| **ID** | Egyedi adatbázis azonosító |
| **Felhasználónév** | A regisztrációkor megadott felhasználónév |
| **Email** | A felhasználó email-címe |
| **Szerepkör** | `user` vagy `admin` |
| **Regisztráció dátuma** | A fiók létrehozásának időpontja |
| **Bejelentkezések száma** | Az összes bejelentkezési kísérlet (sikeres és sikertelen) összege |
| **Utolsó sikeres belépés** | Az utolsó sikeres autentikáció időbélyege |

Az adminisztrátor a felhasználói fiókokat **törölheti** a rendszerből. A törlés egy DELETE API hívást indít (`/api/admin/users/:id`), amely az adatbázis `ON DELETE CASCADE` szabályainak köszönhetően automatikusan eltávolítja a felhasználóhoz kapcsolódó kedvenceket, jelentkezéseket és bejelentkezési naplóbejegyzéseket is.

### 2. Sportkatalógus Kezelés (Teljes CRUD)

Ez a modul a platform „motorházteteje" – egy komplex, CRUD (Create-Read-Update-Delete) műveleteket támogató interfész a sportolási lehetőségek kezeléséhez.

#### Új Sportlehetőség Feltöltése (Create)

Az adminisztrátor egy részletes űrlap segítségével töltheti fel a sportokat. Az űrlap mezői a `sportlehetosegek` tábla oszlopaival korrelálnak:

* **Név:** A sport megnevezése (kötelező).
* **Sportág:** A sportág típusa, szabadon megadható (ha még nem létezik, a backend automatikusan létrehozza a `sportag` táblában).
* **Kategória:** A helyszín típusa (Edzőterem, Pálya stb.), szintén dinamikusan bővülő.
* **Város és Cím:** A helyszín adatai (a backend automatikusan kezeli a `helyszin` tábla rekordját).
* **Ár:** Forintban megadva (0 = ingyenes).
* **Napszak:** Reggel / Délután / Este / Hétvége (ENUM választó).
* **Nyitvatartás:** Szöveges mező (pl. „H-P 06:00-22:00, Szo-V 08:00-20:00").
* **Kapcsolat:** Elérhetőségi információ (telefon, email).
* **Leírás:** Részletes szöveges leírás a tevékenységről.
* **Kép URL:** A borítókép elérési címe (pl. Unsplash URL).
* **GPS Koordináták:** Opcionális szélességi és hosszúsági fokértékek a térkép modulhoz.

Az űrlap kliens- és szerveroldali validáción is átesik. A backend `validateSportPayload()` funkciója ellenőrzi, hogy az összes kötelező mező ki van-e töltve, és hogy a napszak értéke érvényes ENUM érték-e.

#### Meglévő Sportok Szerkesztése (Update)

Az adminisztrátor a sportlista bármelyik elemét kiválaszthatja szerkesztésre. Ilyenkor az űrlap a meglévő adatokkal előre kitöltve jelenik meg. A mentés a `PUT /api/sports/:id` végponton keresztül történik, tranzakcióval védett adatbázis-művelet formájában.

#### Sportok Törlése (Delete)

A törlés gomb egy `DELETE /api/sports/:id` API kérést indít. A `sportlehetosegek` tábla `ON DELETE CASCADE` idegen kulcs szabályai automatikusan eltávolítják a kapcsolódó kedvenc- és jelentkezés-rekordokat is.

### 3. Jelentkezések Áttekintése

Az admin felületen lehetőség van a platform teljes jelentkezési bázisának megtekintésére. A `/api/admin/registrations` végpont egy részletes nézetet ad, amely tartalmazza:

* A jelentkező felhasználó nevét és email-jét
* A sport nevét, típusát és helyszínét
* A jelentkezés állapotát (aktív / lemondva)
* A jelentkezés időpontját

Ez a nézet lehetővé teszi az adminisztrátornak, hogy áttekintse a platform felhasználási mintáit és szükség esetén beavatkozzon (pl. egy sportlehetőséghez tartozó összes jelentkezés menedzsment).

### 4. Rendszerstatisztikák

A `/api/admin/stats` végpont összesítő számokat szolgáltat:

| Metrika | Leírás |
| ------- | ------ |
| **Összes felhasználó** | A `felhasznalo` tábla rekord-száma |
| **Összes sport** | A `sportlehetosegek` tábla rekord-száma |
| **Összes jelentkezés** | A `jelentkezes` tábla teljes rekord-száma |
| **Aktív jelentkezések** | Csak az `allapot = 'aktiv'` rekordok száma |

Ezek a statisztikák az admin dashboard fejlécében vagy összesítő kártyákon jelennek meg, azonnali áttekintést nyújtva a platform állapotáról.

### 5. Referencia-adatok Kezelése

Az adminisztrátor lekérdezheti a rendszerben meglévő referencia-adatokat:

* **Kategóriák listája** (`/api/admin/categories`): Az összes sportkategória (pl. Edzőterem, Pálya).
* **Sportágak listája** (`/api/admin/sport-types`): Az összes sportág (pl. Úszás, Futás).
* **Helyszínek listája** (`/api/admin/locations`): Az összes regisztrált helyszín (város, cím).
* **Szervezők listája** (`/api/admin/organizers`): Az összes szervező entitás névvel, elérhetőségekkel.

Ezek az adatok segítik az adminisztrátort a sport-feltöltési űrlap kitöltésében és a meglévő adatok konzisztenciájának ellenőrzésében.
