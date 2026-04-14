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

      // Calculate match score for each sport
      const recommendations = allSports.map((sport) => {
        let matchScore = 0;

        // Type matching (0-20 points)
        const typeScores = {
          cardio: ["running", "cycling", "swimming", "football", "tennis"],
          strength: ["weightlifting", "yoga", "pilates", "crossfit", "boxing"],
          balance: ["yoga", "pilates", "dance", "gymnastics", "climbing"],
          team: ["football", "basketball", "volleyball", "hockey", "baseball"],
        };

        const sportTypeLower = sport.sportType?.toLowerCase() || "";
        const matchingTypes = typeScores[type] || [];
        if (matchingTypes.some((t) => sportTypeLower.includes(t))) {
          matchScore += 20;
        } else {
          matchScore += 5; // partial credit for any sport
        }

        // Location matching (0-20 points)
        const locationMap = {
          outdoor: ["open", "park", "field", "court", "mountain", "water"],
          indoor: ["gym", "studio", "pool", "hall", "center"],
          both: [...["open", "park", "field", "court", "mountain", "water"], ...[
            "gym",
            "studio",
            "pool",
            "hall",
            "center",
          ]],
        };

        const categoryLower = sport.category?.toLowerCase() || "";
        const addressLower = sport.address?.toLowerCase() || "";
        const nameLower = sport.name?.toLowerCase() || "";
        const searchText = `${categoryLower} ${addressLower} ${nameLower}`;
        const locationKeywords = locationMap[location] || [];

        if (locationKeywords.some((kw) => searchText.includes(kw))) {
          matchScore += 20;
        } else if (location === "both") {
          matchScore += 10; // Any location works for "both"
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

        // Time matching (0-15 points)
        if (sport.timeSlot === time) {
          matchScore += 15;
        } else if (time === "weekend" && ["saturday", "sunday"].includes(sport.timeSlot)) {
          matchScore += 12;
        } else {
          matchScore += 3; // some credit for flexible timing
        }

        // Duration matching (0-15 points)
        const durationMap = {
          short: ["30 min", "45 min", "1 hour"],
          medium: ["1 hour", "1.5 hour", "2 hour"],
          long: ["2 hour", "3 hour", "full day"],
        };

        const openingHours = sport.openingHours?.toLowerCase() || "";
        const durationKeywords = durationMap[duration] || [];
        if (durationKeywords.some((kw) => openingHours.includes(kw))) {
          matchScore += 15;
        } else {
          matchScore += 5; // partial credit
        }

        // Group/intensity matching (0-10 points)
        const intensityMap = {
          light: ["beginner", "relaxing", "gentle", "yoga", "tai chi"],
          moderate: ["intermediate", "active", "fitness", "training"],
          high: ["advanced", "intense", "crossfit", "competition", "professional"],
        };

        const groupMap = {
          individual: ["personal", "one-on-one", "solo", "individual"],
          small_group: ["small", "group", "class"],
          class: ["class", "workshop", "group", "team"],
          team_sport: ["team", "league", "competitive", "tournament"],
        };

        const intensityKeywords = intensityMap[intensity] || [];
        const groupKeywords = groupMap[group] || [];
        const allKeywords = [...intensityKeywords, ...groupKeywords];

        if (allKeywords.some((kw) => searchText.includes(kw))) {
          matchScore += 10;
        }

        return {
          ...sport,
          matchScore: Math.min(100, Math.max(0, matchScore)),
        };
      });

      // Sort by matchScore descending and return top recommendations
      const topRecommendations = recommendations
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      return json(res, 200, { recommendations: topRecommendations });
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
