import process from "node:process";
import { fileURLToPath } from "node:url";

export const HOST = process.env.SELENIUM_HOST || "127.0.0.1";
export const PORT = Number(process.env.SELENIUM_PORT || 4173);
export const BASE_URL = process.env.SELENIUM_BASE_URL || `http://${HOST}:${PORT}`;
export const BROWSER = (process.env.SELENIUM_BROWSER || "chrome").toLowerCase();
export const HEADLESS = process.env.SELENIUM_HEADLESS !== "false";
export const START_SERVER = process.env.SELENIUM_START_SERVER !== "false";
export const SERVER_TIMEOUT_MS = Number(process.env.SELENIUM_SERVER_TIMEOUT_MS || 45000);
export const FRONTEND_ROOT = fileURLToPath(new URL("../../", import.meta.url));
