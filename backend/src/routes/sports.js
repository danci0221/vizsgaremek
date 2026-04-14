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

  if (pathname === "/api/sports/quiz-recommendations" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const { intensity, type, group, location, budget, time, duration } = body;

      // Validate that we have required fields
      if (!intensity || !type || !group || !location || !budget || !time || !duration) {
        return json(res, 400, { message: "Hiányzó kvíz válaszok." });
      }

      // Get all sports for matching
      const allSports = await listSports();

      // Map English quiz answers to Hungarian sport types
      const typeMap = {
        cardio: ["Futás", "Úszás"],
        strength: ["Konditerem", "Erőedzés"],
        balance: ["Jóga"],
        team: ["Tenisz", "Labdarúgás"],
      };

      // Map English location preferences to Hungarian location keywords
      const locationMap = {
        outdoor: ["Sportesemény", "Park", "Pálya"],
        indoor: ["Stúdió", "Edzőterem", "Uszoda"],
        both: ["Sportesemény", "Park", "Pálya", "Stúdió", "Edzőterem", "Uszoda"],
      };

      // Calculate match score for each sport
      const recommendations = allSports.map((sport) => {
        let matchScore = 0;

        // Type matching (0-30 points)
        const matchingTypes = typeMap[type] || [];
        if (matchingTypes.some((t) => sport.sportType?.includes(t))) {
          matchScore += 30;
        } else {
          matchScore += 5; // Base credit for any sport
        }

        // Location matching (0-25 points)
        const locationKeywords = locationMap[location] || [];
        const sportTextsearch = `${sport.category || ""} ${sport.location || ""}`.toLowerCase();
        if (locationKeywords.some((kw) => sportTextsearch.includes(kw.toLowerCase()))) {
          matchScore += 25;
        } else if (location === "both") {
          matchScore += 15; // Any location works for "both"
        }

        // Budget matching (0-20 points)
        const budgetThresholds = {
          free: { max: 0 },
          budget: { min: 0, max: 5000 },
          premium: { min: 0 }, // any price for premium
        };

        const threshold = budgetThresholds[budget];
        if (threshold) {
          const price = sport.price || 0;
          if (
            (threshold.max === undefined || price <= threshold.max) &&
            (threshold.min === undefined || price >= threshold.min)
          ) {
            matchScore += 20;
          }
        }

        // Time slot matching (0-15 points)
        if (sport.timeSlot === time) {
          matchScore += 15;
        } else {
          matchScore += 3; // Some credit for flexible timing
        }

        // Intensity and group matching (0-10 points)
        const descriptionText = `${sport.description || ""}`.toLowerCase();
        if (
          (intensity === "high" && (descriptionText.includes("intenzív") || descriptionText.includes("verseng"))) ||
          (intensity === "light" && (descriptionText.includes("relax") || descriptionText.includes("kezdő"))) ||
          (intensity === "moderate" && (descriptionText.includes("aktív") || descriptionText.includes("közepes")))
        ) {
          matchScore += 10;
        } else if (group === "team_sport" && sport.sportType?.includes("Tenisz")) {
          matchScore += 8;
        } else {
          matchScore += 2;
        }

        return {
          ...sport,
          matchScore: Math.min(100, Math.max(0, matchScore)),
        };
      });

      // Sort by matchScore descending and ensure we have recommendations
      const topRecommendations = recommendations
        .filter((s) => s.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      // If no matches found with score filter, return top 5 anyway
      const finalRecommendations =
        topRecommendations.length > 0
          ? topRecommendations
          : recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

      return json(res, 200, { recommendations: finalRecommendations });
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
