import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Header({ authUser, onSignOut }) {
  const isAdmin = authUser?.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navItems = [
    { to: "/", label: "Főoldal" },
    { to: "/kinalat", label: "Kínálat" },
    { to: "/tippek", label: "Tippek" },
    { to: "/programterv", label: "Programterv" },
    { to: "/terkep", label: "Térkép" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const avatarLetter = String(authUser?.username || authUser?.email || "F")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <header className="header header--hub">
      <div className="header-left">
        <Link to="/" className="logo">
          <span className="logo-mark">SH</span>
          <span className="logo-text">SportHub</span>
        </Link>
        <span className="live-pill">Elit sporthálózat</span>
      </div>

      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="header-cta-group">
        {authUser ? (
          <div className="user-menu" ref={menuRef}>
            <button
              type="button"
              className="user-trigger"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="user-avatar">{avatarLetter}</span>
              <span className="user-name">{authUser.username || "Fiókom"}</span>
              <span className={`user-caret ${menuOpen ? "open" : ""}`}>v</span>
            </button>
            {menuOpen && (
              <div className="user-dropdown">
                <NavLink to="/fiok" className="user-item" onClick={() => setMenuOpen(false)}>
                  Fiókom
                </NavLink>
                <NavLink to="/kedvencek" className="user-item" onClick={() => setMenuOpen(false)}>
                  Kedvencek
                </NavLink>
                <NavLink to="/programterv" className="user-item" onClick={() => setMenuOpen(false)}>
                  Programterv
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className="user-item" onClick={() => setMenuOpen(false)}>
                    Admin
                  </NavLink>
                )}
                <button
                  type="button"
                  className="user-item danger"
                  onClick={() => {
                    setMenuOpen(false);
                    onSignOut?.();
                  }}
                >
                  Kijelentkezés
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink to="/auth?mode=signup" className="ghost">
              Regisztráció
            </NavLink>
            <NavLink to="/auth?mode=signin" className="cta">
              Bejelentkezés
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}

