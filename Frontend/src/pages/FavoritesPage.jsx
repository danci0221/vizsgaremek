import { useMemo } from "react";

export default function FavoritesPage({
  sports,
  favorites,
  compareIds,
  onToggleFavorite,
  onToggleCompare,
  onOpenInCatalog,
}) {
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const favoriteSports = useMemo(
    () => sports.filter((item) => favoriteSet.has(item.id)),
    [sports, favoriteSet]
  );
  const compareSports = useMemo(
    () => sports.filter((item) => compareIds.includes(item.id)),
    [sports, compareIds]
  );

  return (
    <section className="favorites">
      <div className="section-heading">
        <p className="eyebrow">Kedvenceid</p>
        <h2>{favoriteSports.length > 0 ? "Mentett sporthelyek" : "Még nincs kedvenced"}</h2>
      </div>
      <div className="favorite-row">
        {favoriteSports.length > 0 ? (
          favoriteSports.map((item) => (
            <article key={item.id}>
              <h3>{item.name}</h3>
              <p>
                {item.sportType} - {item.location}
              </p>
              <div className="recommendation-actions">
                <button
                  type="button"
                  className="ghost"
                  onClick={() => onOpenInCatalog(item)}
                >
                  Megnyitás
                </button>
                <button type="button" className="cta" onClick={() => onToggleFavorite(item.id)}>
                  Eltávolítás
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-state">
            Jelölj meg néhány sporthelyet kedvencként a Kínálat oldalon.
          </p>
        )}
      </div>
      {compareSports.length > 0 && (
        <section className="compare-bar">
          <div>
            <p className="eyebrow">Összehasonlítás</p>
            <h3>Kiválasztott helyek: {compareSports.length}/3</h3>
          </div>
          <div className="compare-grid">
            {compareSports.map((item) => (
              <article key={item.id}>
                <h4>{item.name}</h4>
                <p>{item.priceLabel}</p>
                <p>{item.openingHours}</p>
              </article>
            ))}
          </div>
          <button type="button" className="ghost" onClick={() => onToggleCompare(null)}>
            Törlés
          </button>
        </section>
      )}
    </section>
  );
}
