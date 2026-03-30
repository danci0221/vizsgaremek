import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import TipsPage from "./pages/TipsPage";
import PlannerPage from "./pages/PlannerPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import MapPage from "./pages/MapPage";
import sportsData from "./data/Sports.json";
import { apiUrl } from "./lib/api";
import { toPercent } from "./lib/utils";
import {
  FAVORITES_KEY,
  FAVORITES_OWNER_KEY,
  AUTH_USER_KEY,
  signUpDefaults,
  signInDefaults,
  emptyForm,
  plannerDefaults,
  timeSlotLabels,
} from "./constants";
import {
  normalizeSport,
  normalizeAuthMode,
  isValidEmail,
  readErrorMessage,
} from "./lib/utils";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // ============== SPORTS & FAVORITES ==============
  const [sports, setSports] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [favoritesState, setFavoritesState] = useState({ type: "idle", message: "" });
  const [favoritesBusy, setFavoritesBusy] = useState(false);
  const [toast, setToast] = useState(null);

  // ============== REGISTRATIONS ==============
  const [registrations, setRegistrations] = useState([]);
  const [registrationsState, setRegistrationsState] = useState({ type: "idle", message: "" });
  const [registrationsBusy, setRegistrationsBusy] = useState(false);
  const [registrationPending, setRegistrationPending] = useState(() => new Set());

  // ============== AUTH ==============
  const [authUser, setAuthUser] = useState(null);
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

  // ============== ADMIN ==============
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersState, setAdminUsersState] = useState({ type: "idle", message: "" });
  const [adminUsersBusy, setAdminUsersBusy] = useState(false);
  const [adminRegistrations, setAdminRegistrations] = useState([]);
  const [adminRegistrationsState, setAdminRegistrationsState] = useState({
    type: "idle",
    message: "",
  });
  const [adminRegistrationsBusy, setAdminRegistrationsBusy] = useState(false);

  // ============== PLANNER ==============
  const [planner, setPlanner] = useState(plannerDefaults);
  const [plannerSubmitted, setPlannerSubmitted] = useState(false);

  // ============== TIME & MAP ==============
  const [now, setNow] = useState(() => new Date());
  const [mapFocusId, setMapFocusId] = useState(null);

  // ============== COMPUTED ==============
  const isAdmin = authUser?.role === "admin";
  const authMode = useMemo(() => normalizeAuthMode(location.search), [location.search]);
  const uniqueTypes = useMemo(() => [...new Set(sports.map((item) => item.sportType))], [sports]);
  const uniqueLocations = useMemo(() => [...new Set(sports.map((item) => item.location))], [sports]);
  const uniqueCategories = useMemo(() => [...new Set(sports.map((item) => item.category))], [sports]);
  const registrationBySportId = useMemo(() => {
    const lookup = {};
    registrations.forEach((entry) => {
      lookup[entry.sportId] = entry;
    });
    return lookup;
  }, [registrations]);

  // Derived state for live day and time labels
  const liveDayLabel = useMemo(() => {
    const days = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
    return days[now.getDay()];
  }, [now]);

  const liveTimeLabel = useMemo(() => {
    const hour = now.getHours();
    if (hour >= 6 && hour < 12) return "reggel";
    if (hour >= 12 && hour < 17) return "délután";
    if (hour >= 17 && hour < 21) return "este";
    return "éjjel";
  }, [now]);

  // ============== ROUTE VALIDATION ==============
  useEffect(() => {
    const allowedPaths = new Set([
      "/",
      "/kinalat",
      "/tippek",
      "/programterv",
      "/fiok",
      "/kedvencek",
      "/terkep",
      "/admin",
      "/auth",
    ]);
    if (!allowedPaths.has(location.pathname)) {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const protectedPaths = new Set(["/fiok", "/kedvencek"]);
    if (protectedPaths.has(location.pathname) && !authUser) {
      navigate("/auth?mode=signin", { replace: true });
    }
  }, [authUser, location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname === "/auth" && authUser) {
      navigate("/fiok", { replace: true });
    }
  }, [authUser, location.pathname, navigate]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const resetFavoritesForAnon = () => {
    setFavorites([]);
    setFavoritesState({ type: "idle", message: "" });
    setFavoritesBusy(false);
    localStorage.removeItem(FAVORITES_KEY);
    localStorage.setItem(FAVORITES_OWNER_KEY, "anon");
  };

  const refreshFavorites = async ({ silent = false } = {}) => {
    if (!authUser?.email) {
      resetFavoritesForAnon();
      return;
    }

    if (favoritesBusy) return;
    setFavoritesBusy(true);
    if (!silent) setFavoritesState({ type: "idle", message: "" });

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
        const errorMessage = await readErrorMessage(response, "Nem sikerült frissíteni a kedvenceket.");
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const serverFavorites = Array.isArray(data.favorites)
        ? data.favorites.map((value) => Number(value)).filter((value) => Number.isFinite(value))
        : [];
      const merged = Array.from(new Set([...serverFavorites, ...localFavorites]));

      setFavorites(merged);

      const missing = merged.filter((id) => !serverFavorites.includes(id));
      if (missing.length > 0) {
        await Promise.all(
          missing.map(async (sportId) => {
            const syncResponse = await fetch(apiUrl("/favorites"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-User-Email": authUser.email,
              },
              body: JSON.stringify({ sportId }),
            });
            if (!syncResponse.ok) {
              throw new Error("Nem sikerült minden kedvencet szinkronizálni.");
            }
          })
        );
      }

      if (!silent) {
        setFavoritesState({ type: "success", message: "Kedvencek frissítve." });
        showToast("success", "Kedvencek frissítve.");
      }
    } catch (error) {
      setFavoritesState({ type: "error", message: error.message });
      showToast("error", error.message);
    } finally {
      setFavoritesBusy(false);
    }
  };

  // ============== FAVORITES - LOCAL ==============
  useEffect(() => {
    const owner = localStorage.getItem(FAVORITES_OWNER_KEY);
    if (owner && owner !== "anon") return;

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

  // ============== FAVORITES - SERVER SYNC ==============
  useEffect(() => {
    if (authUser?.email) {
      refreshFavorites({ silent: true });
      return;
    }
    const owner = localStorage.getItem(FAVORITES_OWNER_KEY);
    if (owner && owner !== "anon") {
      resetFavoritesForAnon();
    }
  }, [authUser?.email]);

  // ============== AUTH - LOCAL ==============
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

  // ============== TIME TICKER ==============
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  // ============== LOAD SPORTS ==============
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

  // ============== ADMIN RESET ==============
  useEffect(() => {
    if (!authUser || authUser.role !== "admin") {
      setAdminUsers([]);
      setAdminUsersState({ type: "idle", message: "" });
      setAdminRegistrations([]);
      setAdminRegistrationsState({ type: "idle", message: "" });
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser?.email) {
      setRegistrations([]);
      setRegistrationsState({ type: "idle", message: "" });
      setRegistrationsBusy(false);
      setRegistrationPending(new Set());
      return;
    }

    loadRegistrations({ silent: true });
  }, [authUser?.email]);

  // ============== EVENT HANDLERS ==============

  const applyScenario = (scenario) => {
    const nextQuery = scenario?.query || "";
    setQuery(nextQuery);
    navigate("/kinalat", {
      state: {
        searchQuery: nextQuery,
        presetFilters: scenario?.filters || null,
      },
    });
  };

  const toggleFavorite = async (id) => {
    const previousFavorites = favorites;
    const isFav = previousFavorites.includes(id);
    const newFavorites = isFav
      ? previousFavorites.filter((fid) => fid !== id)
      : [...previousFavorites, id];
    setFavorites(newFavorites);

    const successMessage = isFav
      ? "Eltávolítva a kedvencekből."
      : "Hozzáadva a kedvencekhez.";

    if (!authUser?.email) {
      setFavoritesState({ type: "success", message: successMessage });
      showToast("success", successMessage);
      return;
    }

    try {
      const url = isFav ? apiUrl(`/favorites/${id}`) : apiUrl(`/favorites`);
      const method = isFav ? "DELETE" : "POST";
      const headers = { "X-User-Email": authUser.email };
      if (!isFav) headers["Content-Type"] = "application/json";

      const response = await fetch(url, {
        method,
        headers,
        body: isFav ? undefined : JSON.stringify({ sportId: id }),
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response, "Kedvenc módosítás hiba.");
        throw new Error(errorMessage);
      }

      setFavoritesState({ type: "success", message: successMessage });
      showToast("success", successMessage);
    } catch (error) {
      setFavoritesState({ type: "error", message: error.message });
      showToast("error", error.message);
      setFavorites(previousFavorites);
    }
  };

  const markRegistrationPending = (sportId) => {
    setRegistrationPending((prev) => {
      const next = new Set(prev);
      next.add(sportId);
      return next;
    });
  };

  const clearRegistrationPending = (sportId) => {
    setRegistrationPending((prev) => {
      const next = new Set(prev);
      next.delete(sportId);
      return next;
    });
  };

  const loadRegistrations = async ({ silent = false } = {}) => {
    if (!authUser?.email || registrationsBusy) return;

    setRegistrationsBusy(true);
    setRegistrationsState({ type: "idle", message: "" });

    try {
      const response = await fetch(apiUrl("/registrations"), {
        headers: {
          "X-User-Email": authUser.email,
        },
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(
          response,
          "Nem sikerålt betölteni a jelentkezéseket."
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.registrations)
          ? data.registrations
          : [];

      setRegistrations(list);
      if (!silent) {
        setRegistrationsState({ type: "success", message: "Jelentkezések betöltve." });
      }
    } catch (error) {
      setRegistrationsState({ type: "error", message: error.message });
    } finally {
      setRegistrationsBusy(false);
    }
  };

  const handleCreateRegistration = async (sportId) => {
    if (!authUser?.email) {
      navigate("/auth?mode=signin");
      return;
    }

    if (registrationPending.has(sportId)) return;

    markRegistrationPending(sportId);
    setRegistrationsState({ type: "idle", message: "" });

    try {
      const response = await fetch(apiUrl("/registrations"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": authUser.email,
        },
        body: JSON.stringify({ sportId }),
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response, "Sikertelen jelentkezés.");
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setRegistrations((prev) => {
        const next = prev.filter((item) => item.sportId !== sportId);
        return [data, ...next];
      });
      setRegistrationsState({ type: "success", message: "Sikeres jelentkezés." });
    } catch (error) {
      setRegistrationsState({ type: "error", message: error.message });
    } finally {
      clearRegistrationPending(sportId);
    }
  };

  const handleCancelRegistration = async (registration) => {
    if (!authUser?.email || !registration?.id) return;

    const sportId = registration.sportId;
    if (registrationPending.has(sportId)) return;

    markRegistrationPending(sportId);
    setRegistrationsState({ type: "idle", message: "" });

    try {
      const response = await fetch(apiUrl(`/registrations/${registration.id}`), {
        method: "DELETE",
        headers: {
          "X-User-Email": authUser.email,
        },
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response, "Sikertelen lemondás.");
        throw new Error(errorMessage);
      }

      setRegistrations((prev) =>
        prev.map((item) =>
          item.id === registration.id ? { ...item, status: "lemondva" } : item
        )
      );
      setRegistrationsState({ type: "success", message: "Jelentkezés lemondva." });
    } catch (error) {
      setRegistrationsState({ type: "error", message: error.message });
    } finally {
      clearRegistrationPending(sportId);
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

  const normalizeAuthUser = (apiResponse) => {
    if (!apiResponse) return null;

    const user = apiResponse.user || apiResponse;
    if (!user) return null;

    return {
      id: typeof user.id === "number" ? user.id : Number(user.id) || null,
      username: user.username || user.felhasznalonev || user.name || "",
      email: user.email || user.mail || "",
      role: user.role || user.szerepkor || "user",
      registeredAt: user.registeredAt || user.regisztracio_datum || null,
    };
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
        setEmailCheckState({ type: "success", message: "Ez az email elérhető." });
      }

      return data;
    } catch (error) {
      setEmailCheckState({ type: "error", message: error.message });
      return { ok: false, exists: false };
    }
  };

  const loadAdminUsers = async () => {
    if (!isAdmin || adminUsersBusy) return;

    setAdminUsersBusy(true);
    setAdminUsersState({ type: "idle", message: "" });

    try {
      const headers = authUser?.email ? { "X-Admin-Email": authUser.email } : undefined;
      const response = await fetch(apiUrl("/admin/users"), { headers });
      if (!response.ok) {
        const errorMessage = await readErrorMessage(response, "Nem sikerült betölteni a felhasználókat.");
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const users = Array.isArray(data) ? data : Array.isArray(data.users) ? data.users : [];
      setAdminUsers(users);
      setAdminUsersState({ type: "success", message: "Felhasználók betöltve." });
    } catch (error) {
      setAdminUsersState({ type: "error", message: error.message });
    } finally {
      setAdminUsersBusy(false);
    }
  };

  const loadAdminRegistrations = async () => {
    if (!isAdmin || adminRegistrationsBusy) return;

    setAdminRegistrationsBusy(true);
    setAdminRegistrationsState({ type: "idle", message: "" });

    try {
      const headers = authUser?.email ? { "X-Admin-Email": authUser.email } : undefined;
      const response = await fetch(apiUrl("/admin/registrations"), { headers });
      if (!response.ok) {
        const errorMessage = await readErrorMessage(
          response,
          "Nem sikerålt betölteni a jelentkezéseket."
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.registrations)
          ? data.registrations
          : [];
      setAdminRegistrations(list);
      setAdminRegistrationsState({ type: "success", message: "Jelentkezések betöltve." });
    } catch (error) {
      setAdminRegistrationsState({ type: "error", message: error.message });
    } finally {
      setAdminRegistrationsBusy(false);
    }
  };

  const switchAuthMode = (mode) => {
    navigate(`/auth?mode=${mode}`);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (signUpForm.password !== signUpForm.confirmPassword) {
      setAuthState({ type: "error", message: "A jelszó és a megerősítése nem egyezik." });
      return;
    }

    setAuthBusy(true);
    setAuthState({ type: "idle", message: "" });

    try {
      const response = await fetch(apiUrl("/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signUpForm.username,
          email: signUpForm.email,
          password: signUpForm.password,
        }),
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response, "Regisztráció hiba.");
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const user = normalizeAuthUser(data);
      console.log("signup user", data, user);
      setAuthUser(user);
      setSignUpForm(signUpDefaults);
      setAuthState({ type: "success", message: "Sikeres regisztráció!" });
      navigate("/fiok");
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
          identifier: signInForm.identifier,
          password: signInForm.password,
        }),
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response, "Bejelentkezés hiba.");
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const user = normalizeAuthUser(data);
      console.log("signin user", data, user);
      setAuthUser(user);
      setSignInForm(signInDefaults);
      setAuthState({ type: "success", message: "Sikeres bejelentkezés!" });
      navigate("/fiok");
    } catch (error) {
      setAuthState({ type: "error", message: error.message });
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = () => {
    setAuthUser(null);
    resetFavoritesForAnon();
    setAuthState({ type: "success", message: "Sikeresen kijelentkeztél." });
    navigate("/auth");
  };

  // ============== RENDER ==============
  let content = null;

  if (location.pathname === "/") {
    content = (
      <>
        <Hero
          favoriteCount={favorites.length}
          resultCount={sports.length}
          liveDayLabel={liveDayLabel}
          liveTimeLabel={liveTimeLabel}
        />
        <HomePage
          sports={sports}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onApplyScenario={applyScenario}
          authUser={authUser}
        />
      </>
    );
  }

  if (location.pathname === "/kinalat") {
    content = (
      <>
        <Hero
          favoriteCount={favorites.length}
          resultCount={sports.length}
          liveDayLabel={liveDayLabel}
          liveTimeLabel={liveTimeLabel}
        />
        <CatalogPage
          sports={sports}
          uniqueTypes={uniqueTypes}
          uniqueLocations={uniqueLocations}
          uniqueCategories={uniqueCategories}
          authUser={authUser}
          favorites={favorites}
          compareIds={compareIds}
          onToggleFavorite={toggleFavorite}
          onToggleCompare={toggleCompare}
          registrationBySportId={registrationBySportId}
          registrationPending={registrationPending}
          onCreateRegistration={handleCreateRegistration}
          onCancelRegistration={handleCancelRegistration}
          initialQuery={location.state?.searchQuery ?? query}
          initialPreset={location.state?.presetFilters ?? null}
        />
      </>
    );
  }

  if (location.pathname === "/tippek") {
    content = <TipsPage />;
  }

  if (location.pathname === "/programterv") {
    content = (
      <PlannerPage
        sports={sports}
        uniqueTypes={uniqueTypes}
        uniqueLocations={uniqueLocations}
        onOpenInCatalog={openInCatalog}
      />
    );
  }

  if (location.pathname === "/fiok") {
    content = (
      <>
        <Hero
          favoriteCount={favorites.length}
          resultCount={sports.length}
          liveDayLabel={liveDayLabel}
          liveTimeLabel={liveTimeLabel}
        />
        <ProfilePage
          authUser={authUser}
          favoriteCount={favorites.length}
          isAdmin={isAdmin}
          onSignOut={handleSignOut}
          registrations={registrations}
          registrationsState={registrationsState}
          registrationsBusy={registrationsBusy}
          registrationPending={registrationPending}
          onRefreshRegistrations={loadRegistrations}
          onCancelRegistration={handleCancelRegistration}
        />
      </>
    );
  }

  if (location.pathname === "/kedvencek") {
    content = (
      <>
        <Hero
          favoriteCount={favorites.length}
          resultCount={favorites.length}
          liveDayLabel={liveDayLabel}
          liveTimeLabel={liveTimeLabel}
        />
      <FavoritesPage
        sports={sports}
        favorites={favorites}
        compareIds={compareIds}
        onToggleFavorite={toggleFavorite}
        onToggleCompare={toggleCompare}
        onOpenInCatalog={openInCatalog}
        favoritesState={favoritesState}
        favoritesBusy={favoritesBusy}
        onRefreshFavorites={refreshFavorites}
      />
      </>
    );
  }

  if (location.pathname === "/terkep") {
    content = (
      <MapPage
        sports={sports}
        mapFocusId={mapFocusId}
        onFocusItem={setMapFocusId}
      />
    );
  }

  if (location.pathname === "/auth") {
    content = (
      <AuthPage
        authMode={authMode}
        authState={authState}
        authBusy={authBusy}
        emailCheckState={emailCheckState}
        showPassword={showPassword}
        signUpForm={signUpForm}
        signInForm={signInForm}
        onSwitchMode={switchAuthMode}
        onSignUp={handleSignUp}
        onSignIn={handleSignIn}
        onEmailCheck={checkEmailExists}
        onShowPasswordChange={setShowPassword}
        onSignUpFormChange={setSignUpForm}
        onSignInFormChange={setSignInForm}
      />
    );
  }

  if (location.pathname === "/admin") {
    content = (
      <AdminPage
        authUser={authUser}
        isAdmin={isAdmin}
        status={status}
        form={form}
        editingId={editingId}
        sports={sports}
        adminUsers={adminUsers}
        adminUsersState={adminUsersState}
        adminUsersBusy={adminUsersBusy}
        adminRegistrations={adminRegistrations}
        adminRegistrationsState={adminRegistrationsState}
        adminRegistrationsBusy={adminRegistrationsBusy}
        onFormChange={setForm}
        onSubmit={handleSubmit}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResetForm={resetForm}
        onLoadAdminUsers={loadAdminUsers}
        onLoadAdminRegistrations={loadAdminRegistrations}
      />
    );
  }

  return (
    <div className="page-shell">
      <Header authUser={authUser} onSignOut={handleSignOut} />
      <main className="route-shell" key={location.pathname}>
        {content}
      </main>
      {toast && (
        <div className={`toast ${toast.type || ""}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
      <Footer authUser={authUser} isAdmin={isAdmin} now={now} onSignOut={handleSignOut} />
    </div>
  );
}

export default App;
