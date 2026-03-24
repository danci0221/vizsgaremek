import { readBody, json, normalizeHeaderValue } from "../utils/helpers.js";
import { listFavorites, addFavorite, removeFavorite, isFavorite } from "../services/favoritesService.js";
import { sportExists } from "../services/sportsService.js";
import { findUserIdByEmail } from "../services/authService.js";

export async function handleFavoritesRoutes(req, res, pathname, fullUrl) {
  if (pathname === "/api/favorites" && req.method === "GET") {
    try {
      const userEmail = normalizeHeaderValue(req.headers["x-user-email"]);
      const userId = await findUserIdByEmail(userEmail);
      if (!userId) return json(res, 401, { message: "Bejelentkezés szükséges." });

      const favorites = await listFavorites(userId);
      return json(res, 200, { favorites });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  if (pathname === "/api/favorites" && req.method === "POST") {
    try {
      const userEmail = normalizeHeaderValue(req.headers["x-user-email"]);
      const userId = await findUserIdByEmail(userEmail);
      if (!userId) return json(res, 401, { message: "Bejelentkezés szükséges." });

      const body = await readBody(req);
      const sportId = Number(body.sportId);
      if (!Number.isInteger(sportId)) {
        return json(res, 400, { message: "Érvénytelen sportazonosító." });
      }

      if (!(await sportExists(sportId))) {
        return json(res, 404, { message: "A sportlehetőség nem található." });
      }

      await addFavorite(userId, sportId);
      return json(res, 201, { ok: true });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  const favoriteMatch = pathname.match(/^\/api\/favorites\/(\d+)$/);
  if (favoriteMatch && req.method === "DELETE") {
    try {
      const userEmail = normalizeHeaderValue(req.headers["x-user-email"]);
      const userId = await findUserIdByEmail(userEmail);
      if (!userId) return json(res, 401, { message: "Bejelentkezés szükséges." });

      const sportId = Number(favoriteMatch[1]);
      if (!Number.isInteger(sportId)) {
        return json(res, 400, { message: "Érvénytelen sportazonosító." });
      }

      await removeFavorite(userId, sportId);
      res.writeHead(204, { "Access-Control-Allow-Origin": "*" });
      return res.end();
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  const favStatusMatch = pathname.match(/^\/api\/favorites\/(\d+)\/status$/);
  if (favStatusMatch && req.method === "GET") {
    try {
      const userEmail = normalizeHeaderValue(req.headers["x-user-email"]);
      const userId = await findUserIdByEmail(userEmail);
      if (!userId) return json(res, 401, { message: "Bejelentkezés szükséges." });

      const sportId = Number(favStatusMatch[1]);
      const isFav = await isFavorite(userId, sportId);
      return json(res, 200, { isFavorite: isFav });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  return false;
}
