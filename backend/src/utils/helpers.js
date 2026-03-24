import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function normalizeHeaderValue(value) {
  if (Array.isArray(value)) return String(value[0] || "");
  return String(value || "");
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, hashHex] = String(storedHash || "").split(":");
  if (!salt || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, salt, expected.length);
  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}

export function toPriceLabel(price) {
  return Number(price) === 0 ? "Ingyenes" : `${Number(price).toLocaleString("hu-HU")} Ft / alkalom`;
}

export function readBody(req) {
  // Express already parses JSON body via express.json() middleware
  return Promise.resolve(req.body || {});
}

export function json(res, status, payload) {
  res.status(status).json(payload);
}
