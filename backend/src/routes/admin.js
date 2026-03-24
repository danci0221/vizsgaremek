import { json, normalizeHeaderValue } from "../utils/helpers.js";
import {
  listUsersForAdmin,
  listCategories,
  listSportTypes,
  listLocations,
  listOrganizers,
  getAdminStats,
} from "../services/adminService.js";
import { listAllRegistrations } from "../services/registrationsService.js";
import { isAdminEmail } from "../services/authService.js";

export async function handleAdminRoutes(req, res, pathname, fullUrl) {
  const url = new URL(`http://localhost${fullUrl}`);

  if (pathname === "/api/admin/users" && req.method === "GET") {
    try {
      const adminEmail = normalizeHeaderValue(req.headers["x-admin-email"]);
      if (!(await isAdminEmail(adminEmail))) {
        return json(res, 403, { message: "Nincs jogosultságod a felhasználók megtekintéséhez." });
      }

      const users = await listUsersForAdmin();
      return json(res, 200, { users });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  if (pathname === "/api/admin/registrations" && req.method === "GET") {
    try {
      const adminEmail = normalizeHeaderValue(req.headers["x-admin-email"]);
      if (!(await isAdminEmail(adminEmail))) {
        return json(res, 403, { message: "Nincs jogosultságod a regisztrációk megtekintéséhez." });
      }

      const registrations = await listAllRegistrations();
      return json(res, 200, { registrations });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  if (pathname === "/api/admin/metadata/categories" && req.method === "GET") {
    try {
      const adminEmail = normalizeHeaderValue(req.headers["x-admin-email"]);
      if (!(await isAdminEmail(adminEmail))) {
        return json(res, 403, { message: "Nincs jogosultságod." });
      }

      const categories = await listCategories();
      return json(res, 200, { categories });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  if (pathname === "/api/admin/metadata/sport-types" && req.method === "GET") {
    try {
      const adminEmail = normalizeHeaderValue(req.headers["x-admin-email"]);
      if (!(await isAdminEmail(adminEmail))) {
        return json(res, 403, { message: "Nincs jogosultságod." });
      }

      const sportTypes = await listSportTypes();
      return json(res, 200, { sportTypes });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  if (pathname === "/api/admin/metadata/locations" && req.method === "GET") {
    try {
      const adminEmail = normalizeHeaderValue(req.headers["x-admin-email"]);
      if (!(await isAdminEmail(adminEmail))) {
        return json(res, 403, { message: "Nincs jogosultságod." });
      }

      const locations = await listLocations();
      return json(res, 200, { locations });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  if (pathname === "/api/admin/metadata/organizers" && req.method === "GET") {
    try {
      const adminEmail = normalizeHeaderValue(req.headers["x-admin-email"]);
      if (!(await isAdminEmail(adminEmail))) {
        return json(res, 403, { message: "Nincs jogosultságod." });
      }

      const organizers = await listOrganizers();
      return json(res, 200, { organizers });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  if (pathname === "/api/admin/stats" && req.method === "GET") {
    try {
      const adminEmail = normalizeHeaderValue(req.headers["x-admin-email"]);
      if (!(await isAdminEmail(adminEmail))) {
        return json(res, 403, { message: "Nincs jogosultságod." });
      }

      const stats = await getAdminStats();
      return json(res, 200, stats);
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  if (pathname === "/api/admin/metadata" && req.method === "GET") {
    try {
      const adminEmail = normalizeHeaderValue(req.headers["x-admin-email"]);
      if (!(await isAdminEmail(adminEmail))) {
        return json(res, 403, { message: "Nincs jogosultságod." });
      }

      const [categories, sportTypes, locations, organizers] = await Promise.all([
        listCategories(),
        listSportTypes(),
        listLocations(),
        listOrganizers(),
      ]);

      return json(res, 200, {
        metadata: {
          categories,
          sportTypes,
          locations,
          organizers,
        },
      });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  return false;
}
