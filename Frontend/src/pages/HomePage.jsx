import { useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Ticker from "../components/Ticker";

const fallbackSliderItems = [
  {
    key: "fallback-1",
    title: "Városi Futás Protokoll",
    subtitle: "Tempó és állóképesség",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1400&q=80",
    filters: { type: "Futas", timeSlot: "morning" },
    query: "futás",
  },
  {
    key: "fallback-2",
    title: "Tenisz Precízió",
    subtitle: "Technika és ritmus",
    image:
      "https://images.unsplash.com/photo-1595435742656-5272d0b3fa8b?auto=format&fit=crop&w=1400&q=80",
    filters: { type: "Tenisz" },
    query: "tenisz",
  },
  {
    key: "fallback-3",
    title: "Funkcionális Erőedzés",
    subtitle: "Erő és mobilitás",
    image:
      "https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=1400&q=80",
    filters: { category: "Ero" },
    query: "",
  },
  {
    key: "fallback-4",
    title: "Úszás Állóképesség",
    subtitle: "Teljes testes terhelés",
    image:
      "https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&w=1400&q=80",
    filters: { type: "Uszas" },
    query: "úszás",
  },
  {
    key: "fallback-5",
    title: "Hétvégi Liga Blokk",
    subtitle: "Közösség és forma",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80",
    filters: { timeSlot: "weekend" },
    query: "",
  },
];

export default function HomePage({ sports = [], onApplyScenario, authUser }) {
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const stats = useMemo(() => {
    const free = sports.filter((item) => Number(item.price) <= 0).length;
    const locations = new Set(sports.map((item) => item.location).filter(Boolean));

    return {
      total: sports.length,
      free,
      cityCount: locations.size,
      paid: Math.max(0, sports.length - free),
    };
  }, [sports]);

  const heroVariants = [
    {
      titleStart: "Építsd fel",
      titleEnd: "A Saját Ritmusod",
      cta: "Elkezdem a terveim",
      copy:
        "A SportHub nem csak egy lista, hanem a saját sportközpontod. Itt tudatosan, lépésről lépésre építed fel a hetedet.",
    },
    {
      titleStart: "Érd el",
      titleEnd: "A Legjobb Formád",
      cta: "Edzek tudatosan",
      copy:
        "Fedezz fel valós sporthelyeket, tervezz gyorsan, és válassz adatok alapján. Nyugodt fókusz, határozott fejlődés.",
    },
    {
      titleStart: "Lépj szintet",
      titleEnd: "Minden Héten",
      cta: "Belépek a központba",
      copy:
        "Keresés, térkép, sportkvíz és jelentkezés egy folyamatban. Minden adott, hogy következetesen haladj előre.",
    },
  ];

  const heroVariant = heroVariants[(stats.total || 1) % heroVariants.length];

  const heroIntel = useMemo(() => {
    const typeCounts = {};
    const cityCounts = {};
    let weekendCount = 0;

    sports.forEach((item) => {
      const typeKey = item.sportType || item.category || "Sport";
      const cityKey = item.location || "Saját városod";

      typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;
      cityCounts[cityKey] = (cityCounts[cityKey] || 0) + 1;
      if (item.timeSlot === "weekend") weekendCount += 1;
    });

    const getTopLabel = (map, fallback) =>
      Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || fallback;

    return {
      topType: getTopLabel(typeCounts, "Fókuszált sportblokk"),
      topCity: getTopLabel(cityCounts, "A te környéked"),
      weekendCount,
    };
  }, [sports]);

  const heroQuickFilters = [
    { label: "Ingyenes opciók", filters: { price: "free" }, query: "" },
    { label: "Hétvégi ajánlatok", filters: { timeSlot: "weekend" }, query: "" },
    { label: "Reggeli fókusz", filters: { timeSlot: "morning" }, query: "" },
  ];

  const sliderItems = useMemo(() => {
    if (!sports.length) return fallbackSliderItems;

    const picked = sports
      .filter((item) => item.name && item.image)
      .slice(0, 5)
      .map((item, index) => ({
        key: `${item.id || index}-${item.name}`,
        title: item.name,
        subtitle: `${item.location || "Városi helyszín"} - ${item.category || "Sport"}`,
        image: item.image,
        filters: {
          type: item.sportType || "all",
          location: item.location || "all",
        },
        query: item.name,
      }));

    return picked.length ? picked : fallbackSliderItems;
  }, [sports]);

  const launchScenario = (scenario) => {
    if (onApplyScenario) {
      onApplyScenario({
        query: scenario.query || "",
        filters: scenario.filters || {},
      });
      return;
    }
    navigate("/kinalat");
  };

  const moveSlider = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const distance = Math.round(slider.clientWidth * 0.82);
    slider.scrollBy({
      left: direction * distance,
      behavior: "smooth",
    });
  };

  const elitePrograms = [
    {
      key: "league-room",
      label: "KÖZÖSSÉGI ZÓNA",
      title: "A valódi fejlődés közösségben még gyorsabb.",
      text:
        "Itt nincs üres böngészés. Aktív, célorientált sportolók között építed fel a rutinod, stabilan és magabiztosan.",
      image:
        "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=80",
      button: "Megnyitom a közösséget",
      action: () => navigate("/kedvencek"),
    },
    {
      key: "performance-lab",
      label: "TELJESÍTMÉNY MŰHELY",
      title: "A tudatos terv hozza a tartós eredményt.",
      text:
        "A SportHub megmutatja, hogyan építs heti rendszert idősáv, helyszín és költségkeret alapján. Kevesebb káosz, több előrelépés.",
      image:
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80",
      button: "Sportkvízt játszom",
      action: () => navigate("/sportkviz"),
      footer: `Már ${stats.total}+ aktív sportopció érhető el`,
    },
    {
      key: "sporthub-mission",
      label: "SPORTHUB KÜLDETÉS",
      title: "Mutassuk meg, mennyi minden lehetséges sportban.",
      text:
        "Valós helyszínek, tiszta döntések és egy rendszer, ami a gyakorlatban is működik. Kedves irány, határozott tempó.",
      image:
        "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1600&q=80",
      button: "Elolvasom a tippeket",
      action: () => navigate("/tippek"),
    },
  ];

  const credentialCards = [
    {
      key: "credential-1",
      title: "Napi kulisszatitkok",
      text: "Milyen sportfolyamat működik valóban nap mint nap?",
      image:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=80",
      action: () => navigate("/kinalat"),
    },
    {
      key: "credential-2",
      title: "Heti gyorsbriefing",
      text: "Podcast, rövid tippek és azonnal alkalmazható útmutatók egy helyen.",
      image:
        "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1400&q=80",
      action: () => navigate("/tippek"),
    },
  ];

  return (
    <div className="sh-home" data-testid="home-page">
      <section className="sh-hero-splash">
        <div className="sh-hero-video-layer" aria-hidden="true">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="https://images.unsplash.com/photo-1571019613540-996a9b4f7d44?auto=format&fit=crop&w=1400&q=80"
          >
            <source
              src="https://cdn.coverr.co/videos/coverr-people-training-in-a-gym-1560/1080p.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        <div className="sh-hero-overlay" />

        <div className="sh-shell">
          <div className="sh-hero-grid">
            <div className="sh-hero-content">
              <p className="sh-hero-eyebrow">SportHub Vezérlőközpont</p>
              <h1>
                <span className="extra">{heroVariant.titleStart}</span> {""}
                <span className="extra">{heroVariant.titleEnd}</span>
              </h1>
              <p className="sh-hero-copy">
                <span className="extra">Ez a SportHub.</span> {heroVariant.copy}
              </p>

              <div className="sh-hero-actions">
                <button
                  type="button"
                  className="sh-button-primary"
                  data-testid="home-primary-cta"
                  onClick={() => navigate("/kinalat")}
                >
                  {heroVariant.cta}
                </button>
                <button
                  type="button"
                  className="sh-button-secondary sh-hero-secondary"
                  data-testid="home-map-cta"
                  onClick={() => navigate("/terkep")}
                >
                  Megnézem a térképet
                </button>
              </div>

              <div className="sh-hero-metrics">
                <span>{stats.total} aktív opció</span>
                <span>{stats.cityCount} város</span>
                <span>{stats.free} ingyenes hely</span>
              </div>
            </div>

            <aside className="sh-hero-panel" aria-label="Gyors vezérlőpult">
              <article className="sh-hero-panel-card sh-hero-panel-main">
                <p>Mai fókuszterület</p>
                <h3>{heroIntel.topType}</h3>
                <span>{heroIntel.topCity} térségében most különösen erős a kínálat.</span>
              </article>

              <div className="sh-hero-panel-grid">
                <article className="sh-hero-panel-card sh-hero-panel-mini">
                  <p>Prémium helyek</p>
                  <strong>{stats.paid}</strong>
                </article>
                <article className="sh-hero-panel-card sh-hero-panel-mini">
                  <p>Hétvégi blokkok</p>
                  <strong>{heroIntel.weekendCount}</strong>
                </article>
              </div>

              <div className="sh-hero-pill-row">
                {heroQuickFilters.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="sh-hero-pill"
                    onClick={() => launchScenario(item)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Ticker
        items={[
          "🏃 Futás • Energikus napi mozgás",
          "🏊 Úszás • Teljes testes edzés",
          "🧘 Jóga • Rugalmasság és kreativitás",
          "🏋️ Konditerem • Erőnövelés és forma",
          "🎾 Tenisz • Közösségi sport",
        ]}
      />

      <section className="sh-section sh-wisdom">
        <div className="sh-shell">
          <div className="sh-title-wrap">
            <p className="sh-slide-title">EDDZ OKOSAN - TERVEZZ TUDATOSAN - HALADJ FOLYAMATOSAN</p>
            <h2>
              SportHub <span>Kiemelések</span>
            </h2>
          </div>

          <div className="sh-slider-block">
            <button
              type="button"
              className="sh-slider-nav"
              aria-label="Előző"
              onClick={() => moveSlider(-1)}
            >
              {"<"}
            </button>
            <div className="sh-slider-track" ref={sliderRef}>
              {sliderItems.concat(sliderItems).map((item, index) => (
                <article key={`${item.key}-${index}`} className="sh-slider-item">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <div className="sh-slider-overlay" />
                  <div className="sh-slider-content">
                    <p>{item.subtitle}</p>
                    <h3>{item.title}</h3>
                    <button type="button" className="sh-chip" onClick={() => launchScenario(item)}>
                      Megnézem
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <button
              type="button"
              className="sh-slider-nav"
              aria-label="Következő"
              onClick={() => moveSlider(1)}
            >
              {">"}
            </button>
          </div>
        </div>
      </section>

      {elitePrograms.map((program) => (
        <section key={program.key} className="sh-section sh-program">
          <div className="sh-shell sh-program-grid">
            <div className="sh-program-image">
              <img src={program.image} alt={program.label} loading="lazy" />
            </div>
            <div className="sh-program-copy">
              <p className="sh-kicker">{program.label}</p>
              <h2>{program.title}</h2>
              <p>{program.text}</p>
              <button type="button" className="sh-button-primary" onClick={program.action}>
                {program.button}
              </button>
              {program.footer ? <div className="sh-program-footer">{program.footer}</div> : null}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
