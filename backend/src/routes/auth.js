import { readBody, json, normalizeHeaderValue } from "../utils/helpers.js";
import { validateSignupPayload, validateSigninPayload } from "../utils/validators.js";
import {
  isEmailTaken,
  registerUser,
  signInUser,
  isAdminEmail,
  findUserIdByEmail,
} from "../services/authService.js";

export async function handleAuthRoutes(req, res, pathname, fullUrl) {
  if (pathname === "/api/auth/check-email" && req.method === "GET") {
    try {
      const url = new URL(`http://localhost${fullUrl}`);
      const email = String(url.searchParams.get("email") || "").trim().toLowerCase();

      if (!email) return json(res, 400, { message: "Hiányzik az email paraméter." });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json(res, 400, { message: "Érvénytelen email cím." });
      }

      return json(res, 200, { exists: await isEmailTaken(email) });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  if (pathname === "/api/auth/signup" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const validationError = validateSignupPayload(body);
      if (validationError) return json(res, 400, { message: validationError });

      const result = await registerUser(body);
      if (result.error) return json(res, 409, { message: result.error });

      return json(res, 201, { user: result.user });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  if (pathname === "/api/auth/signin" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const validationError = validateSigninPayload(body);
      if (validationError) return json(res, 400, { message: validationError });

      const result = await signInUser(body, req.socket?.remoteAddress || null);
      if (result.error) return json(res, 401, { message: result.error });

      return json(res, 200, { user: result.user });
    } catch (error) {
      return json(res, 500, { message: error.message });
    }
  }

  return false;
}
