export const validTimeSlots = new Set(["morning", "afternoon", "evening", "weekend"]);

export function validateSignupPayload(body) {
  const username = String(body.username || "").trim();
  const email = String(body.email || "").trim();
  const password = String(body.password || "");

  if (username.length < 3) return "A felhasználónév minimum 3 karakter legyen.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Érvénytelen email cím.";
  if (password.length < 6) return "A jelszó minimum 6 karakter legyen.";
  return null;
}

export function validateSigninPayload(body) {
  const identifier = String(body.identifier || "").trim();
  const password = String(body.password || "");
  if (!identifier) return "Adj meg emailt vagy felhasználónevet.";
  if (!password) return "Add meg a jelszót.";
  return null;
}

export function validateSportPayload(body) {
  const required = [
    "name",
    "sportType",
    "category",
    "location",
    "address",
    "timeSlot",
    "openingHours",
    "contact",
    "description",
    "image",
  ];

  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === "") {
      return `Hiányzó mező: ${field}`;
    }
  }

  if (!validTimeSlots.has(body.timeSlot)) {
    return "Érvénytelen idősáv.";
  }

  return null;
}
