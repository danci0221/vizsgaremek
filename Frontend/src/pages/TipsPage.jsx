import { useState } from "react";
import { tipsCards, prepTips, recoveryTips, nutritionTips, mentalTips, randomTips, motivationalQuotes, quizQuestions } from "../constants";

export default function TipsPage() {
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleQuizAnswer = (index) => {
    setSelectedAnswer(index);
    setQuizAnswered(true);
    if (index === quizQuestions[currentQuiz].correct) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const nextQuiz = () => {
    if (currentQuiz >= quizQuestions.length - 1) {
      setQuizFinished(true);
      return;
    }
    setCurrentQuiz((prev) => prev + 1);
    setQuizAnswered(false);
    setSelectedAnswer(null);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setQuizFinished(false);
    setCurrentQuiz(0);
    setQuizAnswered(false);
    setSelectedAnswer(null);
    setQuizScore(0);
  };

  const restartQuiz = () => {
    setQuizFinished(false);
    setCurrentQuiz(0);
    setQuizAnswered(false);
    setSelectedAnswer(null);
    setQuizScore(0);
  };

  return (
    <>
      <section className="tips-hero" data-testid="tips-page">
        <div className="tips-hero-text">
          <p className="eyebrow">Tippek és tanácsok</p>
          <h2>Edzz okosan: stabil forma, jobb fejlődés, kevesebb sérülés</h2>
          <p className="tips-hero-sub">
            Összegyűjtöttük a leghasznosabb edzés-, táplálkozási és regenerációs tanácsokat, hogy a lehető legtöbbet hozd ki magadból.
          </p>
          <blockquote className="tips-hero-quote">
            „{motivationalQuotes[0]}"
          </blockquote>
        </div>
        <div className="tips-hero-stats">
          <article>
            <strong>{tipsCards.length}</strong>
            <span>Kiemelt tipp</span>
          </article>
          <article>
            <strong>{prepTips.length + recoveryTips.length}</strong>
            <span>Checklist elem</span>
          </article>
          <article>
            <strong>{quizQuestions.length}</strong>
            <span>Kvízkérdés</span>
          </article>
          <article>
            <strong>{nutritionTips.length + mentalTips.length}</strong>
            <span>Wellness tipp</span>
          </article>
        </div>
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

      <section className="tips-quiz" data-testid="tips-quiz-section">
        <div className="tips-quiz-head">
          <h3>Teszteld tudásod!</h3>
          {quizStarted && !quizFinished && (
            <span className="tips-quiz-progress">
              {currentQuiz + 1}/{quizQuestions.length} kérdés
            </span>
          )}
        </div>

        {!quizStarted ? (
          <div className="tips-quiz-start-wrap">
            <p className="tips-quiz-intro">
              Indítsd el a kvízt, és nézd meg, mennyire vagy képben az edzés, regeneráció és táplálkozás témáiban.
            </p>
            <button className="tips-quiz-start" onClick={startQuiz}>
              Kvíz indítása
            </button>
          </div>
        ) : quizFinished ? (
          <div className="tips-quiz-result">
            <p className="tips-quiz-result-score">
              Eredményed: <strong>{quizScore}/{quizQuestions.length}</strong>
            </p>
            <p className="tips-quiz-result-text">
              {quizScore === quizQuestions.length
                ? "Hibátlan teljesítmény, gratulálunk!"
                : quizScore >= Math.ceil(quizQuestions.length * 0.6)
                ? "Szép munka, jó úton haladsz!"
                : "Jó alap, próbáld újra és javíts az eredményen!"}
            </p>
            <button className="tips-quiz-start" onClick={restartQuiz}>
              Újrakezdés
            </button>
          </div>
        ) : (
          <>
            <p className="tips-quiz-question" data-testid="tips-quiz-question">
              <strong>{quizQuestions[currentQuiz].question}</strong>
            </p>
            <div className="tips-quiz-options">
              {quizQuestions[currentQuiz].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(index)}
                  className={`tips-quiz-option ${
                    quizAnswered
                      ? index === quizQuestions[currentQuiz].correct
                        ? "correct"
                        : index === selectedAnswer
                        ? "incorrect"
                        : ""
                      : ""
                  }`}
                  disabled={quizAnswered}
                >
                  {option}
                </button>
              ))}
            </div>
            {quizAnswered && (
              <p
                className={`tips-quiz-feedback ${
                  selectedAnswer === quizQuestions[currentQuiz].correct ? "success" : "error"
                }`}
              >
                {selectedAnswer === quizQuestions[currentQuiz].correct
                  ? "✅ Helyes válasz!"
                  : `❌ Helyes válasz: ${quizQuestions[currentQuiz].options[quizQuestions[currentQuiz].correct]}`}
              </p>
            )}
            <button
              className="tips-quiz-next"
              onClick={nextQuiz}
              data-testid="tips-next-quiz"
              disabled={!quizAnswered}
            >
              {currentQuiz === quizQuestions.length - 1 ? "Eredmény" : "Következő kérdés"}
            </button>
          </>
        )}
      </section>
    </>
  );
}
