export function formatPriceLabel(priceValue) {
  const price = Number(priceValue) || 0;
  if (price <= 0) return "Ingyenes";
  return `${price.toLocaleString("hu-HU")} Ft`;
}

export function calculateRecommendationScore(item) {
  let score = 0;
  if (item.price === 0) score += 30;
  if (item.timeSlot === "weekend") score += 18;
  if (item.timeSlot === "evening") score += 12;
  if ((item.category || "").toLowerCase().includes("sport")) score += 8;
  if ((item.description || "").length > 70) score += 6;
  score += Math.max(0, 14000 - item.price) / 1000;
  return Math.round(score);
}

export function toPercent(count, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((count / total) * 100));
}

export function normalizeSport(item, index) {
  const price = Number(item.price) || 0;
  return {
    ...item,
    id: item.id ?? Date.now() + index,
    price,
    priceLabel: item.priceLabel || formatPriceLabel(price),
    recommendationScore: calculateRecommendationScore({ ...item, price }),
  };
}

export function normalizeAuthMode(search) {
  const mode = new URLSearchParams(search).get("mode");
  return mode === "signup" ? "signup" : "signin";
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export async function readErrorMessage(response, fallbackMessage) {
  try {
    const data = await response.json();
    if (data?.message) return data.message;
  } catch {
    // Ignore JSON parsing error and use fallback.
  }
  return fallbackMessage;
}
