import { readBody, json, normalizeHeaderValue } from "../utils/helpers.js";
import { validateSportPayload } from "../utils/validators.js";
import {
  listSports,
  getSportById,
  sportExists,
  createSport,
  updateSport,
  deleteSport,
  searchSports,
} from "../services/sportsService.js";
import { isAdminEmail, findUserIdByEmail } from "../services/authService.js";

export async function handleSportsRoutes(req, res, pathname, fullUrl) {
  const url = new URL(`http://localhost${fullUrl}`);

  if (pathname === "/api/sports" && req.method === "GET") {
    try {
      const searchParams = {
        sportType: url.searchParams.get("sportType"),
        category: url.searchParams.get("category"),
        city: url.searchParams.get("city"),
        timeSlot: url.searchParams.get("timeSlot"),
        maxPrice: url.searchParams.get("maxPrice"),
      };

      // Remove null/undefined values
      Object.keys(searchParams).forEach((key) => searchParams[key] === null && delete searchParams[key]);

      const sports = Object.keys(searchParams).length > 0 ? await searchSports(searchParams) : await listSports();

      return json(res, 200, sports);
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  if (pathname === "/api/sports" && req.method === "POST") {
    try {
      const creatorEmail = normalizeHeaderValue(req.headers["x-admin-email"]);
      if (!(await isAdminEmail(creatorEmail))) {
        return json(res, 403, { message: "Nincs jogosultságod sporthelyet létrehozni." });
      }

      const body = await readBody(req);
      const validationError = validateSportPayload(body);
      if (validationError) return json(res, 400, { message: validationError });

      const creatorUserId = await findUserIdByEmail(creatorEmail);
      const created = await createSport(body, creatorUserId);
      return json(res, 201, created);
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  const sportIdMatch = pathname.match(/^\/api\/sports\/(\d+)$/);
  if (sportIdMatch) {
    const id = Number(sportIdMatch[1]);

    if (req.method === "GET") {
      try {
        const sport = await getSportById(id);
        if (!sport) return json(res, 404, { message: "A sportlehetőség nem található." });
        return json(res, 200, sport);
      } catch (error) {
        return json(res, 500, { message: error.message });
      }
    }

    if (req.method === "PUT") {
      try {
        const editorEmail = normalizeHeaderValue(req.headers["x-admin-email"]);
        if (!(await isAdminEmail(editorEmail))) {
          return json(res, 403, { message: "Nincs jogosultságod sporthelyet módosítani." });
        }

        const body = await readBody(req);
        const validationError = validateSportPayload(body);
        if (validationError) return json(res, 400, { message: validationError });

        const updated = await updateSport(id, body);
        if (!updated) return json(res, 404, { message: "A sportlehetőség nem található." });

        return json(res, 200, updated);
      } catch (error) {
        return json(res, 500, { message: error.message });
      }
    }

    if (req.method === "DELETE") {
      try {
        const deleterEmail = normalizeHeaderValue(req.headers["x-admin-email"]);
        if (!(await isAdminEmail(deleterEmail))) {
          return json(res, 403, { message: "Nincs jogosultságod sporthelyet törölni." });
        }

        const ok = await deleteSport(id);
        if (!ok) return json(res, 404, { message: "A sportlehetőség nem található." });

        res.writeHead(204, {
          "Access-Control-Allow-Origin": "*",
        });
        return res.end();
      } catch (error) {
        return json(res, 500, { message: error.message });
      }
    }
  }

  return false;
}
