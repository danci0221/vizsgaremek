import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  momentumItems,
  featureHighlights,
  galleryCards,
  ctaHighlights,
  challengeCards,
} from "../constants";
import { toPercent } from "../lib/utils";

export default function HomePage({
  sports,
  favorites,
  onToggleFavorite,
  onApplyScenario,
}) {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const countByTime = { morning: 0, afternoon: 0, evening: 0, weekend: 0 };
    const countByLocation = {};
    const countByCategory = {};
    const priceBands = { free: 0, budget: 0, mid: 0, premium: 0 };
    let totalPrice = 0;
    let pricedCount = 0;

    sports.forEach((item) => {
      countByTime[item.timeSlot] = (countByTime[item.timeSlot] || 0) + 1;
      countByLocation[item.location] = (countByLocation[item.location] || 0) + 1;
      countByCategory[item.category] = (countByCategory[item.category] || 0) + 1;

      if (item.price <= 0) priceBands.free += 1;
      else if (item.price <= 5000) priceBands.budget += 1;
      else if (item.price <= 10000) priceBands.mid += 1;
      else priceBands.premium += 1;

      if (item.price > 0) {
        totalPrice += item.price;
        pricedCount += 1;
      }
    });

    return {
      total: sports.length,
      countByTime,
      countByLocation,
      countByCategory,
      priceBands,
      avgPrice: pricedCount ? Math.round(totalPrice / pricedCount) : 0,
    };
  }, [sports]);

  const uniqueLocations = useMemo(() => [...new Set(sports.map((item) => item.location))], [sports]);
  const uniqueCategories = useMemo(() => [...new Set(sports.map((item) => item.category))], [sports]);

  const insightCards = useMemo(
    () => [
      {
        label: "Aktív helyszín",
        value: stats.total,
        note: "friss adatbázisból",
      },
      {
        label: "Városok",
        value: uniqueLocations.length,
        note: "országos lefedettség",
      },
      {
        label: "Kategóriák",
        value: uniqueCategories.length,
        note: "stílus és cél szerint",
      },
      {
        label: "Ingyenes opció",
        value: stats.priceBands.free,
        note: "könnyű kezdés",
      },
    ],
    [stats.total, stats.priceBands.free, uniqueLocations.length, uniqueCategories.length]
  );

  const pulseCards = useMemo(() => {
    const total = stats.total || 1;

    return [
      {
        title: "Reggeli idősáv",
        value: toPercent(stats.countByTime.morning, total),
        note: `${stats.countByTime.morning || 0} opció`,
      },
      {
        title: "Esti csúcs",
        value: toPercent(stats.countByTime.evening, total),
        note: `${stats.countByTime.evening || 0} opció`,
      },
      {
        title: "Hétvégi flow",
        value: toPercent(stats.countByTime.weekend, total),
        note: `${stats.countByTime.weekend || 0} opció`,
      },
      {
        title: "Ingyenes blokkok",
        value: toPercent(stats.priceBands.free, total),
        note: `${stats.priceBands.free || 0} opció`,
      },
    ];
  }, [stats]);

  const cityStats = useMemo(() => {
    const cityMap = {};

    sports.forEach((item) => {
      if (!cityMap[item.location]) {
        cityMap[item.location] = { count: 0, typeCounts: {} };
      }
      cityMap[item.location].count += 1;
      cityMap[item.location].typeCounts[item.sportType] =
        (cityMap[item.location].typeCounts[item.sportType] || 0) + 1;
    });

    return Object.entries(cityMap)
      .map(([name, data]) => {
        const topType = Object.entries(data.typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        return {
          name,
          count: data.count,
          topType: topType || "Vegyes",
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [sports]);

  const categoryMix = useMemo(() => {
    const total = stats.total || 1;
    return Object.entries(stats.countByCategory)
      .map(([label, count]) => ({
        label,
        count,
        percent: toPercent(count, total),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [stats]);

  const timeSlotMix = useMemo(() => {
    const total = stats.total || 1;
    const items = [
      { label: "Reggel", key: "morning" },
      { label: "Délután", key: "afternoon" },
      { label: "Este", key: "evening" },
      { label: "Hétvége", key: "weekend" },
    ];

    return items.map((item) => {
      const count = stats.countByTime[item.key] || 0;
      return {
        label: item.label,
        count,
        percent: toPercent(count, total),
      };
    });
  }, [stats]);

  const priceMix = useMemo(() => {
    const total = stats.total || 1;
    const labels = {
      free: "Ingyenes",
      budget: "0-5000",
      mid: "5001-10000",
      premium: "10000+",
    };
    const order = ["free", "budget", "mid", "premium"];

    return order.map((key) => {
      const count = stats.priceBands[key] || 0;
      return {
        label: labels[key] || key,
        count,
        percent: toPercent(count, total),
      };
    });
  }, [stats]);

  const topRecommendations = useMemo(() => {
    return [...sports]
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);
  }, [sports]);

  const topCityName = cityStats[0]?.name || "Budapest";

  const scenarioCards = useMemo(
    () => [
      {
        title: "Reggeli rajt",
        text: "Indítsd a napot könnyebb, rövidebb blokkal.",
        tone: "orange",
        cta: "Reggeli opciók",
        filters: { timeSlot: "morning", price: "budget" },
      },
      {
        title: "Hétvégi közösség",
        text: "Nézd meg a szabad, közösségi programokat.",
        tone: "green",
        cta: "Hétvégi lista",
        filters: { timeSlot: "weekend", price: "free" },
      },
      {
        title: `${topCityName} fókusz`,
        text: "Gyors városi válogatás, hogy ott legyen minden egyben.",
        tone: "blue",
        cta: "Városi szűrés",
        filters: { location: topCityName },
      },
      {
        title: "Esti prémium",
        text: "Kiemelt, magasabb szintű opciók munka utánra.",
        tone: "dark",
        cta: "Esti ajánlatok",
        filters: { timeSlot: "evening", price: "premium" },
      },
    ],
    [topCityName]
  );

  const challengeStats = useMemo(() => {
    const avgLabel = stats.avgPrice
      ? `${stats.avgPrice.toLocaleString("hu-HU")} Ft`
      : "N/A";

    return [
      {
        label: "Átlag ár",
        value: avgLabel,
        note: "fizetős opciók",
      },
      {
        label: "Hétvégi opció",
        value: stats.countByTime.weekend || 0,
        note: "közösségi fókusz",
      },
      {
        label: "Ingyenes hely",
        value: stats.priceBands.free,
        note: "gyors kezdés",
      },
    ];
  }, [stats.avgPrice, stats.countByTime.weekend, stats.priceBands.free]);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const openInCatalog = (item) => {
    navigate("/kinalat", { state: { searchQuery: item.name } });
  };

  return (
    <>
      <section className="momentum-strip">
        <div className="momentum-track">
          {momentumItems.map((item, index) => (
            <span key={`momentum-${index}`}>
              {item.label} <b>{item.value}</b>
            </span>
          ))}
          {momentumItems.map((item, index) => (
            <span key={`momentum-dup-${index}`}>
              {item.label} <b>{item.value}</b>
            </span>
          ))}
        </div>
      </section>

      <section className="insights">
        {insightCards.map((item) => (
          <article key={item.label}>
            <p>{item.label}</p>
            <h3>{item.value}</h3>
            <p className="muted-mini">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="pulse surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Élő pulzus</p>
          <h2>Aktuális ritmus és idősávok egy pillantásban</h2>
        </div>
        <div className="pulse-grid">
          {pulseCards.map((item) => (
            <article key={item.title}>
              <p>{item.title}</p>
              <h3>{item.value}%</h3>
              <div className="meter">
                <span style={{ width: `${item.value}%` }} />
              </div>
              <p className="muted-mini">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="scenario-lab surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Gyors presetek</p>
          <h2>Indíts el egy szcenáriót, és máris készen áll a kínálat</h2>
        </div>
        <div className="scenario-grid">
          {scenarioCards.map((card) => (
            <article key={card.title} className={`scenario-card ${card.tone}`}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <button
                type="button"
                className="ghost"
                onClick={() => onApplyScenario(card.filters)}
              >
                {card.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="highlights surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Sport munkafolyamat</p>
          <h2>Értékes funkciók, amik naponta időt spórolnak</h2>
        </div>
        <div className="feature-grid">
          {featureHighlights.map((item) => (
            <article key={item.title}>
              <span className="feature-index">{item.index}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="recommendations surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Ajánlottak</p>
          <h2>Válogatott sporthelyek a jelenlegi adatok alapján</h2>
        </div>
        {topRecommendations.length > 0 ? (
          <div className="recommendation-grid">
            {topRecommendations.map((item) => (
              <article key={item.id}>
                <img src={item.image} alt={item.name} loading="lazy" />
                <div>
                  <p className="chip">{item.category}</p>
                  <h3>{item.name}</h3>
                  <p>
                    {item.sportType} - {item.location}
                  </p>
                  <p className="price">{item.priceLabel}</p>
                  <div className="recommendation-actions">
                    <button type="button" className="ghost" onClick={() => openInCatalog(item)}>
                      Megnyitás
                    </button>
                    <button
                      type="button"
                      className={favoriteSet.has(item.id) ? "cta" : "dark-btn"}
                      onClick={() => onToggleFavorite(item.id)}
                    >
                      {favoriteSet.has(item.id) ? "Kedvenc" : "Kedvencnek"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">Most nem elérhető ajánlott sporthely.</p>
        )}
      </section>

      <section className="challenge surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Heti kihívás</p>
          <h2>Mini blokkok, hogy könnyen tartsd a fókuszt</h2>
        </div>
        <div className="challenge-grid">
          {challengeCards.map((card) => (
            <article key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <button type="button" className="ghost" onClick={() => navigate(card.actionPath)}>
                {card.actionLabel}
              </button>
            </article>
          ))}
        </div>
        <div className="challenge-stats">
          {challengeStats.map((item) => (
            <article key={item.label}>
              <p>{item.label}</p>
              <h3>{item.value}</h3>
              <p className="muted-mini">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="city-lab surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Városi aktivitás</p>
          <h2>Hol a legerősebb most a sportpulzus</h2>
        </div>
        <div className="city-grid">
          {cityStats.length > 0 ? (
            cityStats.map((city) => (
              <article key={city.name}>
                <div className="city-head">
                  <h3>{city.name}</h3>
                  <span>{city.count} hely</span>
                </div>
                <p>Top sport: {city.topType}</p>
              </article>
            ))
          ) : (
            <p className="empty-state">Nincs megjeleníthető városi adat.</p>
          )}
        </div>
      </section>

      <section className="dna surface-panel">
        <div className="section-heading">
          <p className="eyebrow">Sport DNA</p>
          <h2>A kínálat összetétele kategóriák, idősávok és árak szerint</h2>
        </div>
        <div className="dna-grid">
          <article>
            <h3>Kategóriák aránya</h3>
            <div className="bar-list">
              {categoryMix.map((item) => (
                <div key={item.label} className="bar-item">
                  <div>
                    <p>{item.label}</p>
                    <span>{item.count} hely</span>
                  </div>
                  <div className="bar-track">
                    <span style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article>
            <h3>Idősáv megoszlás</h3>
            <div className="bar-list">
              {timeSlotMix.map((item) => (
                <div key={item.label} className="bar-item">
                  <div>
                    <p>{item.label}</p>
                    <span>{item.count} opció</span>
                  </div>
                  <div className="bar-track alt">
                    <span style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article>
            <h3>Ársávok</h3>
            <div className="bar-list">
              {priceMix.map((item) => (
                <div key={item.label} className="bar-item">
                  <div>
                    <p>{item.label}</p>
                    <span>{item.count} opció</span>
                  </div>
                  <div className="bar-track">
                    <span style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="gallery">
        <div className="section-heading">
          <p className="eyebrow">Sport hangulat</p>
          <h2>Friss inspirációs képek valós helyszínekkel</h2>
        </div>
        <div className="gallery-grid">
          {galleryCards.map((item) => (
            <article key={item.title} className="gallery-card">
              <img src={item.image} alt={item.title} loading="lazy" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.place}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-panel">
        <div>
          <p className="eyebrow">SportHub klub</p>
          <h2>Legyen egy hely, ahol minden sportod átlátható</h2>
          <p>
            Tervezd meg a hetedet, tartsd egyben a kedvenceket, és találj új helyeket gyorsabban.
          </p>
          <ul className="cta-list">
            {ctaHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="cta-actions">
          <Link to="/auth?mode=signup" className="cta">
            Fiók létrehozása
          </Link>
          <Link to="/kinalat" className="ghost">
            Kínálat megnyitása
          </Link>
        </div>
      </section>
    </>
  );
}
