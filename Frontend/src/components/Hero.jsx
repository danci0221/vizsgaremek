import { Link } from "react-router-dom";

export default function Hero({
  query,
  onSearch,
  favoriteCount,
  resultCount,
  liveDayLabel,
  liveTimeLabel,
  uniqueTypes,
  onQuickTypeSelect,
}) {
  return (
    <section className="hero" id="discover">
      <div className="hero-topline">
        <p className="eyebrow">Sportplatform 2.0</p>
        <p className="live-clock">
          <span className="dot" />
          {liveDayLabel} - {liveTimeLabel}
        </p>
      </div>

      <h1>
        Építsd fel a saját <span>sportközpontodat</span>
      </h1>
      <p>
        Egyetlen felületen keresel, szűrsz, összehasonlítasz, tervezel és térképen navigálsz.
        Pontosan úgy, ahogy egy modern sportplatformtól várható.
      </p>

      <div className="search">
        <input
          placeholder="Keresés sporttípus, helyszín vagy név alapján"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
        />
        <div className="hero-actions">
          <Link to="/kinalat" className="dark-btn">
            Felfedezés
          </Link>
          <Link to="/programterv" className="ghost">
            Programterv
          </Link>
        </div>
      </div>

      <div className="hero-stats">
        <article>
          <p>Aktív találat</p>
          <h3>{resultCount}</h3>
        </article>
        <article>
          <p>Kedvenc elem</p>
          <h3>{favoriteCount}</h3>
        </article>
        <article>
          <p>Fókusz mód</p>
          <h3>PRO</h3>
        </article>
      </div>

      <div className="hero-chip-row">
        <button type="button" className="chip-btn" onClick={() => onQuickTypeSelect("all")}>
          Minden sport
        </button>
        {uniqueTypes.slice(0, 6).map((type) => (
          <button key={type} type="button" className="chip-btn" onClick={() => onQuickTypeSelect(type)}>
            {type}
          </button>
        ))}
      </div>
    </section>
  );
}
