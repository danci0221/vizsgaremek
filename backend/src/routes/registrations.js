import { readBody, json, normalizeHeaderValue } from "../utils/helpers.js";
import {
  listRegistrations,
  createRegistration,
  cancelRegistration,
  getRegistrationById,
  getRegistrationStats,
} from "../services/registrationsService.js";
import { sportExists } from "../services/sportsService.js";
import { findUserIdByEmail } from "../services/authService.js";

export async function handleRegistrationsRoutes(req, res, pathname, fullUrl) {
  if (pathname === "/api/registrations" && req.method === "GET") {
    try {
      const userEmail = normalizeHeaderValue(req.headers["x-user-email"]);
      const userId = await findUserIdByEmail(userEmail);
      if (!userId) return json(res, 401, { message: "Bejelentkezés szükséges." });

      const registrations = await listRegistrations(userId);
      return json(res, 200, { registrations });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  if (pathname === "/api/registrations" && req.method === "POST") {
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

      const result = await createRegistration(userId, sportId);
      if (result.error) {
        return json(res, 409, { message: result.error });
      }

      return json(res, 201, result);
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  const registrationIdMatch = pathname.match(/^\/api\/registrations\/(\d+)$/);
  if (registrationIdMatch) {
    const registrationId = Number(registrationIdMatch[1]);

    if (req.method === "GET") {
      try {
        const userEmail = normalizeHeaderValue(req.headers["x-user-email"]);
        const userId = await findUserIdByEmail(userEmail);
        if (!userId) return json(res, 401, { message: "Bejelentkezés szükséges." });

        const registration = await getRegistrationById(userId, registrationId);
        if (!registration) return json(res, 404, { message: "A regisztráció nem található." });

        return json(res, 200, registration);
      } catch (error) {
        return json(res, 500, { message: error.message });
      }
    }

    if (req.method === "DELETE") {
      try {
        const userEmail = normalizeHeaderValue(req.headers["x-user-email"]);
        const userId = await findUserIdByEmail(userEmail);
        if (!userId) return json(res, 401, { message: "Bejelentkezés szükséges." });

        const ok = await cancelRegistration(userId, registrationId);

        if (!ok) {
          return json(res, 404, { message: "A regisztráció nem található." });
        }

        res.writeHead(204, { "Access-Control-Allow-Origin": "*" });
        return res.end();
      } catch (error) {
        return json(res, 500, { message: error.message });
      }
    }
  }

  if (pathname === "/api/registrations/stats" && req.method === "GET") {
    try {
      const userEmail = normalizeHeaderValue(req.headers["x-user-email"]);
      const userId = await findUserIdByEmail(userEmail);
      if (!userId) return json(res, 401, { message: "Bejelentkezés szükséges." });

      const stats = await getRegistrationStats();
      return json(res, 200, stats);
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  return false;
}
