# SportHub Backend

Node.js alapú REST API a sport lehetőségek kezeléséhez.

## 📁 Projekt Struktúra

```
backend/
├── Dockerfile              # Docker konténer
├── server.js               # Entry point
├── .env                    # Környezeti változók
├── package.json
├── src/
│   ├── app.js             # Fő server és route kezelők
│   ├── config/
│   │   └── db.js          # MySQL adatbázis konfig
│   ├── utils/
│   │   ├── helpers.js     # Hashing, JSON, Body parsing
│   │   ├── validators.js  # Validációs funkciók
│   │   └── mappers.js     # Adat transzformáció
│   ├── services/
│   │   ├── authService.js    # Felhasználó management
│   │   ├── sportsService.js  # Sport CRUD
│   │   ├── favoritesService.js
│   │   ├── registrationsService.js
│   │   └── adminService.js
│   └── routes/
│       ├── auth.js        # Auth végpontok
│       ├── sports.js      # Sport végpontok
│       ├── favorites.js
│       ├── registrations.js
│       └── admin.js
├── db_init/
│   ├── schema.mysql.sql   # Adatbázis séma
│   └── seed.sql           # Test adatok
└── API_REFERENCE.md       # API dokumentáció
```

## ⚙️ Telepítés & Futtatás

### 1. Node modulok telepítése
```bash
npm install
```

### 2. Adatbázis beállítása
```bash
# MySQL szükséges
mysql -u root -p < db_init/schema.mysql.sql
```

### 3. Környezeti változók (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sporthub
PORT=3001
ADMIN_EMAILS=admin@example.com
```

### 4. Szerver indítása
```bash
npm start
# vagy watch módban:
npm run dev
```

## 🐳 Docker-rel

```bash
docker build -t sporthub-api .
docker run -e DB_HOST=db -e DB_USER=root -e DB_PASSWORD=root -p 3001:3001 sporthub-api
```

## 📚 API Szakaszok

Lásd [API_REFERENCE.md](./API_REFERENCE.md) a teljes API dokumentációhoz.

### Fő Kategóriák:
- **🔐 Autentikáció** - Regisztrálás, bejelentkezés
- **🏃 Sportok** - CRUD operációk
- **❤️ Kedvencek** - Kedvencek kezelése
- **📝 Regisztrációk** - Sportokra regisztrálás
- **👥 Admin** - Admin funkciók, statisztikák

## 🔑 Autentikáció

Headers:
- `X-User-Email` - Felhasználó (általános műveletek)
- `X-Admin-Email` - Admin (admin műveletek)

Jelszó: scrypt hashing + salt

## 🗄️ Adatbázis

**Engine:** MySQL 8.0+

Fő táblák:
- `felhasznalo` - Felhasználók
- `sportlehetosegek` - Sportok
- `jelentkezes` - Regisztrációk
- `kedvenc` - Kedvencek
- `bejelentkezes` - Login logok

## 🧪 Tesztelés

### Postman/cURL próba

```bash
# Health check
curl http://localhost:3001/api/health

# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456"
  }'

# Sportok listázása
curl http://localhost:3001/api/sports

# Sport szűréssel
curl "http://localhost:3001/api/sports?city=Budapest&timeSlot=morning"
```

## 🛠️ Fejlesztés

### Új végpont hozzáadása

1. **Service** létrehozása: `src/services/newService.js`
2. **Route handler** hozzáadása: `src/routes/new.js`
3. **Route** importálása és regisztrálása: `src/app.js`-ben
4. Dokumentáció: `API_REFERENCE.md`-ben

### Hibakeresés

```bash
# Verbose output
DEBUG=* npm start
```

## 📦 Függőségek

- `mysql2` - MySQL kliens
- `node-crypto` - Hasítás
- Alapvetően csak Node stdlib

## 🚀 Deployment

### Production Build
```bash
npm install --production
NODE_ENV=production npm start
```

### Env Vars (Prod)
```env
DB_HOST=prod-db.example.com
DB_USER=prod_user
DB_PASSWORD=secure_password
DB_NAME=sporthub_prod
PORT=3001
ADMIN_EMAILS=admin@sporthub.hu
```

## 📝 Changelog

- v1.0.0 - Moduláris szerkezet, teljes API
  - Auth (signup, signin)
  - Sports CRUD
  - Favorites management
  - User registrations
  - Admin endpoints
  - Metadata endpoints

## 📄 Licenc

Projekt

## 👥 Support

Problémák? Jelezd az issus-t.
