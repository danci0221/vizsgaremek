import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SportsGrid from "./components/SportsGrid";
import sportsData from "./data/Sports.json";
import { apiUrl } from "./lib/api";

const FAVORITES_KEY = "sporthub_favorites_v1";
const FAVORITES_OWNER_KEY = "sporthub_favorites_owner_v1";
const AUTH_USER_KEY = "sporthub_auth_user_v1";

const signUpDefaults = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const signInDefaults = {
  identifier: "",
  password: "",
};

const defaultFilters = {
  type: "all",
  location: "all",
  category: "all",
  timeSlot: "all",
  price: "all",
  sort: "recommended",
  onlyFavorites: false,
};

const plannerDefaults = {
  type: "all",
  location: "all",
  timeSlot: "all",
  budget: "all",
};

const emptyForm = {
  name: "",
  sportType: "",
  category: "",
  location: "",
  address: "",
  price: "",
  timeSlot: "morning",
  openingHours: "",
  contact: "",
  description: "",
  image: "",
};

const galleryCards = [
  {
    title: "Úszás - teljes testes fókusz",
    place: "Szeged",
    image:
      "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Tenisz - gyors reakció",
    place: "Budapest",
    image:
      "https://images.unsplash.com/photo-1617083934551-54d4dbd8d86a?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Futás - ritmus és állóképesség",
    place: "Debrecen",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80",
  },
];

const tipsCards = [
  {
    title: "Bemelegítés 8 perc alatt",
    text: "Rövid mobilizálás + fokozatos pulzusemelés segít megelőzni a sérüléseket.",
    image:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Hidratálás tervezetten",
    text: "Edzés előtt 30 perccel igyál vizet, hosszú blokkban pedig 15 percenként pótold.",
    image:
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Regeneráció komolyan",
    text: "Alvás, nyújtás és könnyű átmozgatás adja a tartós fejlődés valódi alapját.",
    image:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80",
  },
];

const prepTips = [
  "Kezdd 5-8 perc átmozgatással.",
  "Az első 10 perc legyen könnyebb tempó.",
  "Ellenőrizd cipő, víz, törölköző.",
  "Hetente legalább 1 teljes pihenő.",
];

const recoveryTips = [
  "Edzés után 10-15 perc levezetés.",
  "Napi 7-8 óra alvás szinte kötelező.",
  "Magas intenzitás után másnap könnyű mozgás.",
  "Fehérje + szénhidrát + víz legyen meg.",
];

const momentumItems = [
  { label: "Aktív idősáv", value: "06-22" },
  { label: "Sablon tervek", value: "3 perc" },
  { label: "Okos szűrők", value: "azonnal" },
  { label: "Közösség", value: "heti kihívás" },
  { label: "Térképes nézet", value: "élő" },
  { label: "Kedvencek", value: "mentve" },
];

const featureHighlights = [
  {
    index: "01",
    title: "Okos szűrők és keresők",
    text: "Egyetlen panelen váltasz sporttípus, idősáv és árszint között.",
  },
  {
    index: "02",
    title: "Kedvencek és összehasonlítás",
    text: "Azonnal látod a legjobb helyeket, és képtelen vagy elfelejteni őket.",
  },
  {
    index: "03",
    title: "Programterv pár perc alatt",
    text: "Állíts össze heti ritmust presetekkel, és tartsd a fókuszt.",
  },
  {
    index: "04",
    title: "Térképes tájékozódás",
    text: "Gyorsan átlátod, melyik városban milyen opciók vannak.",
  },
];

const challengeCards = [
  {
    title: "3x45 perc mozgáskihívás",
    text: "Válassz három különböző sporthelyet, hogy változatos legyen a heted.",
    actionLabel: "Indítom",
    actionPath: "/kinalat",
  },
  {
    title: "Hétvégi közösség",
    text: "Fókusz az ingyenes, közösségi eseményekre szombaton vagy vasárnap.",
    actionLabel: "Hétvégi lista",
    actionPath: "/kinalat",
  },
  {
    title: "Regenerációs blokk",
    text: "Építs be egy pihenőnapot, hogy tartós legyen a fejlődés.",
    actionLabel: "Tippek",
    actionPath: "/tippek",
  },
];

const ctaHighlights = [
  "Valós idejű ajánlások és okos szűrők",
  "Kedvencek automatikus mentése",
  "Programterv, ami a heti ritmushoz igazodik",
];

const footerLinksBase = [
  { to: "/", label: "Főoldal" },
  { to: "/kinalat", label: "Kínálat" },
  { to: "/tippek", label: "Tippek" },
  { to: "/programterv", label: "Programterv" },
  { to: "/kedvencek", label: "Kedvencek" },
];

const timeSlotLabels = {
  morning: "Reggel",
  afternoon: "Délután",
  evening: "Este",
  weekend: "Hétvége",
};

function formatPriceLabel(priceValue) {
  const price = Number(priceValue) || 0;
  if (price <= 0) return "Ingyenes";
  return `${price.toLocaleString("hu-HU")} Ft`;
}

function calculateRecommendationScore(item) {
  let score = 0;
  if (item.price === 0) score += 30;
  if (item.timeSlot === "weekend") score += 18;
  if (item.timeSlot === "evening") score += 12;
  if ((item.category || "").toLowerCase().includes("sport")) score += 8;
  if ((item.description || "").length > 70) score += 6;
  score += Math.max(0, 14000 - item.price) / 1000;
  return Math.round(score);
}

function toPercent(count, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((count / total) * 100));
}

function normalizeSport(item, index) {
  const price = Number(item.price) || 0;
  return {
    ...item,
    id: item.id ?? Date.now() + index,
    price,
    priceLabel: item.priceLabel || formatPriceLabel(price),
    recommendationScore: calculateRecommendationScore({ ...item, price }),
  };
}

function normalizeAuthMode(search) {
  const mode = new URLSearchParams(search).get("mode");
  return mode === "signup" ? "signup" : "signin";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

async function readErrorMessage(response, fallbackMessage) {
  try {
    const data = await response.json();
    if (data?.message) return data.message;
  } catch {
    // Ignore JSON parsing error and use fallback.
  }
  return fallbackMessage;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sports, setSports] = useState([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [favorites, setFavorites] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [planner, setPlanner] = useState(plannerDefaults);
  const [plannerSubmitted, setPlannerSubmitted] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [now, setNow] = useState(() => new Date());
  const [authUser, setAuthUser] = useState(null);
  const isAdmin = authUser?.role === "admin";
  const [authState, setAuthState] = useState({ type: "idle", message: "" });
  const [authBusy, setAuthBusy] = useState(false);
  const [emailCheckState, setEmailCheckState] = useState({ type: "idle", message: "" });
  const [showPassword, setShowPassword] = useState({
    signup: false,
    signupConfirm: false,
    signin: false,
  });
  const [signUpForm, setSignUpForm] = useState(signUpDefaults);
  const [signInForm, setSignInForm] = useState(signInDefaults);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersState, setAdminUsersState] = useState({ type: "idle", message: "" });
  const [adminUsersBusy, setAdminUsersBusy] = useState(false);
  const [mapFocusId, setMapFocusId] = useState(null);

  const authMode = useMemo(() => normalizeAuthMode(location.search), [location.search]);

  useEffect(() => {
    const allowedPaths = new Set([
      "/",
      "/kinalat",
      "/tippek",
      "/programterv",
      "/kedvencek",
      "/admin",
      "/auth",
    ]);
    if (!allowedPaths.has(location.pathname)) {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) setFavorites(parsed);
      } catch {
        localStorage.removeItem(FAVORITES_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    const owner = authUser?.email ? authUser.email.toLowerCase() : "anon";
    localStorage.setItem(FAVORITES_OWNER_KEY, owner);
  }, [favorites, authUser?.email]);

  useEffect(() => {
    if (!authUser?.email) return;
    let cancelled = false;

    const syncFavorites = async () => {
      try {
        let localFavorites = [];
        const raw = localStorage.getItem(FAVORITES_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localFavorites = parsed;
          } catch {
            localFavorites = [];
          }
        }
        const owner = localStorage.getItem(FAVORITES_OWNER_KEY);
        if (owner && owner !== "anon" && owner !== authUser.email.toLowerCase()) {
          localFavorites = [];
        }

        const response = await fetch(apiUrl("/favorites"), {
          headers: {
            "X-User-Email": authUser.email,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const serverFavorites = Array.isArray(data.favorites)
          ? data.favorites.map((value) => Number(value)).filter((value) => Number.isFinite(value))
          : [];
        const merged = Array.from(new Set([...serverFavorites, ...localFavorites]));

        if (!cancelled) {
          setFavorites(merged);
        }

        const missing = merged.filter((id) => !serverFavorites.includes(id));
        if (missing.length === 0) return;

        await Promise.all(
          missing.map((sportId) =>
            fetch(apiUrl("/favorites"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-User-Email": authUser.email,
              },
              body: JSON.stringify({ sportId }),
            })
          )
        );
      } catch {
        // Keep local favorites if sync fails.
      }
    };

    syncFavorites();
    return () => {
      cancelled = true;
    };
  }, [authUser?.email]);

  useEffect(() => {
    const savedAuthUser = localStorage.getItem(AUTH_USER_KEY);
    if (savedAuthUser) {
      try {
        const parsed = JSON.parse(savedAuthUser);
        if (parsed && typeof parsed === "object") {
          setAuthUser(parsed);
        }
      } catch {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      return;
    }
    localStorage.removeItem(AUTH_USER_KEY);
  }, [authUser]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadSports = async () => {
      try {
        const response = await fetch(apiUrl("/sports"));
        if (!response.ok) throw new Error("API hiba");
        const data = await response.json();
        setSports(data.map(normalizeSport));
      } catch {
        setSports(sportsData.map(normalizeSport));
        setStatus({
          type: "warning",
          message: "Az API most nem elérhető, helyi mintaadatokat használ az oldal.",
        });
      }
    };

    loadSports();
  }, []);

  useEffect(() => {
    if (!authUser || authUser.role !== "admin") {
      setAdminUsers([]);
      setAdminUsersState({ type: "idle", message: "" });
    }
  }, [authUser]);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const uniqueTypes = [...new Set(sports.map((item) => item.sportType))];
  const uniqueLocations = [...new Set(sports.map((item) => item.location))];
  const uniqueCategories = [...new Set(sports.map((item) => item.category))];
  const stats = useMemo(() => {
    const countByTime = { morning: 0, afternoon: 0, evening: 0, weekend: 0 };
    const countByLocation = {};
    const countByCategory = {};
    const priceBands = { free: 0, budget: 0, mid: 0, premium: 0 };
    let totalPrice = 0;
    let pricedCount = 0;

    sports.forEach((item) => {
      countByTime[item.timeSlot] = (countByTime[item.timeSlot] || 0) + 1;
      countByLocation[item.location] = (countByLocation[item.location] || 0) + 1;
      countByCategory[item.category] = (countByCategory[item.category] || 0) + 1;

      if (item.price <= 0) priceBands.free += 1;
      else if (item.price <= 5000) priceBands.budget += 1;
      else if (item.price <= 10000) priceBands.mid += 1;
      else priceBands.premium += 1;

      if (item.price > 0) {
        totalPrice += item.price;
        pricedCount += 1;
      }
    });

    return {
      total: sports.length,
      countByTime,
      countByLocation,
      countByCategory,
      priceBands,
      avgPrice: pricedCount ? Math.round(totalPrice / pricedCount) : 0,
    };
  }, [sports]);

  const insightCards = useMemo(
    () => [
      {
        label: "Aktív helyszín",
        value: stats.total,
        note: "friss adatbázisból",
      },
      {
        label: "Városok",
        value: uniqueLocations.length,
        note: "országos lefedettség",
      },
      {
        label: "Kategóriák",
        value: uniqueCategories.length,
        note: "stílus és cél szerint",
      },
      {
        label: "Ingyenes opció",
        value: stats.priceBands.free,
        note: "könnyű kezdés",
      },
    ],
    [stats.total, stats.priceBands.free, uniqueLocations.length, uniqueCategories.length]
  );

  const pulseCards = useMemo(() => {
    const total = stats.total || 1;

    return [
      {
        title: "Reggeli idősáv",
        value: toPercent(stats.countByTime.morning, total),
        note: `${stats.countByTime.morning || 0} opció`,
      },
      {
        title: "Esti csúcs",
        value: toPercent(stats.countByTime.evening, total),
        note: `${stats.countByTime.evening || 0} opció`,
      },
      {
        title: "Hétvégi flow",
        value: toPercent(stats.countByTime.weekend, total),
        note: `${stats.countByTime.weekend || 0} opció`,
      },
      {
        title: "Ingyenes blokkok",
        value: toPercent(stats.priceBands.free, total),
        note: `${stats.priceBands.free || 0} opció`,
      },
    ];
  }, [stats]);

  const cityStats = useMemo(() => {
    const cityMap = {};

    sports.forEach((item) => {
      if (!cityMap[item.location]) {
        cityMap[item.location] = { count: 0, typeCounts: {} };
      }
      cityMap[item.location].count += 1;
      cityMap[item.location].typeCounts[item.sportType] =
        (cityMap[item.location].typeCounts[item.sportType] || 0) + 1;
    });

    return Object.entries(cityMap)
      .map(([name, data]) => {
        const topType = Object.entries(data.typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        return {
          name,
          count: data.count,
          topType: topType || "Vegyes",
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [sports]);

  const categoryMix = useMemo(() => {
    const total = stats.total || 1;
    return Object.entries(stats.countByCategory)
      .map(([label, count]) => ({
        label,
        count,
        percent: toPercent(count, total),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [stats]);

  const timeSlotMix = useMemo(() => {
    const total = stats.total || 1;
    const items = [
      { label: "Reggel", key: "morning" },
      { label: "Délután", key: "afternoon" },
      { label: "Este", key: "evening" },
      { label: "Hétvége", key: "weekend" },
    ];

    return items.map((item) => {
      const count = stats.countByTime[item.key] || 0;
      return {
        label: item.label,
        count,
        percent: toPercent(count, total),
      };
    });
  }, [stats]);

  const priceMix = useMemo(() => {
    const total = stats.total || 1;
    const labels = {
      free: "Ingyenes",
      budget: "0-5000",
      mid: "5001-10000",
      premium: "10000+",
    };
    const order = ["free", "budget", "mid", "premium"];

    return order.map((key) => {
      const count = stats.priceBands[key] || 0;
      return {
        label: labels[key] || key,
        count,
        percent: toPercent(count, total),
      };
    });
  }, [stats]);

  const topRecommendations = useMemo(() => {
    return [...sports]
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);
  }, [sports]);

  const mapCandidates = useMemo(() => {
    return [...sports]
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 5);
  }, [sports]);

  useEffect(() => {
    if (mapCandidates.length === 0) {
      setMapFocusId(null);
      return;
    }

    setMapFocusId((prev) =>
      mapCandidates.some((item) => item.id === prev) ? prev : mapCandidates[0].id
    );
  }, [mapCandidates]);

  const mapFocus = mapCandidates.find((item) => item.id === mapFocusId) ?? mapCandidates[0];
  const mapQuery = mapFocus ? `${mapFocus.address}, ${mapFocus.location}` : "Budapest";
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  const footerLinks = isAdmin
    ? [...footerLinksBase, { to: "/admin", label: "Admin" }]
    : footerLinksBase;

  const topCityName = cityStats[0]?.name || "Budapest";

  const scenarioCards = useMemo(
    () => [
      {
        title: "Reggeli rajt",
        text: "Indítsd a napot könnyebb, rövidebb blokkal.",
        tone: "orange",
        cta: "Reggeli opciók",
        filters: { timeSlot: "morning", price: "budget" },
      },
      {
        title: "Hétvégi közösség",
        text: "Nézd meg a szabad, közösségi programokat.",
        tone: "green",
        cta: "Hétvégi lista",
        filters: { timeSlot: "weekend", price: "free" },
      },
      {
        title: `${topCityName} fókusz`,
        text: "Gyors városi válogatás, hogy ott legyen minden egyben.",
        tone: "blue",
        cta: "Városi szűrés",
        filters: { location: topCityName },
      },
      {
        title: "Esti prémium",
        text: "Kiemelt, magasabb szintű opciók munka utánra.",
        tone: "dark",
        cta: "Esti ajánlatok",
        filters: { timeSlot: "evening", price: "premium" },
      },
    ],
    [topCityName]
  );

  const challengeStats = useMemo(() => {
    const avgLabel = stats.avgPrice
      ? `${stats.avgPrice.toLocaleString("hu-HU")} Ft`
      : "N/A";

    return [
      {
        label: "Átlag ár",
        value: avgLabel,
        note: "fizetős opciók",
      },
      {
        label: "Hétvégi opció",
        value: stats.countByTime.weekend || 0,
        note: "közösségi fókusz",
      },
      {
        label: "Ingyenes hely",
        value: stats.priceBands.free,
        note: "gyors kezdés",
      },
    ];
  }, [stats.avgPrice, stats.countByTime.weekend, stats.priceBands.free]);

  const filteredSports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const byFilter = sports.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.sportType.toLowerCase().includes(normalizedQuery) ||
        item.location.toLowerCase().includes(normalizedQuery);

      const matchesType = filters.type === "all" || item.sportType === filters.type;
      const matchesLocation =
        filters.location === "all" || item.location === filters.location;
      const matchesCategory =
        filters.category === "all" || item.category === filters.category;
      const matchesTime =
        filters.timeSlot === "all" || item.timeSlot === filters.timeSlot;

      const matchesPrice =
        filters.price === "all" ||
        (filters.price === "free" && item.price === 0) ||
        (filters.price === "budget" && item.price > 0 && item.price <= 5000) ||
        (filters.price === "mid" && item.price > 5000 && item.price <= 10000) ||
        (filters.price === "premium" && item.price > 10000);

      const matchesFavorite = !filters.onlyFavorites || favoriteSet.has(item.id);

      return (
        matchesQuery &&
        matchesType &&
        matchesLocation &&
        matchesCategory &&
        matchesTime &&
        matchesPrice &&
        matchesFavorite
      );
    });

    return [...byFilter].sort((a, b) => {
      if (filters.sort === "name-asc") return a.name.localeCompare(b.name, "hu");
      if (filters.sort === "price-asc") return a.price - b.price;
      if (filters.sort === "price-desc") return b.price - a.price;
      return b.recommendationScore - a.recommendationScore;
    });
  }, [sports, query, filters, favoriteSet]);

  const plannerResults = useMemo(() => {
    return sports
      .filter((item) => {
        const matchesType = planner.type === "all" || item.sportType === planner.type;
        const matchesLocation =
          planner.location === "all" || item.location === planner.location;
        const matchesTime = planner.timeSlot === "all" || item.timeSlot === planner.timeSlot;
        const matchesBudget =
          planner.budget === "all" ||
          (planner.budget === "free" && item.price === 0) ||
          (planner.budget === "budget" && item.price > 0 && item.price <= 5000) ||
          (planner.budget === "premium" && item.price > 5000);

        return matchesType && matchesLocation && matchesTime && matchesBudget;
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);
  }, [sports, planner]);

  const favoriteSports = useMemo(
    () => sports.filter((item) => favoriteSet.has(item.id)),
    [sports, favoriteSet]
  );
  const compareSports = useMemo(
    () => sports.filter((item) => compareIds.includes(item.id)),
    [sports, compareIds]
  );

  const liveDayLabel = now.toLocaleDateString("hu-HU", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const liveTimeLabel = now.toLocaleTimeString("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const clearFilters = () => {
    setFilters(defaultFilters);
    setQuery("");
  };

  const applyScenario = (scenario) => {
    const timeSlotOptions = ["morning", "afternoon", "evening", "weekend"];
    const priceOptions = ["free", "budget", "mid", "premium"];

    const safeType =
      scenario?.type && uniqueTypes.includes(scenario.type) ? scenario.type : "all";
    const safeLocation =
      scenario?.location && uniqueLocations.includes(scenario.location)
        ? scenario.location
        : "all";
    const safeCategory =
      scenario?.category && uniqueCategories.includes(scenario.category)
        ? scenario.category
        : "all";
    const safeTimeSlot =
      scenario?.timeSlot && timeSlotOptions.includes(scenario.timeSlot)
        ? scenario.timeSlot
        : "all";
    const safePrice =
      scenario?.price && priceOptions.includes(scenario.price) ? scenario.price : "all";

    setFilters((prev) => ({
      ...prev,
      type: safeType,
      location: safeLocation,
      category: safeCategory,
      timeSlot: safeTimeSlot,
      price: safePrice,
      sort: scenario?.sort || "recommended",
      onlyFavorites: false,
    }));

    if (typeof scenario?.query === "string") {
      setQuery(scenario.query);
    } else {
      setQuery("");
    }

    navigate("/kinalat");
  };

  const toggleFavorite = async (id) => {
    const wasFavorite = favoriteSet.has(id);

    setFavorites((prev) =>
      wasFavorite ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );

    if (!authUser?.email) return;

    try {
      if (wasFavorite) {
        const response = await fetch(apiUrl(`/favorites/${id}`), {
          method: "DELETE",
          headers: {
            "X-User-Email": authUser.email,
          },
        });

        if (!response.ok) {
          const errorMessage = await readErrorMessage(response, "Sikertelen törlés.");
          throw new Error(errorMessage);
        }
      } else {
        const response = await fetch(apiUrl("/favorites"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": authUser.email,
          },
          body: JSON.stringify({ sportId: id }),
        });

        if (!response.ok) {
          const errorMessage = await readErrorMessage(response, "Sikertelen mentés.");
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      setFavorites((prev) => {
        if (wasFavorite) {
          return prev.includes(id) ? prev : [...prev, id];
        }
        return prev.filter((itemId) => itemId !== id);
      });
      if (location.pathname === "/admin") {
        setStatus({ type: "error", message: error.message });
      }
    }
  };

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((itemId) => itemId !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const openInCatalog = (item) => {
    setQuery(item.name);
    navigate("/kinalat");
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setStatus({ type: "error", message: "Csak admin jogosult sporthelyet kezelni." });
      return;
    }

    const payload = { ...form, price: Number(form.price) || 0 };
    const headers = { "Content-Type": "application/json" };
    if (authUser?.email) headers["X-Admin-Email"] = authUser.email;

    try {
      const response = await fetch(editingId ? apiUrl(`/sports/${editingId}`) : apiUrl("/sports"), {
        method: editingId ? "PUT" : "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sikertelen mentés.");
      }

      const savedItem = normalizeSport(await response.json(), 0);
      if (editingId) {
        setSports((prev) => prev.map((item) => (item.id === editingId ? savedItem : item)));
      } else {
        setSports((prev) => [savedItem, ...prev]);
      }

      setStatus({ type: "success", message: "Sikeres adatbázis-mentés." });
      resetForm();
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      sportType: item.sportType,
      category: item.category,
      location: item.location,
      address: item.address,
      price: item.price,
      timeSlot: item.timeSlot,
      openingHours: item.openingHours,
      contact: item.contact,
      description: item.description,
      image: item.image,
    });
    navigate("/admin");
  };

  const handleDelete = async (id) => {
    try {
      if (!isAdmin) {
        setStatus({ type: "error", message: "Csak admin jogosult sporthelyet törölni." });
        return;
      }

      const headers = authUser?.email ? { "X-Admin-Email": authUser.email } : undefined;
      const response = await fetch(apiUrl(`/sports/${id}`), { method: "DELETE", headers });
      if (!response.ok) {
        const errorMessage = await readErrorMessage(response, "Sikertelen törlés.");
        throw new Error(errorMessage);
      }
      setSports((prev) => prev.filter((item) => item.id !== id));
      setFavorites((prev) => prev.filter((itemId) => itemId !== id));
      setCompareIds((prev) => prev.filter((itemId) => itemId !== id));
      if (editingId === id) resetForm();
      setStatus({ type: "success", message: "Sikeres törlés az adatbázisból." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  };

  const checkEmailExists = async (emailValue) => {
    const email = String(emailValue || "").trim().toLowerCase();
    if (!email) {
      setEmailCheckState({ type: "idle", message: "" });
      return { ok: false, exists: false };
    }

    if (!isValidEmail(email)) {
      setEmailCheckState({ type: "error", message: "Érvénytelen email cím." });
      return { ok: false, exists: false };
    }

    try {
      const response = await fetch(apiUrl(`/auth/check-email?email=${encodeURIComponent(email)}`));
      if (!response.ok) {
        const errorMessage = await readErrorMessage(
          response,
          "Nem sikerült ellenőrizni az email címet."
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.exists) {
        setEmailCheckState({ type: "error", message: "Ez az email már regisztrálva van." });
      } else {
        setEmailCheckState({ type: "success", message: "Az email cím szabad." });
      }

      return { ok: true, exists: Boolean(data.exists) };
    } catch (error) {
      setEmailCheckState({ type: "error", message: error.message });
      return { ok: false, exists: false };
    }
  };

  const loadAdminUsers = useCallback(async () => {
    if (!authUser || authUser.role !== "admin") return;

    setAdminUsersBusy(true);
    setAdminUsersState({ type: "idle", message: "" });

    try {
      const response = await fetch(apiUrl("/admin/users"), {
        headers: {
          "X-Admin-Email": authUser.email,
        },
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(
          response,
          "A felhasználólista betöltése sikertelen."
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const users = Array.isArray(data.users) ? data.users : [];
      setAdminUsers(users);
      setAdminUsersState({
        type: "success",
        message: `${users.length} felhasználó betöltve.`,
      });
    } catch (error) {
      setAdminUsersState({ type: "error", message: error.message });
    } finally {
      setAdminUsersBusy(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (location.pathname !== "/admin") return;
    if (!authUser || authUser.role !== "admin") return;
    loadAdminUsers();
  }, [location.pathname, authUser, loadAdminUsers]);

  const switchAuthMode = (mode) => {
    const nextMode = mode === "signup" ? "signup" : "signin";
    navigate(`/auth?mode=${nextMode}`);
    setAuthState({ type: "idle", message: "" });
    setEmailCheckState({ type: "idle", message: "" });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setAuthState({ type: "error", message: "A két jelszó nem egyezik." });
      return;
    }

    setAuthBusy(true);
    setAuthState({ type: "idle", message: "" });

    try {
      const emailCheck = await checkEmailExists(signUpForm.email);
      if (!emailCheck.ok) return;
      if (emailCheck.exists) {
        setAuthState({ type: "error", message: "Ez az email már regisztrálva van." });
        return;
      }

      const response = await fetch(apiUrl("/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signUpForm.username.trim(),
          email: signUpForm.email.trim(),
          password: signUpForm.password,
        }),
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response, "Sikertelen regisztráció.");
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setAuthUser(data.user);
      setAuthState({ type: "success", message: "Sikeres regisztráció és bejelentkezés." });
      setSignUpForm(signUpDefaults);
      setEmailCheckState({ type: "idle", message: "" });
      navigate("/kinalat");
    } catch (error) {
      setAuthState({ type: "error", message: error.message });
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    setAuthBusy(true);
    setAuthState({ type: "idle", message: "" });

    try {
      const response = await fetch(apiUrl("/auth/signin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: signInForm.identifier.trim(),
          password: signInForm.password,
        }),
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response, "Sikertelen bejelentkezés.");
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setAuthUser(data.user);
      setAuthState({ type: "success", message: "Sikeres bejelentkezés." });
      setSignInForm(signInDefaults);
      navigate("/kinalat");
    } catch (error) {
      setAuthState({ type: "error", message: error.message });
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = () => {
    setAuthUser(null);
    setFavorites([]);
    setCompareIds([]);
    setAuthState({ type: "success", message: "Kijelentkezés sikeres." });
    navigate("/auth?mode=signin");
  };

  let content = (
    <>
      <Hero
        query={query}
        onSearch={setQuery}
        favoriteCount={favorites.length}
        resultCount={filteredSports.length}
        liveDayLabel={liveDayLabel}
        liveTimeLabel={liveTimeLabel}
        uniqueTypes={uniqueTypes}
        onQuickTypeSelect={(type) => {
          setFilters((prev) => ({ ...prev, type }));
          navigate("/kinalat");
        }}
      />
      <section className="momentum-strip">
        <div className="momentum-track">
          {momentumItems.map((item, index) => (
            <span key={`momentum-${index}`}>
              {item.label} <b>{item.value}</b>
            </span>
          ))}
          {momentumItems.map((item, index) => (
            <span key={`momentum-dup-${index}`}>
              {item.label} <b>{item.value}</b>
            </span>
          ))}
        </div>
      </section>
      <section className="insights">
        {insightCards.map((item) => (
          <article key={item.label}>
            <p>{item.label}</p>
            <h3>{item.value}</h3>
            <p className="muted-mini">{item.note}</p>
          </article>
        ))}
      </section>
      <section className="pulse surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Élő pulzus</p>
          <h2>Aktuális ritmus és idősávok egy pillantásban</h2>
        </div>
        <div className="pulse-grid">
          {pulseCards.map((item) => (
            <article key={item.title}>
              <p>{item.title}</p>
              <h3>{item.value}%</h3>
              <div className="meter">
                <span style={{ width: `${item.value}%` }} />
              </div>
              <p className="muted-mini">{item.note}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="scenario-lab surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Gyors presetek</p>
          <h2>Indíts el egy szcenáriót, és máris készen áll a kínálat</h2>
        </div>
        <div className="scenario-grid">
          {scenarioCards.map((card) => (
            <article key={card.title} className={`scenario-card ${card.tone}`}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <button type="button" className="ghost" onClick={() => applyScenario(card.filters)}>
                {card.cta}
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="highlights surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Sport munkafolyamat</p>
          <h2>Értékes funkciók, amik naponta időt spórolnak</h2>
        </div>
        <div className="feature-grid">
          {featureHighlights.map((item) => (
            <article key={item.title}>
              <span className="feature-index">{item.index}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="recommendations surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Ajánlottak</p>
          <h2>Válogatott sporthelyek a jelenlegi adatok alapján</h2>
        </div>
        {topRecommendations.length > 0 ? (
          <div className="recommendation-grid">
            {topRecommendations.map((item) => (
              <article key={item.id}>
                <img src={item.image} alt={item.name} loading="lazy" />
                <div>
                  <p className="chip">{item.category}</p>
                  <h3>{item.name}</h3>
                  <p>
                    {item.sportType} - {item.location}
                  </p>
                  <p className="price">{item.priceLabel}</p>
                  <div className="recommendation-actions">
                    <button type="button" className="ghost" onClick={() => openInCatalog(item)}>
                      Megnyitás
                    </button>
                    <button
                      type="button"
                      className={favoriteSet.has(item.id) ? "cta" : "dark-btn"}
                      onClick={() => toggleFavorite(item.id)}
                    >
                      {favoriteSet.has(item.id) ? "Kedvenc" : "Kedvencnek"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">Most nem elérhető ajánlott sporthely.</p>
        )}
      </section>
      <section className="challenge surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Heti kihívás</p>
          <h2>Mini blokkok, hogy könnyen tartsd a fókuszt</h2>
        </div>
        <div className="challenge-grid">
          {challengeCards.map((card) => (
            <article key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <button type="button" className="ghost" onClick={() => navigate(card.actionPath)}>
                {card.actionLabel}
              </button>
            </article>
          ))}
        </div>
        <div className="challenge-stats">
          {challengeStats.map((item) => (
            <article key={item.label}>
              <p>{item.label}</p>
              <h3>{item.value}</h3>
              <p className="muted-mini">{item.note}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="city-lab surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Városi aktivitás</p>
          <h2>Hol a legerősebb most a sportpulzus</h2>
        </div>
        <div className="city-grid">
          {cityStats.length > 0 ? (
            cityStats.map((city) => (
              <article key={city.name}>
                <div className="city-head">
                  <h3>{city.name}</h3>
                  <span>{city.count} hely</span>
                </div>
                <p>Top sport: {city.topType}</p>
              </article>
            ))
          ) : (
            <p className="empty-state">Nincs megjeleníthető városi adat.</p>
          )}
        </div>
      </section>
      <section className="dna surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Sport DNA</p>
          <h2>A kínálat összetétele kategóriák, idősávok és árak szerint</h2>
        </div>
        <div className="dna-grid">
          <article>
            <h3>Kategóriák aránya</h3>
            <div className="bar-list">
              {categoryMix.map((item) => (
                <div key={item.label} className="bar-item">
                  <div>
                    <p>{item.label}</p>
                    <span>{item.count} hely</span>
                  </div>
                  <div className="bar-track">
                    <span style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article>
            <h3>Idősáv megoszlás</h3>
            <div className="bar-list">
              {timeSlotMix.map((item) => (
                <div key={item.label} className="bar-item">
                  <div>
                    <p>{item.label}</p>
                    <span>{item.count} opció</span>
                  </div>
                  <div className="bar-track alt">
                    <span style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article>
            <h3>Ársávok</h3>
            <div className="bar-list">
              {priceMix.map((item) => (
                <div key={item.label} className="bar-item">
                  <div>
                    <p>{item.label}</p>
                    <span>{item.count} opció</span>
                  </div>
                  <div className="bar-track">
                    <span style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
      <section className="map-section surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Térképes nézet</p>
          <h2>Válassz helyszínt, és nézd meg a pontos elérhetőséget</h2>
        </div>
        <div className="map-layout">
          <div className="map-list">
            {mapCandidates.length > 0 ? (
              mapCandidates.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`map-item ${mapFocus?.id === item.id ? "active" : ""}`}
                  onClick={() => setMapFocusId(item.id)}
                >
                  <h4>{item.name}</h4>
                  <p>{item.address}</p>
                  <p>{item.priceLabel}</p>
                </button>
              ))
            ) : (
              <p className="empty-state">Nincs megjeleníthető helyszín.</p>
            )}
          </div>
          <div className="map-frame">
            <iframe
              title="Sporthelyek térképe"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {mapFocus && (
              <div className="map-meta">
                <div>
                  <p className="eyebrow">Kijelölt hely</p>
                  <h3>{mapFocus.name}</h3>
                  <p>{mapFocus.address}</p>
                </div>
                <button type="button" className="ghost" onClick={() => openInCatalog(mapFocus)}>
                  Megnyitás a kínálatban
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="gallery">
        <div className="section-heading">
          <p className="eyebrow">Sport hangulat</p>
          <h2>Friss inspirációs képek valós helyszínekkel</h2>
        </div>
        <div className="gallery-grid">
          {galleryCards.map((item) => (
            <article key={item.title} className="gallery-card">
              <img src={item.image} alt={item.title} loading="lazy" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.place}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="cta-panel">
        <div>
          <p className="eyebrow">SportHub klub</p>
          <h2>Legyen egy hely, ahol minden sportod átlátható</h2>
          <p>
            Tervezd meg a hetedet, tartsd egyben a kedvenceket, és találj új helyeket gyorsabban.
          </p>
          <ul className="cta-list">
            {ctaHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="cta-actions">
          <Link to="/auth?mode=signup" className="cta">
            Fiók létrehozása
          </Link>
          <Link to="/kinalat" className="ghost">
            Kínálat megnyitása
          </Link>
        </div>
      </section>
    </>
  );

  if (location.pathname === "/kinalat") {
    content = (
      <>
        <section className="catalog-head">
          <div className="section-heading">
            <p className="eyebrow">Kínálat</p>
            <h2>Sporthelyek eseményekkel, szűrőkkel és gyors összehasonlítással</h2>
          </div>
          <div className="catalog-toolbar">
            <input
              type="search"
              placeholder="Keresés név, sporttípus vagy város alapján"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="ghost" onClick={() => setQuery("")}>
              Keresés törlése
            </button>
          </div>
        </section>
        <SportsGrid
          sports={filteredSports}
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={clearFilters}
          uniqueTypes={uniqueTypes}
          uniqueLocations={uniqueLocations}
          uniqueCategories={uniqueCategories}
          favoriteSet={favoriteSet}
          compareIds={compareIds}
          onToggleFavorite={toggleFavorite}
          onToggleCompare={toggleCompare}
        />
      </>
    );
  }

  if (location.pathname === "/tippek") {
    content = (
      <>
        <section className="tips-hero">
          <div>
            <p className="eyebrow">Tippek és tanácsok</p>
            <h2>Edzz okosan: stabil forma, jobb fejlődés, kevesebb sérülés</h2>
            <p>A fókusz legyen a konzisztencián, fokozatosságon és regeneráción.</p>
            <div className="tips-pill-row">
              <span>Fókusz: rutin</span>
              <span>Fókusz: hidratálás</span>
              <span>Fókusz: pihenés</span>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1549570652-97324981a6fd?auto=format&fit=crop&w=1400&q=80"
            alt="Sporttippek"
            loading="lazy"
          />
        </section>
        <section className="tips-section">
          <div className="tips-grid">
            {tipsCards.map((tip) => (
              <article key={tip.title} className="tips-card">
                <img src={tip.image} alt={tip.title} loading="lazy" />
                <div>
                  <h3>{tip.title}</h3>
                  <p>{tip.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="tips-columns">
          <article>
            <h3>Edzés előtti checklist</h3>
            <ul>
              {prepTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Regenerációs checklist</h3>
            <ul>
              {recoveryTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </article>
        </section>
      </>
    );
  }

  if (location.pathname === "/programterv") {
    content = (
      <section className="planner">
        <div className="section-heading">
          <p className="eyebrow">Programterv</p>
          <h2>Állíts össze heti sporttervet gyors presetekkel</h2>
        </div>
        <form
          className="planner-form"
          onSubmit={(e) => {
            e.preventDefault();
            setPlannerSubmitted(true);
          }}
        >
          <select
            value={planner.type}
            onChange={(e) => setPlanner((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option value="all">Bármilyen sporttípus</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={planner.location}
            onChange={(e) => setPlanner((prev) => ({ ...prev, location: e.target.value }))}
          >
            <option value="all">Bármelyik város</option>
            {uniqueLocations.map((locationValue) => (
              <option key={locationValue} value={locationValue}>
                {locationValue}
              </option>
            ))}
          </select>
          <select
            value={planner.timeSlot}
            onChange={(e) => setPlanner((prev) => ({ ...prev, timeSlot: e.target.value }))}
          >
            <option value="all">Bármelyik idősáv</option>
            {Object.entries(timeSlotLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={planner.budget}
            onChange={(e) => setPlanner((prev) => ({ ...prev, budget: e.target.value }))}
          >
            <option value="all">Bármilyen költség</option>
            <option value="free">Ingyenes</option>
            <option value="budget">Kedvező (0-5000)</option>
            <option value="premium">Prémium (5000+)</option>
          </select>
          <button type="submit" className="dark-btn">
            Terv generálása
          </button>
        </form>
        {plannerSubmitted && (
          <div className="planner-results">
            {plannerResults.length > 0 ? (
              plannerResults.map((item) => (
                <article key={item.id}>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <p>
                    <strong>Ár:</strong> {item.priceLabel}
                  </p>
                  <button type="button" className="ghost" onClick={() => openInCatalog(item)}>
                    Megnyitás a kínálat oldalon
                  </button>
                </article>
              ))
            ) : (
              <p className="empty-state">Erre a kombinációra most nincs találat.</p>
            )}
          </div>
        )}
      </section>
    );
  }

  if (location.pathname === "/kedvencek") {
    content = (
      <section className="favorites">
        <div className="section-heading">
          <p className="eyebrow">Kedvenceid</p>
          <h2>{favoriteSports.length > 0 ? "Mentett sporthelyek" : "Még nincs kedvenced"}</h2>
        </div>
        <div className="favorite-row">
          {favoriteSports.length > 0 ? (
            favoriteSports.map((item) => (
              <article key={item.id}>
                <h3>{item.name}</h3>
                <p>
                  {item.sportType} - {item.location}
                </p>
                <div className="recommendation-actions">
                  <button type="button" className="ghost" onClick={() => openInCatalog(item)}>
                    Megnyitás
                  </button>
                  <button type="button" className="cta" onClick={() => toggleFavorite(item.id)}>
                    Eltávolítás
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-state">
              Jelölj meg néhány sporthelyet kedvencként a Kínálat oldalon.
            </p>
          )}
        </div>
        {compareSports.length > 0 && (
          <section className="compare-bar">
            <div>
              <p className="eyebrow">Összehasonlítás</p>
              <h3>Kiválasztott helyek: {compareSports.length}/3</h3>
            </div>
            <div className="compare-grid">
              {compareSports.map((item) => (
                <article key={item.id}>
                  <h4>{item.name}</h4>
                  <p>{item.priceLabel}</p>
                  <p>{item.openingHours}</p>
                </article>
              ))}
            </div>
            <button type="button" className="ghost" onClick={() => setCompareIds([])}>
              Törlés
            </button>
          </section>
        )}
      </section>
    );
  }

  if (location.pathname === "/auth") {
    content = (
      <section className="auth">
        <div className="section-heading">
          <p className="eyebrow">Fiókkezelés</p>
          <h2>
            {authMode === "signup" ? "Hozz létre új fiókot" : "Jelentkezz be a fiókodba"}
          </h2>
          <p className="auth-sub">
            Regisztráció után azonnal be is leszel jelentkeztetve a SportHub oldalon.
          </p>
        </div>

        <div className="auth-shell">
          <div className="auth-tabs" role="tablist" aria-label="Fiókműveletek">
            <button
              type="button"
              className={authMode === "signup" ? "active" : ""}
              onClick={() => switchAuthMode("signup")}
            >
              Regisztráció
            </button>
            <button
              type="button"
              className={authMode === "signin" ? "active" : ""}
              onClick={() => switchAuthMode("signin")}
            >
              Bejelentkezés
            </button>
          </div>

          {authState.type !== "idle" && <p className={`status ${authState.type}`}>{authState.message}</p>}

          {authUser ? (
            <div className="auth-profile">
              <h3>Sikeresen be vagy jelentkezve</h3>
              <p>
                <strong>Felhasználónév:</strong> {authUser.username}
              </p>
              <p>
                <strong>Email:</strong> {authUser.email}
              </p>
              <button type="button" className="ghost" onClick={handleSignOut}>
                Kijelentkezés
              </button>
            </div>
          ) : authMode === "signup" ? (
            <form className="auth-form" onSubmit={handleSignUp}>
              <label>
                Felhasználónév
                <input
                  required
                  minLength={3}
                  autoComplete="username"
                  value={signUpForm.username}
                  onChange={(e) =>
                    setSignUpForm((prev) => ({ ...prev, username: e.target.value }))
                  }
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={signUpForm.email}
                  onChange={(e) => {
                    setSignUpForm((prev) => ({ ...prev, email: e.target.value }));
                    setEmailCheckState({ type: "idle", message: "" });
                  }}
                  onBlur={() => {
                    if (signUpForm.email.trim()) {
                      checkEmailExists(signUpForm.email);
                    }
                  }}
                />
              </label>
              {emailCheckState.type !== "idle" && (
                <p className={`email-check ${emailCheckState.type}`}>{emailCheckState.message}</p>
              )}
              <label>
                Jelszó
                <div className="password-field">
                  <input
                    required
                    type={showPassword.signup ? "text" : "password"}
                    minLength={6}
                    autoComplete="new-password"
                    value={signUpForm.password}
                    onChange={(e) =>
                      setSignUpForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, signup: !prev.signup }))
                    }
                  >
                    {showPassword.signup ? "Elrejt" : "Mutat"}
                  </button>
                </div>
              </label>
              <label>
                Jelszó újra
                <div className="password-field">
                  <input
                    required
                    type={showPassword.signupConfirm ? "text" : "password"}
                    minLength={6}
                    autoComplete="new-password"
                    value={signUpForm.confirmPassword}
                    onChange={(e) =>
                      setSignUpForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        signupConfirm: !prev.signupConfirm,
                      }))
                    }
                  >
                    {showPassword.signupConfirm ? "Elrejt" : "Mutat"}
                  </button>
                </div>
              </label>
              <button type="submit" className="cta" disabled={authBusy}>
                {authBusy ? "Regisztráció folyamatban..." : "Fiók létrehozása"}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSignIn}>
              <label>
                Felhasználónév vagy email
                <input
                  required
                  autoComplete="username"
                  value={signInForm.identifier}
                  onChange={(e) => setSignInForm((prev) => ({ ...prev, identifier: e.target.value }))}
                />
              </label>
              <label>
                Jelszó
                <div className="password-field">
                  <input
                    required
                    type={showPassword.signin ? "text" : "password"}
                    autoComplete="current-password"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm((prev) => ({ ...prev, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, signin: !prev.signin }))
                    }
                  >
                    {showPassword.signin ? "Elrejt" : "Mutat"}
                  </button>
                </div>
              </label>
              <button type="submit" className="cta" disabled={authBusy}>
                {authBusy ? "Bejelentkezés..." : "Bejelentkezés"}
              </button>
            </form>
          )}
        </div>
      </section>
    );
  }

  if (location.pathname === "/admin") {
    content = (
      <section className="admin" id="admin">
        <div className="section-heading">
          <p className="eyebrow">Admin felület</p>
          <h2>Sporthelyek és események kezelése</h2>
          {status.type !== "idle" && <p className={`status ${status.type}`}>{status.message}</p>}
        </div>
        {!authUser && (
          <p className="status warning">
            Felhasználók listájához jelentkezz be egy admin szerepkörű fiókkal.
          </p>
        )}
        {authUser && !isAdmin && (
          <p className="status warning">
            Jelenleg {authUser.role} szerepkörrel vagy bejelentkezve, így a felhasználólista nem
            érhető el.
          </p>
        )}
        {isAdmin && (
          <section className="admin-users">
            <div className="admin-users-head">
              <div>
                <p className="eyebrow">Felhasználók</p>
                <h3>Regisztrált fiókok</h3>
              </div>
              <button
                type="button"
                className="ghost"
                disabled={adminUsersBusy}
                onClick={loadAdminUsers}
              >
                {adminUsersBusy ? "Frissítés..." : "Frissítés"}
              </button>
            </div>
            {adminUsersState.type !== "idle" && (
              <p className={`status ${adminUsersState.type}`}>{adminUsersState.message}</p>
            )}
            <div className="admin-user-grid">
              {adminUsers.length > 0 ? (
                adminUsers.map((user) => (
                  <article key={user.id}>
                    <h4>{user.username}</h4>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Szerepkör:</strong> {user.role}
                    </p>
                    <p>
                      <strong>Regisztráció:</strong> {user.registeredAt}
                    </p>
                    <p>
                      <strong>Bejelentkezések:</strong> {user.loginCount}
                    </p>
                    <p>
                      <strong>Utolsó sikeres belépés:</strong>{" "}
                      {user.lastSuccessfulLoginAt || "-"}
                    </p>
                  </article>
                ))
              ) : (
                <p className="admin-users-empty">
                  {adminUsersBusy
                    ? "Felhasználók betöltése..."
                    : "Nincs megjeleníthető felhasználói adat."}
                </p>
              )}
            </div>
          </section>
        )}
        {isAdmin && (
          <>
            <form className="admin-form" onSubmit={handleSubmit}>
              <input
                required
                placeholder="Megnevezés"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                required
                placeholder="Sporttípus"
                value={form.sportType}
                onChange={(e) => setForm((prev) => ({ ...prev, sportType: e.target.value }))}
              />
              <input
                required
                placeholder="Kategória"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              />
              <input
                required
                placeholder="Helyszín (város)"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              />
              <input
                required
                placeholder="Cím"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />
              <input
                required
                type="number"
                placeholder="Ár (Ft)"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              />
              <select
                value={form.timeSlot}
                onChange={(e) => setForm((prev) => ({ ...prev, timeSlot: e.target.value }))}
              >
                <option value="morning">Reggel</option>
                <option value="afternoon">Délután</option>
                <option value="evening">Este</option>
                <option value="weekend">Hétvége</option>
              </select>
              <input
                required
                placeholder="Nyitvatartás"
                value={form.openingHours}
                onChange={(e) => setForm((prev) => ({ ...prev, openingHours: e.target.value }))}
              />
              <input
                required
                placeholder="Kapcsolat"
                value={form.contact}
                onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))}
              />
              <input
                required
                placeholder="Kép URL"
                value={form.image}
                onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
              />
              <textarea
                required
                placeholder="Leírás"
                rows="3"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
              <div className="admin-actions">
                <button type="submit" className="cta">
                  {editingId ? "Módosítás mentése" : "Új sporthely hozzáadása"}
                </button>
                {editingId && (
                  <button type="button" className="ghost" onClick={resetForm}>
                    Mégse
                  </button>
                )}
              </div>
            </form>
            <div className="admin-list">
              {sports.slice(0, 8).map((item) => (
                <article key={item.id}>
                  <div>
                    <h4>{item.name}</h4>
                    <p>
                      {item.sportType} - {item.location}
                    </p>
                  </div>
                  <div className="admin-item-actions">
                    <button type="button" className="ghost" onClick={() => handleEdit(item)}>
                      Szerkesztés
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(item.id)}>
                      Törlés
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    );
  }

  return (
    <div className="page-shell">
      <Header authUser={authUser} onSignOut={handleSignOut} />
      <main className="route-shell" key={location.pathname}>
        {content}
      </main>
      <footer className="site-footer">
        <div className="footer-shell">
          <div className="footer-brand">
            <Link to="/" className="logo footer-logo">
              <span className="logo-mark">SH</span>
              <span className="logo-text">SportHub</span>
            </Link>
            <p className="footer-note">
              Tervezd meg a hetedet, tartsd egyben a kedvenceket, és mozogj tudatosan.
            </p>
            <div className="footer-badges">
              <span>Sport radar</span>
              <span>Élő szűrők</span>
              <span>Programterv</span>
            </div>
          </div>
          <div className="footer-links">
            <p className="eyebrow">Navigáció</p>
            <div className="footer-link-grid">
              {footerLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="footer-cta">
            {!authUser ? (
              <>
                <p className="eyebrow">Kezdés</p>
                <h3>Építs új ritmust a SportHubbal</h3>
                <p>Reális tervek, közeli helyszínek és gyors választás egy felületen.</p>
                <div className="footer-actions">
                  <Link to="/auth?mode=signup" className="cta">
                    Fiók létrehozása
                  </Link>
                  <Link to="/tippek" className="ghost">
                    Tippek
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="eyebrow">Üdv újra</p>
                <h3>{authUser.username || "SportHub tag"}</h3>
                <p>Pár gyors lépés, és már indulhat is a heti ritmusod.</p>
                <div className="footer-actions">
                  <Link to="/kinalat" className="cta">
                    Kínálat megnyitása
                  </Link>
                  <Link to="/kedvencek" className="ghost">
                    Kedvencek
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="ghost">
                      Admin felület
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="footer-legal">
          <p>SportHub {now.getFullYear()} - Minden jog fenntartva.</p>
          <p>Kapcsolat: hello@sporthub.hu</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
