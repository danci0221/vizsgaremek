export default function Hero({
  favoriteCount,
  resultCount,
  liveDayLabel,
  liveTimeLabel,
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
        ÉPÍTSD FEL A SAJÁT <span>SPORTKÖZPONTODAT</span>
      </h1>
      <p>
        Egyetlen felületen keresel, szűrsz, összehasonlítasz, tervezel és térképen navigálsz.
        Pontosan úgy, ahogy egy modern sportplatformtól várható.
      </p>

      <div className="hero-stats">
        <article>
          <p>Aktív találat</p>
          <h3>{resultCount}</h3>
        </article>
        <article>
          <p>Kedvenc elem</p>
          <h3>{favoriteCount}</h3>
        </article>
      </div>

    </section>
  );
}
