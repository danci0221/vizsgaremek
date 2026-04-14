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

const scheduleFallbackBySlot = {
  morning: "H-P 06:00-10:00",
  afternoon: "H-P 12:00-18:00",
  evening: "H-P 17:00-22:00",
  weekend: "Szo-V 09:00-18:00",
};

const sportTypeImages = {
  Tenisz:
    "https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=1400&q=80",
  Futás:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80",
  "Úszás":
    "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1400&q=80",
  "Jóga":
    "https://images.unsplash.com/photo-1549570652-97324981a6fd?auto=format&fit=crop&w=1400&q=80",
  Konditerem:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80",
};

function resolveSportImage(sport) {
  return sportTypeImages[sport.sportType] || sport.image;
}

function resolveOpeningHours(sport) {
  return sport.openingHours || scheduleFallbackBySlot[sport.timeSlot] || "H-P 08:00-20:00";
}

function formatRegistrationStatus(status) {
  return status === "lemondva" ? "Lemondva" : "Aktív";
}

function formatRegistrationDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SportsGrid({
  sports,
  filters,
  onFilterChange,
  onClearFilters,
  uniqueTypes,
  uniqueLocations,
  uniqueCategories,
  authUser,
  favoriteSet,
  registrationBySportId,
  registrationPending,
  onCreateRegistration,
  onCancelRegistration,
  onToggleFavorite,
}) {
  const [selected, setSelected] = useState(null);
  const canUseAccountActions = Boolean(authUser);

  const updateFilter = (key, value) => {
    onFilterChange((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <section className="sports" id="sports" data-testid="sports-grid-section">
        <div className="section-heading">
          <p className="eyebrow">Keresés és szűrés</p>
          <h2>Sporthelyek és események</h2>
        </div>

        <div className="filters">
          <select
            data-testid="filter-type"
            value={filters.type}
            onChange={(e) => updateFilter("type", e.target.value)}
          >
            <option value="all">Minden sporttípus</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            data-testid="filter-location"
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
            data-testid="filter-category"
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
            data-testid="filter-time-slot"
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

          <select
            data-testid="filter-price"
            value={filters.price}
            onChange={(e) => updateFilter("price", e.target.value)}
          >
            {Object.entries(priceLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            data-testid="filter-sort"
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
          >
            {Object.entries(sortLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="toggle-row">
          {canUseAccountActions ? (
            <label className="switcher">
              <input
                type="checkbox"
                checked={filters.onlyFavorites}
                onChange={(e) => updateFilter("onlyFavorites", e.target.checked)}
              />
              <span>Csak kedvencek</span>
            </label>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="ghost"
            data-testid="clear-filters"
            onClick={onClearFilters}
          >
            Szűrők nullázása
          </button>
        </div>

        <div className="grid" data-testid="sports-grid">
          {sports.map((sport) => {
            const isFavorite = favoriteSet.has(sport.id);
            const cardImage = resolveSportImage(sport);
            const registration = registrationBySportId?.[sport.id];
            const isRegistered = registration?.status === "aktiv";
            const isCancelled = registration?.status === "lemondva";
            const isPending = registrationPending?.has
              ? registrationPending.has(sport.id)
              : false;
            const registrationLabel = isPending
              ? "Mentés..."
              : isRegistered
                ? "Lemondás"
                : isCancelled
                  ? "Lemondva"
                  : "Jelentkezem";
            const registrationClass = isRegistered
              ? "danger-outline"
              : isCancelled
                ? "ghost"
                : "cta";
            const registrationDisabled = isPending || isCancelled;

            return (
              <article
                key={sport.id}
                className="card"
                data-testid="sport-card"
                data-sport-name={sport.name}
                onClick={() => setSelected(sport)}
              >
                <img src={cardImage} alt={sport.name} />
                <div className="card-content">
                  <p className="chip">{sport.category}</p>
                  <h3>{sport.name}</h3>
                  <p className="card-meta">
                    {sport.sportType} - {sport.location}
                  </p>
                  <p className="card-meta muted">
                    {resolveOpeningHours(sport)}
                  </p>
                  <p className="price">{sport.priceLabel}</p>

                  <div className="card-footer">
                    <span className="slot-chip">{timeSlotLabels[sport.timeSlot]}</span>
                    <span className="score-chip">#{sport.recommendationScore}</span>
                    {registration && (
                      <span
                        className={`registration-status ${
                          isRegistered ? "active" : "cancelled"
                        }`}
                      >
                        {formatRegistrationStatus(registration.status)}
                      </span>
                    )}
                  </div>

                  {canUseAccountActions && (
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
                        className={registrationClass}
                        disabled={registrationDisabled}
                        onClick={() => {
                          if (isRegistered) {
                            onCancelRegistration?.(registration);
                            return;
                          }
                          if (!isCancelled) onCreateRegistration?.(sport.id);
                        }}
                      >
                        {registrationLabel}
                      </button>
                    </div>
                  )}
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
            <img src={resolveSportImage(selected)} alt={selected.name} />
            <h2>{selected.name}</h2>
            <p>{selected.description}</p>
            {(() => {
              const registration = registrationBySportId?.[selected.id];
              if (!registration) return null;
              const statusClass = registration.status === "aktiv" ? "success" : "warning";
              return (
                <p className={`status ${statusClass}`}>
                  Jelentkezés: {formatRegistrationStatus(registration.status)}
                  {registration.registeredAt
                    ? ` - ${formatRegistrationDate(registration.registeredAt)}`
                    : ""}
                </p>
              );
            })()}
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
                <strong>Nyitvatartás:</strong> {resolveOpeningHours(selected)}
              </li>
              <li>
                <strong>Elérhetőség:</strong> {selected.contact}
              </li>
            </ul>
            {authUser ? (
              <div className="modal-actions">
                {(() => {
                  const registration = registrationBySportId?.[selected.id];
                  const isRegistered = registration?.status === "aktiv";
                  const isCancelled = registration?.status === "lemondva";
                  const isPending = registrationPending?.has
                    ? registrationPending.has(selected.id)
                    : false;
                  const registrationLabel = isPending
                    ? "Mentés..."
                    : isRegistered
                      ? "Lemondás"
                      : isCancelled
                        ? "Lemondva"
                        : "Jelentkezem";
                  const registrationClass = isRegistered
                    ? "danger-outline"
                    : isCancelled
                      ? "ghost"
                      : "cta";
                  const registrationDisabled = isPending || isCancelled;

                  return (
                    <button
                      type="button"
                      className={registrationClass}
                      disabled={registrationDisabled}
                      onClick={() => {
                        if (isRegistered) {
                          onCancelRegistration?.(registration);
                          return;
                        }
                        if (!isCancelled) onCreateRegistration?.(selected.id);
                      }}
                    >
                      {registrationLabel}
                    </button>
                  );
                })()}
                <button className="ghost" onClick={() => setSelected(null)}>
                  Bezárás
                </button>
              </div>
            ) : (
              <button className="cta" onClick={() => setSelected(null)}>
                Bezárás
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
