# SportHub API Referencia

## Szerkezet
A backend moduláris szerkezettel van szervezve az `src/` könyvtárban:

```
src/
├── app.js              # Fő server fájl
├── config/
│   └── db.js           # Adatbázis konfigurációja
├── utils/
│   ├── helpers.js      # Segédfunkciók (hasítás, validáció, Response)
│   ├── validators.js   # Validációs funkciók
│   └── mappers.js      # Adat-mapping funkciók
├── services/
│   ├── authService.js  # Autentikáció  
│   ├── sportsService.js    # Sportok kezelése
│   ├── favoritesService.js # Kedvencek kezelése
│   ├── registrationsService.js # Regisztrációk kezelése
│   └── adminService.js  # Admin funkciók
└── routes/
    ├── auth.js         # Auth végpontok
    ├── sports.js       # Sport végpontok
    ├── favorites.js    # Favorites végpontok
    ├── registrations.js # Registration végpontok
    └── admin.js        # Admin végpontok
```

---

## 🔐 Autentikáció Végpontok

### POST `/api/auth/signup`
Új felhasználó regisztrálása.

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Válasz (201):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "registeredAt": "2024-03-17T10:30:00Z"
  }
}
```

---

### POST `/api/auth/signin`
Bejelentkezés a rendszerbe.

**Body:**
```json
{
  "identifier": "john_doe",  // vagy email
  "password": "SecurePass123"
}
```

**Válasz (200):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "registeredAt": "2024-03-17T10:30:00Z"
  }
}
```

---

### GET `/api/auth/check-email?email=john@example.com`
Email elérhetőségének ellenőrzése.

**Válasz (200):**
```json
{
  "exists": false
}
```

---

## 🏃 Sport Végpontok

### GET `/api/sports`
Az összes sport listázása (szűréssel lehetséges).

**Query Paraméterek:**
- `sportType` - Sportág szűrése (opcionális)
- `category` - Kategória szűrése (opcionális)
- `city` - Város szerinti szűrés (opcionális)
- `timeSlot` - Idő szűrése: `morning`, `afternoon`, `evening`, `weekend` (opcionális)
- `maxPrice` - Maximum ár szűrése (opcionális)

**Válasz (200):**
```json
[
  {
    "id": 1,
    "name": "Edzés a parkban",
    "sportType": "Futás",
    "category": "Fitness",
    "location": "Budapest",
    "address": "Városmajor 1.",
    "price": 0,
    "priceLabel": "Ingyenes",
    "timeSlot": "morning",
    "openingHours": "06:00-08:00",
    "contact": "info@example.com",
    "description": "Reggeli futó edzés",
    "image": "https://example.com/image.jpg"
  }
]
```

---

### GET `/api/sports/:id`
Egy sport részletes megtekintése.

**Válasz (200):** Egy sport objektum (mint fent)

---

### POST `/api/sports`
Új sport létrehozása. **(Admin csak)**

**Headers:**
- `X-Admin-Email`: Admin email

**Body:**
```json
{
  "name": "Edzés a parkban",
  "sportType": "Futás",
  "category": "Fitness",
  "location": "Budapest",
  "address": "Városmajor 1.",
  "price": 0,
  "timeSlot": "morning",
  "openingHours": "06:00-08:00",
  "contact": "info@example.com",
  "description": "Reggeli futó edzés",
  "image": "https://example.com/image.jpg"
}
```

**Válasz (201):** Létrehozott sport objektum

---

### PUT `/api/sports/:id`
Sport módosítása. **(Admin csak)**

**Headers:**
- `X-Admin-Email`: Admin email

**Body:** Mint POST-nál

**Válasz (200):** Módosított sport objektum

---

### DELETE `/api/sports/:id`
Sport törlése. **(Admin csak)**

**Headers:**
- `X-Admin-Email`: Admin email

**Válasz (204):** Nincs tartalom

---

## ❤️ Kedvenc Végpontok

### GET `/api/favorites`
Felhasználó kedvenceinek listája (sport ID-k).

**Headers:**
- `X-User-Email`: Felhasználó emaile

**Válasz (200):**
```json
{
  "favorites": [1, 3, 5]
}
```

---

### POST `/api/favorites`
Sportot hozzáadása kedvencekhez.

**Headers:**
- `X-User-Email`: Felhasználó emaile

**Body:**
```json
{
  "sportId": 1
}
```

**Válasz (201):**
```json
{
  "ok": true
}
```

---

### DELETE `/api/favorites/:sportId`
Sport eltávolítása kedvencekből.

**Headers:**
- `X-User-Email`: Felhasználó emaile

**Válasz (204):** Nincs tartalom

---

### GET `/api/favorites/:sportId/status`
Sport kedvenc státusza ellenőrzése.

**Headers:**
- `X-User-Email`: Felhasználó emaile

**Válasz (200):**
```json
{
  "isFavorite": true
}
```

---

## 📝 Regisztráció Végpontok

### GET `/api/registrations`
Felhasználó regisztrációinak listája.

**Headers:**
- `X-User-Email`: Felhasználó emaile

**Válasz (200):**
```json
{
  "registrations": [
    {
      "id": 1,
      "sportId": 1,
      "sportName": "Edzés a parkban",
      "sportType": "Futás",
      "location": "Budapest",
      "address": "Városmajor 1.",
      "price": 0,
      "priceLabel": "Ingyenes",
      "timeSlot": "morning",
      "openingHours": "06:00-08:00",
      "contact": "info@example.com",
      "image": "https://example.com/image.jpg",
      "status": "aktiv",
      "registeredAt": "2024-03-17T10:30:00Z"
    }
  ]
}
```

---

### POST `/api/registrations`
Sportára regisztrálás.

**Headers:**
- `X-User-Email`: Felhasználó emaile

**Body:**
```json
{
  "sportId": 1
}
```

**Válasz (201):** Regisztráció objektum (mint GET-nál)

---

### GET `/api/registrations/:id`
Egy regisztráció megtekintése.

**Headers:**
- `X-User-Email`: Felhasználó emaile

**Válasz (200):** Regisztráció objektum

---

### DELETE `/api/registrations/:id`
Regisztráció lemondása.

**Headers:**
- `X-User-Email`: Felhasználó emaile

**Válasz (204):** Nincs tartalom

---

### GET `/api/registrations/stats`
Regisztrációs statisztika (felhasználó saját).

**Headers:**
- `X-User-Email`: Felhasználó emaile

**Válasz (200):**
```json
{
  "total_registrations": 5,
  "active_registrations": 3,
  "cancelled_registrations": 2
}
```

---

## 👥 Admin Végpontok

### GET `/api/admin/users`
Összes felhasználó listázása. **(Admin csak)**

**Headers:**
- `X-Admin-Email`: Admin email

**Válasz (200):**
```json
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "admin",
      "registeredAt": "2024-03-17T10:30:00Z",
      "loginCount": 15,
      "lastSuccessfulLoginAt": "2024-03-17T14:20:00Z"
    }
  ]
}
```

---

### GET `/api/admin/registrations`
Összes regisztráció (összes felhasználótól). **(Admin csak)**

**Headers:**
- `X-Admin-Email`: Admin email

**Válasz (200):**
```json
{
  "registrations": [
    {
      "id": 1,
      "userId": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "sportId": 1,
      "sportName": "Edzés a parkban",
      "sportType": "Futás",
      "location": "Budapest",
      "address": "Városmajor 1.",
      "price": 0,
      "priceLabel": "Ingyenes",
      "timeSlot": "morning",
      "openingHours": "06:00-08:00",
      "contact": "info@example.com",
      "image": "https://example.com/image.jpg",
      "status": "aktiv",
      "registeredAt": "2024-03-17T10:30:00Z"
    }
  ]
}
```

---

### GET `/api/admin/metadata/categories`
Összes kategória. **(Admin csak)**

**Válasz (200):**
```json
{
  "categories": [
    { "id": 1, "name": "Fitness" },
    { "id": 2, "name": "Team Sports" }
  ]
}
```

---

### GET `/api/admin/metadata/sport-types`
Összes sportág. **(Admin csak)**

**Válasz (200):**
```json
{
  "sportTypes": [
    { "id": 1, "name": "Futás" },
    { "id": 2, "name": "Futball" }
  ]
}
```

---

### GET `/api/admin/metadata/locations`
Összes helyszín. **(Admin csak)**

**Válasz (200):**
```json
{
  "locations": [
    { "id": 1, "city": "Budapest", "address": "Városmajor 1." },
    { "id": 2, "city": "Szeged", "address": "Széchenyi tér 1." }
  ]
}
```

---

### GET `/api/admin/metadata/organizers`
Összes szervező. **(Admin csak)**

**Válasz (200):**
```json
{
  "organizers": [
    {
      "id": 1,
      "name": "SportHub Org",
      "phone": "+36201234567",
      "email": "info@sporthub.hu",
      "website": "https://sporthub.hu"
    }
  ]
}
```

---

### GET `/api/admin/metadata`
Összes metaadat egy kérésben. **(Admin csak)**

**Válasz (200):**
```json
{
  "metadata": {
    "categories": [...],
    "sportTypes": [...],
    "locations": [...],
    "organizers": [...]
  }
}
```

---

### GET `/api/admin/stats`
Admin statisztikák. **(Admin csak)**

**Válasz (200):**
```json
{
  "totalUsers": 25,
  "totalSports": 15,
  "totalRegistrations": 120,
  "activeRegistrations": 80
}
```

---

## 🔧 Általános API Információk

### Hibakezelés

**400 - Bad Request:**
```json
{
  "message": "Hiányzó mező: name"
}
```

**401 - Unauthorized:**
```json
{
  "message": "Bejelentkezés szükséges."
}
```

**403 - Forbidden:**
```json
{
  "message": "Nincs jogosultságod."
}
```

**404 - Not Found:**
```json
{
  "message": "A sportlehetőség nem található."
}
```

**409 - Conflict:**
```json
{
  "message": "Már regisztrált vagy erre a sportra."
}
```

**500 - Internal Server Error:**
```json
{
  "message": "Adatbázis kapcsolat sikertelen."
}
```

### CORS Headers

Minden response tartalmazza:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, X-Admin-Email, X-User-Email`

### Health Check

```
GET /api/health
```

**Válasz (200):**
```json
{
  "ok": true
}
```

---

## 📌 Autentikáció Headers

- **User:** `X-User-Email` - Bejelentkezett felhasználó emaile
- **Admin:** `X-Admin-Email` - Admin felhasználó emaile

---

## 🗄️ Adatbázis Táblák

- **felhasznalo** - Felhasználók
- **bejelentkezes** - Bejelentkezési események
- **sportlehetosegek** - Sportok
- **sportag** - Sportágak
- **kategoria** - Kategóriák
- **helyszin** - Helyszínek
- **szervezo** - Szervezők
- **jelentkezes** - Regisztrációk
- **kedvenc** - Kedvencek

---

## ✅ Validációs Szabályok

### Felhasználó
- **Username:** minimum 3 karakter
- **Email:** érvényes email formátum
- **Jelszó:** minimum 6 karakter

### Sport
- **Szükséges mezők:** name, sportType, category, location, address, timeSlot, openingHours, contact, description, image
- **timeSlot:** morning, afternoon, evening, weekend

### Regisztrációs Statusz
- **aktiv** - Aktív regisztráció
- **lemondva** - Lemondott regisztráció
