import { emptyForm } from "../constants";

function formatRegistrationStatus(status) {
  return status === "lemondva" ? "Lemondva" : "Aktív";
}

function formatRegistrationDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage({
  authUser,
  isAdmin,
  status,
  form,
  editingId,
  sports,
  adminUsers,
  adminUsersState,
  adminUsersBusy,
  adminRegistrations = [],
  adminRegistrationsState = { type: "idle", message: "" },
  adminRegistrationsBusy = false,
  onFormChange,
  onSubmit,
  onEdit,
  onDelete,
  onResetForm,
  onLoadAdminUsers,
  onLoadAdminRegistrations,
}) {
  return (
    <section className="admin" id="admin">
      <div className="section-heading">
        <p className="eyebrow">Admin felület</p>
        <h2>Sporthelyek és események kezelése</h2>
        {status.type !== "idle" && <p className={`status ${status.type}`}>{status.message}</p>}
      </div>
      {!authUser && (
        <p className="status warning">
          Felhasználók listájához jelentkezz be egy admin szerepkörű fiókkal.
        </p>
      )}
      {authUser && !isAdmin && (
        <p className="status warning">
          Jelenleg {authUser.role} szerepkörrel vagy bejelentkezve, így a felhasználólista nem
          érhető el.
        </p>
      )}
      {isAdmin && (
        <section className="admin-users">
          <div className="admin-users-head">
            <div>
              <p className="eyebrow">Felhasználók</p>
              <h3>Regisztrált fiókok</h3>
            </div>
            <button
              type="button"
              className="ghost"
              disabled={adminUsersBusy}
              onClick={onLoadAdminUsers}
            >
              {adminUsersBusy ? "Frissítés..." : "Frissítés"}
            </button>
          </div>
          {adminUsersState.type !== "idle" && (
            <p className={`status ${adminUsersState.type}`}>{adminUsersState.message}</p>
          )}
          <div className="admin-user-grid">
            {adminUsers.length > 0 ? (
              adminUsers.map((user) => (
                <article key={user.id}>
                  <h4>{user.username}</h4>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Szerepkör:</strong> {user.role}
                  </p>
                  <p>
                    <strong>Regisztráció:</strong> {user.registeredAt}
                  </p>
                  <p>
                    <strong>Bejelentkezések:</strong> {user.loginCount}
                  </p>
                  <p>
                    <strong>Utolsó sikeres belépés:</strong>{" "}
                    {user.lastSuccessfulLoginAt || "-"}
                  </p>
                </article>
              ))
            ) : (
              <p className="admin-users-empty">
                {adminUsersBusy
                  ? "Felhasználók betöltése..."
                  : "Nincs megjeleníthető felhasználói adat."}
              </p>
            )}
          </div>
        </section>
      )}
      {isAdmin && (
        <section className="admin-registrations">
          <div className="admin-users-head">
            <div>
              <p className="eyebrow">Jelentkezések</p>
              <h3>Sportesemény regisztrációk</h3>
            </div>
            <button
              type="button"
              className="ghost"
              disabled={adminRegistrationsBusy}
              onClick={onLoadAdminRegistrations}
            >
              {adminRegistrationsBusy ? "Frissítés..." : "Frissítés"}
            </button>
          </div>
          {adminRegistrationsState.type !== "idle" && (
            <p className={`status ${adminRegistrationsState.type}`}>
              {adminRegistrationsState.message}
            </p>
          )}
          <div className="registration-grid">
            {adminRegistrations.length > 0 ? (
              adminRegistrations.map((registration) => (
                <article key={registration.id} className="registration-card">
                  <div className="registration-head">
                    <h4>{registration.sportName}</h4>
                    <span
                      className={`registration-status ${
                        registration.status === "lemondva" ? "cancelled" : "active"
                      }`}
                    >
                      {formatRegistrationStatus(registration.status)}
                    </span>
                  </div>
                  <p className="card-meta">
                    {registration.username} - {registration.email}
                  </p>
                  <p className="card-meta">
                    {registration.sportType} - {registration.location}
                  </p>
                  <p className="card-meta muted">{registration.address}</p>
                  <p className="card-meta">
                    Jelentkezés: {formatRegistrationDate(registration.registeredAt)}
                  </p>
                  <p className="card-meta">Ár: {registration.priceLabel}</p>
                </article>
              ))
            ) : (
              <p className="admin-users-empty">
                {adminRegistrationsBusy
                  ? "Jelentkezések betöltése..."
                  : "Nincs megjeleníthető jelentkezés."}
              </p>
            )}
          </div>
        </section>
      )}
      {isAdmin && (
        <>
          <form className="admin-form" onSubmit={onSubmit}>
            <input
              required
              placeholder="Megnevezés"
              value={form.name}
              onChange={(e) => onFormChange((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              required
              placeholder="Sporttípus"
              value={form.sportType}
              onChange={(e) => onFormChange((prev) => ({ ...prev, sportType: e.target.value }))}
            />
            <input
              required
              placeholder="Kategória"
              value={form.category}
              onChange={(e) => onFormChange((prev) => ({ ...prev, category: e.target.value }))}
            />
            <input
              required
              placeholder="Helyszín (város)"
              value={form.location}
              onChange={(e) => onFormChange((prev) => ({ ...prev, location: e.target.value }))}
            />
            <input
              required
              placeholder="Cím"
              value={form.address}
              onChange={(e) => onFormChange((prev) => ({ ...prev, address: e.target.value }))}
            />
            <input
              required
              type="number"
              placeholder="Ár (Ft)"
              value={form.price}
              onChange={(e) => onFormChange((prev) => ({ ...prev, price: e.target.value }))}
            />
            <select
              value={form.timeSlot}
              onChange={(e) => onFormChange((prev) => ({ ...prev, timeSlot: e.target.value }))}
            >
              <option value="morning">Reggel</option>
              <option value="afternoon">Délután</option>
              <option value="evening">Este</option>
              <option value="weekend">Hétvége</option>
            </select>
            <input
              required
              placeholder="Nyitvatartás"
              value={form.openingHours}
              onChange={(e) => onFormChange((prev) => ({ ...prev, openingHours: e.target.value }))}
            />
            <input
              required
              placeholder="Kapcsolat"
              value={form.contact}
              onChange={(e) => onFormChange((prev) => ({ ...prev, contact: e.target.value }))}
            />
            <input
              required
              placeholder="Kép URL"
              value={form.image}
              onChange={(e) => onFormChange((prev) => ({ ...prev, image: e.target.value }))}
            />
            <textarea
              required
              placeholder="Leírás"
              rows="3"
              value={form.description}
              onChange={(e) => onFormChange((prev) => ({ ...prev, description: e.target.value }))}
            />
            <div className="admin-actions">
              <button type="submit" className="cta">
                {editingId ? "Módosítás mentése" : "Új sporthely hozzáadása"}
              </button>
              {editingId && (
                <button type="button" className="ghost" onClick={onResetForm}>
                  Mégse
                </button>
              )}
            </div>
          </form>
          <div className="admin-list">
            {sports.slice(0, 8).map((item) => (
              <article key={item.id}>
                <div>
                  <h4>{item.name}</h4>
                  <p>
                    {item.sportType} - {item.location}
                  </p>
                </div>
                <div className="admin-item-actions">
                  <button type="button" className="ghost" onClick={() => onEdit(item)}>
                    Szerkesztés
                  </button>
                  <button type="button" className="danger" onClick={() => onDelete(item.id)}>
                    Törlés
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
