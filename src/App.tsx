import { useState, useCallback, useRef, useEffect } from "react";
import Notation from "./components/Notation";
import Fingerboard from "./components/Fingerboard";
import {
  newQuizState,
  nextQuestion,
  checkTypedAnswer,
  checkFingerboardAnswer,
} from "./modules/quiz/engine";
import type { Clef } from "./modules/music";
import { ALL_CLEFS } from "./modules/music";
import type { FingerPosition } from "./modules/fingerboard";
import { positionsForNote } from "./modules/fingerboard";
import "./index.css";

export default function App() {
  const [selectedClefs, setSelectedClefs] = useState<Clef[]>([...ALL_CLEFS]);
  const [quiz, setQuiz] = useState(() => newQuizState(selectedClefs));
  const [input, setInput] = useState("");
  const [showPositions, setShowPositions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input on mount and whenever we move to a new question.
  useEffect(() => {
    if (!quiz.answered) {
      inputRef.current?.focus();
    }
  }, [quiz.current, quiz.answered]);

  const toggleClef = useCallback((clef: Clef) => {
    setSelectedClefs((prev) => {
      const next = prev.includes(clef)
        ? prev.filter((c) => c !== clef)
        : [...prev, clef];
      return next.length > 0 ? next : prev;
    });
  }, []);

  const handleRestart = useCallback(() => {
    setQuiz(newQuizState(selectedClefs));
    setInput("");
    setShowPositions(false);
  }, [selectedClefs]);

  const handleNext = useCallback(() => {
    setQuiz((q) => nextQuestion({ ...q, allowedClefs: selectedClefs }));
    setInput("");
    setShowPositions(false);
  }, [selectedClefs]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // If already answered, Enter advances to next question.
      if (quiz.answered) {
        handleNext();
        return;
      }
      if (!input.trim()) return;
      setQuiz((q) => checkTypedAnswer(q, input));
    },
    [quiz.answered, input, handleNext],
  );

  const handlePositionClick = useCallback(
    (pos: FingerPosition) => {
      if (quiz.answered) return;
      setQuiz((q) => checkFingerboardAnswer(q, pos));
    },
    [quiz.answered],
  );

  const positions = positionsForNote(quiz.current.note);

  return (
    <div className="app">
      <header>
        <h1>CelloQuiz</h1>
        <div className="header-controls">
          <div className="clef-selector">
            {ALL_CLEFS.map((clef) => (
              <label key={clef} className="clef-toggle">
                <input
                  type="checkbox"
                  checked={selectedClefs.includes(clef)}
                  onChange={() => toggleClef(clef)}
                />
                {clef}
              </label>
            ))}
            <button className="restart-btn" onClick={handleRestart}>
              Restart
            </button>
          </div>
          <p className="score">
            Score: {quiz.score} / {quiz.total}
          </p>
        </div>
      </header>

      <main className="quiz-layout">
        <section className="notation-panel">
          <h2>What note is this? ({quiz.current.clef} clef)</h2>
          <Notation note={quiz.current.note} clef={quiz.current.clef} />
        </section>

        <section className="fingerboard-panel">
          <h2>Fingerboard — click a position</h2>
          <Fingerboard
            targetNote={showPositions || quiz.answered ? quiz.current.note : ""}
            onPositionClick={handlePositionClick}
          />
        </section>
      </main>

      <footer className="controls">
        <form onSubmit={handleSubmit} className="answer-form">
          <label htmlFor="note-input">Type note name (e.g. C#):</label>
          <input
            ref={inputRef}
            id="note-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={quiz.answered ? "Press Enter for next →" : "e.g. F"}
            autoComplete="off"
            autoFocus
          />
          <button type="submit">
            {quiz.answered ? "Next →" : "Check"}
          </button>
        </form>

        {quiz.answered && (
          <div className={`feedback ${quiz.correct ? "correct" : "wrong"}`}>
            <p>
              {quiz.correct ? "✅ Correct!" : `❌ Wrong — the answer was ${quiz.current.note.replace(/\d+$/, "")}`}
            </p>
            {quiz.userAnswer && <p className="user-answer">You answered: {quiz.userAnswer}</p>}
            <p className="positions-info">
              Playable positions ({positions.length}):
              {positions.map((p) => ` ${p.string}${p.semitone}`).join(", ")}
            </p>
          </div>
        )}

        {!quiz.answered && (
          <button
            className="hint-btn"
            onClick={() => setShowPositions((s) => !s)}
          >
            {showPositions ? "Hide" : "Show"} positions on fingerboard
          </button>
        )}
      </footer>
    </div>
  );
}
