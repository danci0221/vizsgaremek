const baseFromEnv = import.meta.env.VITE_API_URL?.trim();

const normalizedBase = (() => {
  if (import.meta.env.DEV) return "/api";
  if (!baseFromEnv) return "http://localhost:3001/api";
  return baseFromEnv.replace(/\/+$/, "");
})();

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
