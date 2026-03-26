import { Link } from "react-router-dom";

function formatRole(role) {
  return role === "admin" ? "Admin" : "Felhasználó";
}

function formatRegisteredAt(value) {
  if (!value) return "Nincs adat";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Nincs adat";

  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage({ authUser, favoriteCount, isAdmin, onSignOut }) {
  return (
    <section className="profile-page">
      <div className="section-heading">
        <p className="eyebrow">Profil</p>
        <h2>Fiókod és személyes gyorselérések</h2>
        <p className="auth-sub">
          Itt éred el a mentett kedvenceidet, a heti terveidet és a fiókadataidat.
        </p>
      </div>

      <div className="profile-shell">
        <article className="profile-panel profile-summary">
          <div className="profile-identity">
            <span className="profile-avatar">
              {String(authUser?.username || authUser?.email || "F").trim().charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="eyebrow">Belépett fiók</p>
              <h3>{authUser?.username || "SportHub felhasználó"}</h3>
              <p>{authUser?.email || "Nincs megadva email"}</p>
            </div>
          </div>

          <div className="profile-facts">
            <article>
              <span>Szerepkör</span>
              <strong>{formatRole(authUser?.role)}</strong>
            </article>
            <article>
              <span>Mentett kedvencek</span>
              <strong>{favoriteCount}</strong>
            </article>
            <article>
              <span>Regisztráció</span>
              <strong>{formatRegisteredAt(authUser?.registeredAt)}</strong>
            </article>
          </div>

          <div className="profile-actions">
            <Link to="/kedvencek" className="cta">
              Kedvenceim megnyitása
            </Link>
            <Link to="/programterv" className="ghost">
              Programterv
            </Link>
            <button type="button" className="ghost danger-outline" onClick={onSignOut}>
              Kijelentkezés
            </button>
          </div>
        </article>

        <div className="profile-grid">
          <article className="profile-panel profile-card">
            <p className="eyebrow">Gyors indulás</p>
            <h3>Kínálat és szűrés</h3>
            <p>
              Nyisd meg a teljes sportkínálatot, és mentsd el azokat a helyeket, amiket később
              visszanéznél.
            </p>
            <Link to="/kinalat" className="ghost">
              Kínálat megnyitása
            </Link>
          </article>

          <article className="profile-panel profile-card">
            <p className="eyebrow">Mentések</p>
            <h3>Kedvencek egy helyen</h3>
            <p>
              A mentett sporthelyeidet innen éred el. Jelenleg {favoriteCount} elem van a saját
              listádban.
            </p>
            <Link to="/kedvencek" className="ghost">
              Kedvencek oldal
            </Link>
          </article>

          <article className="profile-panel profile-card">
            <p className="eyebrow">Heti ritmus</p>
            <h3>Programterv</h3>
            <p>
              Rakd össze a heti sportmenetrendedet külön városra, időpontra vagy sporttípusra.
            </p>
            <Link to="/programterv" className="ghost">
              Programterv megnyitása
            </Link>
          </article>

          {isAdmin && (
            <article className="profile-panel profile-card admin-card">
              <p className="eyebrow">Admin</p>
              <h3>Rendszerkezelés</h3>
              <p>Felhasználók, sporthelyek és adatbázis tartalmak kezelése egy helyről.</p>
              <Link to="/admin" className="ghost">
                Admin felület
              </Link>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
