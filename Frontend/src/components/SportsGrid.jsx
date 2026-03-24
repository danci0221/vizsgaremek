import { useState } from "react";

const timeSlotLabels = {
  morning: "Reggel",
  afternoon: "Délután",
  evening: "Este",
  weekend: "Hétvége",
};

const priceLabels = {
  all: "Minden ár",
  free: "Ingyenes",
  budget: "0 - 5 000 Ft",
  mid: "5 001 - 10 000 Ft",
  premium: "10 000+ Ft",
};

const sortLabels = {
  recommended: "Ajánlott sorrend",
  "name-asc": "Név szerint",
  "price-asc": "Ár szerint növekvő",
  "price-desc": "Ár szerint csökkenő",
};

export default function SportsGrid({
  sports,
  filters,
  onFilterChange,
  onClearFilters,
  uniqueTypes,
  uniqueLocations,
  uniqueCategories,
  favoriteSet,
  compareIds,
  onToggleFavorite,
  onToggleCompare,
}) {
  const [selected, setSelected] = useState(null);

  const updateFilter = (key, value) => {
    onFilterChange((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <section className="sports" id="sports">
        <div className="section-heading">
          <p className="eyebrow">Keresés és szűrés</p>
          <h2>Sporthelyek és események</h2>
        </div>

        <div className="filters">
          <select value={filters.type} onChange={(e) => updateFilter("type", e.target.value)}>
            <option value="all">Minden sporttípus</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={filters.location}
            onChange={(e) => updateFilter("location", e.target.value)}
          >
            <option value="all">Minden helyszín</option>
            {uniqueLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
          >
            <option value="all">Minden kategória</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filters.timeSlot}
            onChange={(e) => updateFilter("timeSlot", e.target.value)}
          >
            <option value="all">Minden időpont</option>
            {Object.entries(timeSlotLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select value={filters.price} onChange={(e) => updateFilter("price", e.target.value)}>
            {Object.entries(priceLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
            {Object.entries(sortLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="toggle-row">
          <label className="switcher">
            <input
              type="checkbox"
              checked={filters.onlyFavorites}
              onChange={(e) => updateFilter("onlyFavorites", e.target.checked)}
            />
            <span>Csak kedvencek</span>
          </label>
          <button type="button" className="ghost" onClick={onClearFilters}>
            Szűrők nullázása
          </button>
        </div>

        <div className="grid">
          {sports.map((sport) => {
            const isFavorite = favoriteSet.has(sport.id);
            const isComparing = compareIds.includes(sport.id);

            return (
              <article key={sport.id} className="card" onClick={() => setSelected(sport)}>
                <img src={sport.image} alt={sport.name} />
                <div className="card-content">
                  <p className="chip">{sport.category}</p>
                  <h3>{sport.name}</h3>
                  <p className="card-meta">
                    {sport.sportType} - {sport.location}
                  </p>
                  <p className="card-meta muted">
                    {timeSlotLabels[sport.timeSlot]} sáv - Pontszám {sport.recommendationScore}
                  </p>
                  <p className="price">{sport.priceLabel}</p>

                  <div className="card-footer">
                    <span className="slot-chip">{timeSlotLabels[sport.timeSlot]}</span>
                    <span className="score-chip">#{sport.recommendationScore}</span>
                  </div>

                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={isFavorite ? "cta" : "ghost"}
                      onClick={() => onToggleFavorite(sport.id)}
                    >
                      {isFavorite ? "Kedvenc" : "Kedvencnek"}
                    </button>
                    <button
                      type="button"
                      className={isComparing ? "dark-btn" : "ghost"}
                      onClick={() => onToggleCompare(sport.id)}
                    >
                      {isComparing ? "Kijelölve" : "Összehasonlít"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {sports.length === 0 && (
          <p className="empty-state">
            Nincs találat a megadott szűrőkkel. Próbáld más kombinációval.
          </p>
        )}
      </section>

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selected.image} alt={selected.name} />
            <h2>{selected.name}</h2>
            <p>{selected.description}</p>
            <ul>
              <li>
                <strong>Sport:</strong> {selected.sportType}
              </li>
              <li>
                <strong>Helyszín:</strong> {selected.location}
              </li>
              <li>
                <strong>Cím:</strong> {selected.address}
              </li>
              <li>
                <strong>Ár:</strong> {selected.priceLabel}
              </li>
              <li>
                <strong>Idősáv:</strong> {timeSlotLabels[selected.timeSlot]}
              </li>
              <li>
                <strong>Ajánlási pontszám:</strong> {selected.recommendationScore}
              </li>
              <li>
                <strong>Nyitvatartás:</strong> {selected.openingHours}
              </li>
              <li>
                <strong>Elérhetőség:</strong> {selected.contact}
              </li>
            </ul>
            <button className="cta" onClick={() => setSelected(null)}>
              Bezárás
            </button>
          </div>
        </div>
      )}
    </>
  );
}
