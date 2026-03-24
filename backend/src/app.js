import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ensureDatabaseSchema, waitForDatabase } from './config/db.js';
import { handleAuthRoutes } from './routes/auth.js';
import { handleSportsRoutes } from './routes/sports.js';
import { handleFavoritesRoutes } from './routes/favorites.js';
import { handleRegistrationsRoutes } from './routes/registrations.js';
import { handleAdminRoutes } from './routes/admin.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// 🔧 Middleware-ek
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Admin-Email', 'X-User-Email'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🏥 Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// � Catch-all route handler
app.all('*', async (req, res) => {
  // Construct URL with query parameters for route handlers
  let fullUrl = req.path;
  const queryString = new URLSearchParams(req.query).toString();
  if (queryString) {
    fullUrl = `${req.path}?${queryString}`;
  }
  
  let handled = false;

  // Auth Routes
  if (req.path.startsWith('/api/auth')) {
    handled = await handleAuthRoutes(req, res, req.path, fullUrl);
    if (handled !== false) return;
  }

  // Sports Routes
  if (req.path.startsWith('/api/sports')) {
    handled = await handleSportsRoutes(req, res, req.path, fullUrl);
    if (handled !== false) return;
  }

  // Favorites Routes
  if (req.path.startsWith('/api/favorites')) {
    handled = await handleFavoritesRoutes(req, res, req.path, fullUrl);
    if (handled !== false) return;
  }

  // Registrations Routes
  if (req.path.startsWith('/api/registrations')) {
    handled = await handleRegistrationsRoutes(req, res, req.path, fullUrl);
    if (handled !== false) return;
  }

  // Admin Routes
  if (req.path.startsWith('/api/admin')) {
    handled = await handleAdminRoutes(req, res, req.path, fullUrl);
    if (handled !== false) return;
  }

  // If nothing matched, return 404
  res.status(404).json({ message: 'Végpont nem található.' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Szerver hiba történt.' });
});

async function startServer() {
  try {
    await waitForDatabase();
    const migrated = await ensureDatabaseSchema();
    if (migrated) {
      console.log('Adatbazis schema frissitve lett a kompatibilitashoz.');
    }

    app.listen(PORT, () => {
      console.log(`SportHub API fut: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Adatbazis kapcsolat sikertelen:', error.message);
    process.exit(1);
  }
}

startServer();

export default app;
