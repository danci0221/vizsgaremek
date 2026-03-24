import { toPriceLabel } from "./helpers.js";

const ADMIN_EMAILS = new Set(
  String(process.env.ADMIN_EMAILS || "")
    .split(/[,;]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
);

export function isAdminAllowlistEnabled() {
  return ADMIN_EMAILS.size > 0;
}

export function isEmailInAdminAllowlist(email) {
  if (!email) return false;
  return ADMIN_EMAILS.has(String(email || "").trim().toLowerCase());
}

export function resolveUserRole(email, dbRole) {
  if (isAdminAllowlistEnabled()) {
    return isEmailInAdminAllowlist(email) ? "admin" : "user";
  }
  return dbRole || "user";
}

export function mapRowToSport(row) {
  return {
    id: row.id,
    name: row.nev,
    sportType: row.sport,
    category: row.kategoria,
    location: row.varos,
    address: row.cim,
    price: Number(row.ar ?? 0),
    priceLabel: toPriceLabel(row.ar ?? 0),
    timeSlot: row.idoszak || "morning",
    openingHours: row.nyitvatartas,
    contact: row.kapcsolat,
    description: row.megjegyzes,
    image: row.kep_url,
  };
}

export function mapUserRowToProfile(row) {
  return {
    id: row.id,
    username: row.felhasznalonev,
    email: row.email,
    role: resolveUserRole(row.email, row.szerepkor),
    registeredAt: row.regisztracio_datum,
  };
}

export function mapAdminUserRow(row) {
  return {
    id: row.id,
    username: row.felhasznalonev,
    email: row.email,
    role: resolveUserRole(row.email, row.szerepkor),
    registeredAt: row.regisztracio_datum,
    loginCount: Number(row.login_count || 0),
    lastSuccessfulLoginAt: row.last_successful_login || null,
  };
}

export function mapRegistrationRow(row) {
  return {
    id: row.id,
    sportId: Number(row.sport_id),
    sportName: row.sport_name,
    sportType: row.sport_type,
    location: row.location,
    address: row.address,
    price: Number(row.price ?? 0),
    priceLabel: toPriceLabel(row.price ?? 0),
    timeSlot: row.time_slot || "morning",
    openingHours: row.opening_hours,
    contact: row.contact,
    image: row.image,
    status: row.allapot,
    registeredAt: row.jelentkezes_idopont,
  };
}

export function mapFullRegistrationRow(row) {
  return {
    id: row.id,
    userId: Number(row.user_id),
    username: row.username,
    email: row.email,
    sportId: Number(row.sport_id),
    sportName: row.sport_name,
    sportType: row.sport_type,
    location: row.location,
    address: row.address,
    price: Number(row.price ?? 0),
    priceLabel: toPriceLabel(row.price ?? 0),
    timeSlot: row.time_slot || "morning",
    openingHours: row.opening_hours,
    contact: row.contact,
    image: row.image,
    status: row.allapot,
    registeredAt: row.jelentkezes_idopont,
  };
}

export function mapCategoryRow(row) {
  return {
    id: row.id,
    name: row.nev,
  };
}

export function mapSportTypeRow(row) {
  return {
    id: row.id,
    name: row.nev,
  };
}

export function mapLocationRow(row) {
  return {
    id: row.id,
    city: row.varos,
    address: row.cim,
  };
}

export function mapOrganizerRow(row) {
  return {
    id: row.id,
    name: row.nev,
    phone: row.telefon,
    email: row.email,
    website: row.weboldal,
  };
}
