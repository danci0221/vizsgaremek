---
id: projekt-attekintes
sidebar_position: 1
title: Projekt Áttekintés
---

# Projekt Áttekintés – A SportHub Története és Víziója

A SportHub egy modern, Full-Stack webalkalmazás, amelyet vizsgaremekként fejlesztettünk. A platform célja, hogy egyetlen átlátható felületen egyesítse a hazai sportolási lehetőségeket: edzőtermektől a szabadtéri futóprogramokig, teniszpályáktól a jógastúdiókig. A koncepció ötletét az a tapasztalat adta, hogy a sportolni vágyó emberek számára jelenleg nincs egy központi, megbízható forrás, ahol a különböző típusú sporttevékenységeket összehasonlíthatnák, szűrhetnék és közvetlenül jelentkezhetnének is rájuk.

## A Kiindulási Probléma és Motiváció

A mai Magyarországon a sportolási lehetőségek keresése rendkívül töredezett élmény. Aki edzőtermet keres, annak más platformot kell böngésznie, mint aki uszodát vagy csapatsportot keresne. A meglévő sportkereső oldalak számos közös problémával küzdenek:

1. **Szétszórt információ:** Az egyes sportlétesítmények és programok más-más weboldalakon, Facebook-csoportokban vagy Google Mapsen hirdetik magukat. Nincs egyetlen hely, ahol egy felhasználó minden releváns opciót megtalálna a közelében.
2. **Összehasonlíthatatlanság:** Még ha valaki megtalálja is a keresett sportot, az árak, nyitvatartások és helyszínek összehasonlítása külön kutatómunkát igényel, hiszen minden szolgáltató más formátumban jeleníti meg ezeket az adatokat.
3. **Személyre szabottság hiánya:** A legtöbb létező oldal egyszerű listákat kínál, anélkül, hogy figyelembe venné a felhasználó egyéni igényeit, mint például a preferált napszak, költségvetés vagy a sportág iránti érdeklődés.
4. **Elavult, nem reszponzív felületek:** Számos hazai sportportál a 2010-es évek dizájnját tükrözi, ami mobilon szinte használhatatlan élményt eredményez.

A SportHub ezekre a fájdalompontokra (pain points) kínál átfogó, Single Page Application (SPA) alapú megoldást. A platform használata mobilról és asztali gépről egyaránt kényelmes, és a háttérbe épített intelligens szűrési és ajánlási logika gondoskodik arról, hogy minden felhasználó gyorsan megtalálja a számára ideális sporttevékenységet.

## A Projekt Funkcionális és Nem-Funkcionális Célkitűzései

A fejlesztés megkezdése előtt a következő konkrét követelményrendszert állítottuk fel:

### Funkcionális Követelmények

* **Gazdag Sportkatalógus:** Részletes adatlapok minden sportlehetőséghez, beleértve a nevet, sportágat, kategóriát (pl. Edzőterem, Pálya, Uszoda, Stúdió), árképzést, korosztályi ajánlást, nyitvatartást, helyszíni címet és elérhetőséget. Az adatlapokat nagy felbontású, tematikus képek egészítik ki a vizuális vonzerő érdekében.
* **Többdimenziós Szűrés és Keresés:** A felhasználóknak lehetőséget kell biztosítani arra, hogy sportág, kategória, város, árkategória és napszak (reggel, délután, este, hétvége) szerint szűrjék a katalógust. Emellett egy szabad szöveges keresőmotor is szükséges, amely a sport nevében és leírásában is keres.
* **Felhasználói Fiókok és Hitelesítés:** Regisztrációs és bejelentkezési rendszer, amelyben a felhasználók adatai (különösen a jelszavaik) a legmagasabb biztonsági sztenderdek szerint vannak kezelve. A rendszer „user" és „admin" szerepköröket különböztet meg.
* **Kedvencek Rendszere:** A bejelentkezett felhasználók elmenthetik a számukra érdekes sportokat egy személyes kedvencek listájára. Ennek szinkronizáltnak kell lennie a szerveren és a böngésző lokális tárhelyén (localStorage) egyaránt, biztosítva az offline-online konzisztenciát.
* **Jelentkezések Kezelése:** A felhasználóknak lehetőséget kell adni arra, hogy közvetlenül a platformon jelentkezzenek egy sporttevékenységre, és szükség esetén le is mondhassák azt. A rendszernek meg kell akadályoznia a dupla jelentkezéseket.
* **Sportkvíz (Ajánlórendszer):** Egy interaktív kvíz modul, amely a felhasználó által megadott preferenciák (beltéri/kültéri, csapat/egyéni, költségvetés, intenzitás, napszak) alapján gépi logikával rangsorolja és ajánlja a legmegfelelőbb sporttevékenységeket.
* **Interaktív Térkép:** A sporthelyszínek megjelenítése egy Leaflet.js alapú interaktív térképen, koordináta-pontokkal és klaszterezéssel (marker clustering), lehetőséget biztosítva a helyszínek gyors vizuális áttekintésére.
* **Összehasonlító Eszköz:** Legfeljebb három sportlehetőség egymás melletti, táblázatos összehasonlítása az árak, helyszínek és egyéb paraméterek alapján.
* **Adminisztrációs Felület:** Egy dedikált, védett vezérlőpult a rendszergazdák számára, amelyen teljes körű CRUD (Create, Read, Update, Delete) műveleteket végezhetnek a sportokon, kezelhetik a felhasználói fiókokat, és áttekinthetik a jelentkezéseket.

### Nem-Funkcionális Követelmények

* **Teljesítmény:** Az alkalmazásnak kevesebb mint 2 másodperc alatt be kell töltenie a főoldalt közepes sávszélességű hálózaton.
* **Biztonság:** A jelszavak kriptográfiai hash-eléssel (scrypt) kerülnek tárolásra. Az admin végpontokat szerepkör-alapú hozzáférés-szabályozás (RBAC) védi.
* **Hordozhatóság:** A teljes rendszernek Docker konténerekből kell futnia, biztosítva a fejlesztői és éles környezet azonosságát.
* **Karbantarthatóság:** A kód moduláris, rétegezett architektúrát követ (Routes, Services, Utils), lehetővé téve az egyes komponensek független fejlesztését és tesztelését.
* **Tesztelhetőség:** A rendszerhez automatizált egység- (Vitest) és végponttól végpontig terjedő (Selenium) tesztek tartoznak.

## A Felhasznált Technológiai Stack Összefoglalása

| Réteg         | Technológia                                  |
| ------------- | -------------------------------------------- |
| Adatbázis     | MySQL 8.4, InnoDB, utf8_hungarian_ci         |
| Backend       | Node.js, Express.js 4.x, mysql2              |
| Frontend      | React 19, Vite (Rolldown), React Router v7   |
| Térkép        | Leaflet.js, leaflet.markercluster            |
| Biztonság     | scrypt (Node.js crypto), RBAC, Helmet.js     |
| Tesztelés     | Vitest (backend), Selenium WebDriver (E2E)   |
| Konténerizáció| Docker, Docker Compose                       |
| Verziókezelés | Git, GitHub                                  |

Összességében a SportHub projekt nem csupán egy dinamikus weboldal, hanem egy komplex szoftverrendszer, amely bemutatja a Full-Stack fejlesztés, az adatbázistervezés, a konténerizáció és az automatizált minőségbiztosítás területén szerzett ismereteinket. A következő oldalakon részletesen bemutatjuk a csapatmunkát, a telepítési lépéseket, az architektúra egyes rétegeit és a minőségbiztosítási stratégiát.
