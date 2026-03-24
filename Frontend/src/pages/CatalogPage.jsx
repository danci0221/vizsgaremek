import { useState, useMemo } from "react";
import SportsGrid from "../components/SportsGrid";

export default function CatalogPage({
  sports,
  uniqueTypes,
  uniqueLocations,
  uniqueCategories,
  favorites,
  compareIds,
  onToggleFavorite,
  onToggleCompare,
  initialQuery = "",
}) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState({
    type: "all",
    location: "all",
    category: "all",
    timeSlot: "all",
    price: "all",
    sort: "recommended",
    onlyFavorites: false,
  });

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

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

  const clearFilters = () => {
    setFilters({
      type: "all",
      location: "all",
      category: "all",
      timeSlot: "all",
      price: "all",
      sort: "recommended",
      onlyFavorites: false,
    });
    setQuery("");
  };

  return (
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
        onToggleFavorite={onToggleFavorite}
        onToggleCompare={onToggleCompare}
      />
    </>
  );
}
