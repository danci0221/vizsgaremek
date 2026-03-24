import { useState, useMemo } from "react";
import { timeSlotLabels, plannerDefaults } from "../constants";

export default function PlannerPage({ sports, uniqueTypes, uniqueLocations }) {
  const [planner, setPlanner] = useState(plannerDefaults);
  const [plannerSubmitted, setPlannerSubmitted] = useState(false);

  const plannerResults = useMemo(() => {
    return sports
      .filter((item) => {
        const matchesType = planner.type === "all" || item.sportType === planner.type;
        const matchesLocation =
          planner.location === "all" || item.location === planner.location;
        const matchesTime = planner.timeSlot === "all" || item.timeSlot === planner.timeSlot;
        const matchesBudget =
          planner.budget === "all" ||
          (planner.budget === "free" && item.price === 0) ||
          (planner.budget === "budget" && item.price > 0 && item.price <= 5000) ||
          (planner.budget === "premium" && item.price > 5000);

        return matchesType && matchesLocation && matchesTime && matchesBudget;
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);
  }, [sports, planner]);

  const openInCatalog = (item) => {
    // Ezt az App-ből adja majd át a navigate függvény
    const event = new CustomEvent("openInCatalog", { detail: item });
    window.dispatchEvent(event);
  };

  return (
    <section className="planner">
      <div className="section-heading">
        <p className="eyebrow">Programterv</p>
        <h2>Állíts össze heti sporttervet gyors presetekkel</h2>
      </div>
      <form
        className="planner-form"
        onSubmit={(e) => {
          e.preventDefault();
          setPlannerSubmitted(true);
        }}
      >
        <select
          value={planner.type}
          onChange={(e) => setPlanner((prev) => ({ ...prev, type: e.target.value }))}
        >
          <option value="all">Bármilyen sporttípus</option>
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={planner.location}
          onChange={(e) => setPlanner((prev) => ({ ...prev, location: e.target.value }))}
        >
          <option value="all">Bármelyik város</option>
          {uniqueLocations.map((locationValue) => (
            <option key={locationValue} value={locationValue}>
              {locationValue}
            </option>
          ))}
        </select>
        <select
          value={planner.timeSlot}
          onChange={(e) => setPlanner((prev) => ({ ...prev, timeSlot: e.target.value }))}
        >
          <option value="all">Bármelyik idősáv</option>
          {Object.entries(timeSlotLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={planner.budget}
          onChange={(e) => setPlanner((prev) => ({ ...prev, budget: e.target.value }))}
        >
          <option value="all">Bármilyen költség</option>
          <option value="free">Ingyenes</option>
          <option value="budget">Kedvező (0-5000)</option>
          <option value="premium">Prémium (5000+)</option>
        </select>
        <button type="submit" className="dark-btn">
          Terv generálása
        </button>
      </form>
      {plannerSubmitted && (
        <div className="planner-results">
          {plannerResults.length > 0 ? (
            plannerResults.map((item) => (
              <article key={item.id}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p>
                  <strong>Ár:</strong> {item.priceLabel}
                </p>
                <button type="button" className="ghost" onClick={() => openInCatalog(item)}>
                  Megnyitás a kínálat oldalon
                </button>
              </article>
            ))
          ) : (
            <p className="empty-state">Erre a kombinációra most nincs találat.</p>
          )}
        </div>
      )}
    </section>
  );
}
