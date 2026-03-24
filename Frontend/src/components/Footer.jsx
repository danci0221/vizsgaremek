import { Link } from "react-router-dom";
import { footerLinksBase } from "../constants";

export default function Footer({ authUser, isAdmin, now, onSignOut }) {
  const footerLinks = isAdmin
    ? [...footerLinksBase, { to: "/admin", label: "Admin" }]
    : footerLinksBase;

  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-brand">
          <Link to="/" className="logo footer-logo">
            <span className="logo-mark">SH</span>
            <span className="logo-text">SportHub</span>
          </Link>
          <p className="footer-note">
            Tervezd meg a hetedet, tartsd egyben a kedvenceket, és mozogj tudatosan.
          </p>
          <div className="footer-badges">
            <span>Sport radar</span>
            <span>Élő szűrők</span>
            <span>Programterv</span>
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
              <h3>Építs új ritmust a SportHubbal</h3>
              <p>Reális tervek, közeli helyszínek és gyors választás egy felületen.</p>
              <div className="footer-actions">
                <Link to="/auth?mode=signup" className="cta">
                  Fiók létrehozása
                </Link>
                <Link to="/tippek" className="ghost">
                  Tippek
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">Üdv újra</p>
              <h3>{authUser.username || "SportHub tag"}</h3>
              <p>Pár gyors lépés, és már indulhat is a heti ritmusod.</p>
              <div className="footer-actions">
                <Link to="/kinalat" className="cta">
                  Kínálat megnyitása
                </Link>
                <Link to="/kedvencek" className="ghost">
                  Kedvencek
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="ghost">
                    Admin felület
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
