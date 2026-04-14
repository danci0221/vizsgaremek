import { Link } from "react-router-dom";
import { footerLinksBase } from "../constants";

export default function Footer({ authUser, isAdmin, now, isHome = false }) {
  const footerLinks = isAdmin
    ? [...footerLinksBase, { to: "/admin", label: "Admin" }]
    : footerLinksBase;

  if (isHome) {
    return (
      <footer className="sh-footer">
        <div className="sh-footer-inner">
          <div className="sh-footer-col">
            <h5>Kiemelt Programok</h5>
            <Link to="/kinalat">Kínálat</Link>
            <Link to="/sportkviz">Sportkvíz</Link>
            <Link to="/kedvenceim">Kedvenceim</Link>
          </div>

          <div className="sh-footer-col">
            <h5>Oldaltérkép</h5>
            {footerLinks.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
            {authUser ? <Link to="/fiok">Profilom</Link> : <Link to="/auth?mode=signup">Regisztráció</Link>}
          </div>

          <div className="sh-footer-col">
            <h5>Jogi Információk</h5>
            <Link to="/">Adatkezelési tájékoztató</Link>
            <Link to="/">Felhasználási feltételek</Link>
            <Link to="/">Visszatérítési szabályzat</Link>
            <p className="sh-footer-note">SportHub {now.getFullYear()} - Minden jog fenntartva</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-brand">
          <Link to="/" className="logo footer-logo">
            <span className="logo-mark">SH</span>
            <span className="logo-text">SportHub</span>
          </Link>
          <p className="footer-note">
            Egy hely, ahol a kínálat, a térkép és a sportkvíz egységes sportélménnyé áll össze.
          </p>
          <div className="footer-badges">
            <span>Élő feed</span>
            <span>Élő szűrők</span>
            <span>Heti terv</span>
          </div>
        </div>

        <div className="footer-links">
          <p className="eyebrow">Navigáció</p>
          <div className="footer-link-grid">
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="footer-cta">
          {!authUser ? (
            <>
              <p className="eyebrow">Kezdés</p>
              <h3>Csatlakozz a SportHub közösségéhez</h3>
              <p>Regisztráció után mentés, tervezés és gyors jelentkezés egy fiókban.</p>
              <div className="footer-actions">
                <Link to="/auth?mode=signup" className="cta">
                  Csatlakozom
                </Link>
                <Link to="/tippek" className="ghost">
                  Tippek
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">Örülünk, hogy itt vagy</p>
              <h3>{authUser.username || "SportHub tag"}</h3>
              <p>Minden készen áll, hogy magabiztosan folytasd a heti sportritmusod.</p>
              <div className="footer-actions">
                <Link to="/fiok" className="cta">
                  Fiókom
                </Link>
                <Link to="/kinalat" className="ghost">
                  Kínálat
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="ghost">
                    Admin
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="footer-legal">
        <p>SportHub {now.getFullYear()} - Minden jog fenntartva.</p>
        <p>Kapcsolat: hello@sporthub.hu</p>
      </div>
    </footer>
  );
}
