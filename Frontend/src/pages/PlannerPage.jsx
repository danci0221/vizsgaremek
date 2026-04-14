import { useState } from "react";
import { sportQuizQuestions } from "../constants";
import { apiUrl } from "../lib/api";

export default function PlannerPage({ sports, onOpenInCatalog }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalQuestions = sportQuizQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    
    // Auto-advance to next question
    if (currentQuestion < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Kvíz válaszok küldése:", answers);
      const response = await fetch(apiUrl("sports/quiz-recommendations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      console.log("Válasz státusz:", response.status);
      if (!response.ok) throw new Error("Hiba történt az ajánlások generálásakor");
      
      const data = await response.json();
      console.log("Ajánlások fogadva:", data);
      setResults(data.recommendations || []);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openInCatalog = (item) => {
    if (typeof onOpenInCatalog === "function") {
      onOpenInCatalog(item);
      return;
    }

    const event = new CustomEvent("openInCatalog", { detail: item });
    window.dispatchEvent(event);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResults(null);
    setError(null);
  };

  // Results screen
  if (results !== null) {
    return (
      <section className="quiz-container" data-testid="quiz-results">
        <div className="quiz-results">
          <div className="results-header">
            <h2>Az Én Sportok</h2>
            <p>Ezek a legjobban illő sportok a válaszaid alapján</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {results.length > 0 ? (
            <>
              <div className="recommendations-grid">
                {results.map((item) => (
                  <article key={item.id} className="rec-card" data-testid="rec-card">
                    <div className="rec-image">
                      <img src={item.image} alt={item.name} />
                      <div className="match-badge">{Math.round(item.matchScore || 85)}% match</div>
                    </div>
                    <div className="rec-content">
                      <h3>{item.name}</h3>
                      <p className="type-label">{item.sportType}</p>
                      <p className="description">{item.description}</p>
                      <div className="rec-meta">
                        <span className="location">{item.location}</span>
                        <span className="price">{item.priceLabel}</span>
                      </div>
                      <button
                        type="button"
                        className="rec-button"
                        onClick={() => openInCatalog(item)}
                      >
                        Megnézem a kínálatban
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <button className="restart-button" onClick={resetQuiz}>
                Újabb kvíz
              </button>
            </>
          ) : (
            <>
              <p className="empty-results">Sajnos nincs ajánlásunk. Próbáld meg más választásokkal!</p>
              <button className="restart-button" onClick={resetQuiz}>
                Újra próbálkozom
              </button>
            </>
          )}
        </div>
      </section>
    );
  }

  // Quiz screen
  const currentQ = sportQuizQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const canSubmit = isLastQuestion && Object.keys(answers).length === totalQuestions;

  return (
    <section className="quiz-container" data-testid="quiz-page">
      <div className="quiz-wrapper">
        <div className="quiz-header">
          <h2>Melyik Sport Passzol Hozzád?</h2>
          <p>Néhány gyors kérdésre válaszolva megtudod, mely sportok illeszkednek a legjobban az igényeidhez!</p>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          <span className="progress-text">
            {currentQuestion + 1} / {totalQuestions}
          </span>
        </div>

        <div className="quiz-question">
          <h3>{currentQ.question}</h3>
          
          <div className="quiz-options">
            {currentQ.options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`option-button ${answers[currentQ.id] === option.value ? "active" : ""}`}
                onClick={() => handleAnswer(currentQ.id, option.value)}
                data-testid={`option-${option.value}`}
              >
                <span className="option-radio">
                  {answers[currentQ.id] === option.value && (
                    <span className="radio-check">✓</span>
                  )}
                </span>
                <span className="option-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-footer">
          <button
            type="button"
            className="nav-button prev"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Vissza
          </button>

          {isLastQuestion ? (
            <button
              type="button"
              className="submit-button"
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              data-testid="submit-quiz"
            >
              {loading ? "Feldolgozom..." : "Ajánlások megjelenítése"}
            </button>
          ) : (
            <button
              type="button"
              className="nav-button next"
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[currentQ.id]}
            >
              Tovább
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
