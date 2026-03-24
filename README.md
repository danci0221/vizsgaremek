# SportHub

Sportlehetoseg nyilvantarto React frontenddel es Node.js API-val.
A projekt mar nem SQLite-ot hasznal: az adatbazis MySQL, Dockerben fut.

## Mappaszerkezet
- `Frontend/`: Vite + React kliens.
- `backend/`: Node.js API.
- `db_init/`: MySQL schema + seed SQL.
- `docker-compose.yml`: Docker Compose (MySQL + phpMyAdmin).

## Adatbazis inditasa (Docker Desktop)
Elotte legyen elinditva a Docker Desktop.

```bash
npm run docker:db:up
```

Ez elinditja:
- MySQL: `localhost:3307`
- phpMyAdmin: `http://localhost:8082`

Leallitas:
```bash
npm run docker:db:down
```

Teljes reset (volume torles):
```bash
npm run docker:db:reset
```

Fontos: sema valtozas utan futtasd ujra a `npm run docker:db:reset` majd `npm run docker:db:up` parancsokat, mert a `db_init` SQL csak ures volume eseten fut automatikusan.

## API konfiguracio
Az API a kovetkezo env valtozokat hasznalja (defaultokkal):
- `DB_HOST` (`127.0.0.1`)
- `DB_PORT` (`3307`)
- `DB_USER` (`appuser`)
- `DB_PASSWORD` (`apppw`)
- `DB_NAME` (`sporthub`)
- `PORT` (`3001`)
- `ADMIN_EMAILS` (opcionalis, vesszovel elvalasztott lista). Ha meg van adva, csak ezek az emailek kapnak admin jogot.

## Fejlesztoi inditas
1. Eloszor adatbazis:
```bash
npm run docker:db:up
```
2. Frontend + API:
```bash
npm run dev:full
```

Kulon-kulon is:
```bash
npm run server
npm run dev
```

## SQL fajlok
- `db_init/schema.mysql.sql`: MySQL tabla definiciok.
- `db_init/seed.sql`: alap mintaadatok.

## Megjegyzes
- A frontend fejlesztesben `/api` proxyn keresztul eri el az API-t.
- Ha az API nem erheto el, a frontend fallbackkent a `Frontend/src/data/Sports.json` mintaadatot hasznalja.
