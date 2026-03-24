import { tipsCards, prepTips, recoveryTips } from "../constants";

export default function TipsPage() {
  return (
    <>
      <section className="tips-hero">
        <div>
          <p className="eyebrow">Tippek és tanácsok</p>
          <h2>Edzz okosan: stabil forma, jobb fejlődés, kevesebb sérülés</h2>
          <p>A fókusz legyen a konzisztencián, fokozatosságon és regeneráción.</p>
          <div className="tips-pill-row">
            <span>Fókusz: rutin</span>
            <span>Fókusz: hidratálás</span>
            <span>Fókusz: pihenés</span>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1549570652-97324981a6fd?auto=format&fit=crop&w=1400&q=80"
          alt="Sporttippek"
          loading="lazy"
        />
      </section>

      <section className="tips-section">
        <div className="tips-grid">
          {tipsCards.map((tip) => (
            <article key={tip.title} className="tips-card">
              <img src={tip.image} alt={tip.title} loading="lazy" />
              <div>
                <h3>{tip.title}</h3>
                <p>{tip.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="tips-columns">
        <article>
          <h3>Edzés előtti checklist</h3>
          <ul>
            {prepTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>Regenerációs checklist</h3>
          <ul>
            {recoveryTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
