import { useState } from "react";
import { tipsCards, prepTips, recoveryTips, nutritionTips, mentalTips, randomTips, motivationalQuotes, quizQuestions } from "../constants";

export default function TipsPage() {
  const [randomTip, setRandomTip] = useState(randomTips[0]);
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * randomTips.length);
    setRandomTip(randomTips[randomIndex]);
  };

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setCurrentQuote(motivationalQuotes[randomIndex]);
  };

  const handleQuizAnswer = (index) => {
    setSelectedAnswer(index);
    setQuizAnswered(true);
  };

  const nextQuiz = () => {
    setCurrentQuiz((prev) => (prev + 1) % quizQuestions.length);
    setQuizAnswered(false);
    setSelectedAnswer(null);
  };

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

      <section style={{textAlign: 'center', margin: '1rem 0'}}>
        <h2 style={{color: 'var(--brand)', fontFamily: 'Space Grotesk', marginBottom: '0.5rem'}}>🎯 Interaktív eszközök</h2>
        <p style={{color: 'var(--ink-soft)'}}>Fedezd fel játékosan a sporttitkokat!</p>
      </section>

      <section className="tips-random">
        <h3>🎲 Véletlen tipp generátor</h3>
        <p>{randomTip}</p>
        <button onClick={getRandomTip}>Új tipp!</button>
      </section>

      <section className="tips-quote">
        <p>{currentQuote}</p>
        <button onClick={getRandomQuote} style={{marginTop: '0.5rem', fontSize: '0.8rem'}}>Új idézet</button>
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

      <section className="tips-columns">
        <article>
          <h3>Táplálkozási tippek</h3>
          <ul>
            {nutritionTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3>Mentális wellness</h3>
          <ul>
            {mentalTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="tips-quiz">
        <h3>🧠 Teszteld tudásod!</h3>
        <p><strong>{quizQuestions[currentQuiz].question}</strong></p>
        {quizQuestions[currentQuiz].options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleQuizAnswer(index)}
            className={
              quizAnswered
                ? index === quizQuestions[currentQuiz].correct
                  ? "correct"
                  : index === selectedAnswer
                  ? "incorrect"
                  : ""
                : ""
            }
            disabled={quizAnswered}
          >
            {option}
          </button>
        ))}
        {quizAnswered && (
          <p style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>
            {selectedAnswer === quizQuestions[currentQuiz].correct
              ? "✅ Helyes válasz!"
              : `❌ Helyes válasz: ${quizQuestions[currentQuiz].options[quizQuestions[currentQuiz].correct]}`}
          </p>
        )}
        <button onClick={nextQuiz} style={{marginTop: '0.5rem'}}>Következő kérdés</button>
      </section>
    </>
  );
}
