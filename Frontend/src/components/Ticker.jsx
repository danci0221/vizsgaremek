import "../styles/Ticker.css";

export default function Ticker({ items = [] }) {
  // Default items if not provided
  const defaultItems = [
    "Futás • Futópályák mindenfelé",
    "Úszás • Teljes testes edzés",
    "Jóga • Rugalmasság és kreativitás",
    "Konditerem • Erőnövelés",
    "Tenisz • Közösségi sport",
  ];

  const tickerItems = items.length > 0 ? items : defaultItems;

  // Double the items for seamless loop
  const displayItems = [...tickerItems, ...tickerItems];

  return (
    <section className="ticker-wrapper">
      <div className="ticker-container">
        <div className="ticker-track">
          {displayItems.map((item, index) => (
            <div key={index} className="ticker-item">
              <span className="ticker-text">{item}</span>
              <span className="ticker-separator">•</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
